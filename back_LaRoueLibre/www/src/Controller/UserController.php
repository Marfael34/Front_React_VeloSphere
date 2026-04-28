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

            // Vérification de la sécurité : Admin ou l'utilisateur lui-même
            if (!$this->isGranted('ROLE_ADMIN') && $this->getUser() !== $user) {
                return $this->json(['message' => 'Accès refusé'], 403);
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
                $this->getParameter('kernel.project_dir') . '/public/uploads',
                $newFilename
            );

            // Optionnel : Supprimer l'ancien avatar s'il existe
            $oldAvatar = $user->getAvatar();
            if ($oldAvatar) {
                // On retire le préfixe '/uploads/' si présent pour trouver le fichier sur le disque
                $filename = str_replace('/uploads/', '', $oldAvatar);
                $oldAvatarPath = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $filename;
                if (file_exists($oldAvatarPath) && !is_dir($oldAvatarPath)) {
                    @unlink($oldAvatarPath);
                }
            }

            $user->setAvatar('/uploads/' . $newFilename);
            $entityManager->flush();

            return $this->json([
                'message' => 'Avatar mis à jour avec succès',
                'avatar' => $newFilename
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de l\'upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/users/{id}/avatar', name: 'api_user_avatar_delete', methods: ['DELETE'])]
    public function deleteAvatar(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $user = $entityManager->getRepository(User::class)->find($id);

            if (!$user) {
                return $this->json(['message' => 'Utilisateur non trouvé'], 404);
            }

            // Sécurité : Admin ou l'utilisateur lui-même
            if (!$this->isGranted('ROLE_ADMIN') && $this->getUser() !== $user) {
                return $this->json(['message' => 'Accès refusé'], 403);
            }

            $avatar = $user->getAvatar();
            if ($avatar) {
                $filename = str_replace('/uploads/', '', $avatar);
                $avatarPath = $this->getParameter('kernel.project_dir') . '/public/uploads/' . $filename;
                if (file_exists($avatarPath) && !is_dir($avatarPath)) {
                    @unlink($avatarPath);
                }
                
                $user->setAvatar(null);
                $entityManager->flush();
            }

            return $this->json(['message' => 'Avatar supprimé avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
