<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class UserController extends AbstractController
{
    #[Route('/api/users/{id}/avatar', name: 'api_user_avatar', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function uploadAvatar(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        try {
            $user = $entityManager->getRepository(User::class)->find($id);

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non trouvé'], 404);
            }

            /** @var UploadedFile $file */
            $file = $request->files->get('file');

            if (!$file) {
                return $this->json(['message' => 'Aucun fichier reçu'], 400);
            }

            // Validation du type de fichier
            $allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
            if (!in_array($file->getMimeType(), $allowedTypes)) {
                return $this->json(['message' => 'Le fichier doit être une image (JPEG, PNG, WEBP, GIF)'], 400);
            }

            // Validation de la taille (max 2 Mo)
            if ($file->getSize() > 2 * 1024 * 1024) {
                return $this->json(['message' => 'Le fichier est trop volumineux (max 2 Mo)'], 400);
            }

            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = $safeFilename . '-' . uniqid() . '.' . $file->guessExtension();

            $file->move(
                $this->getParameter('kernel.project_dir') . '/public/images/avatars',
                $newFilename
            );

            // Optionnel : Supprimer l'ancien avatar s'il existe
            $oldAvatar = $user->getAvatar();
            if ($oldAvatar) {
                $oldAvatarPath = $this->getParameter('kernel.project_dir') . '/public/images/avatars/' . $oldAvatar;
                if (file_exists($oldAvatarPath) && !is_dir($oldAvatarPath)) {
                    @unlink($oldAvatarPath);
                }
            }

            $user->setAvatar($newFilename);
            $entityManager->flush();

            return $this->json([
                'message' => 'Avatar mis à jour avec succès',
                'avatar' => $newFilename
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de l\'upload',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
