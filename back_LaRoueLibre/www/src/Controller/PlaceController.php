<?php

namespace App\Controller;

use App\Entity\Places;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class PlaceController extends AbstractController
{
    #[Route('/api/places/{id}/image', name: 'api_place_image', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function uploadImage(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        try {
            $place = $entityManager->getRepository(Places::class)->find($id);

            if (!$place) {
                return $this->json(['message' => 'Lieu non trouvé'], 404);
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

            // Validation de la taille (max 5 Mo)
            if ($file->getSize() > 5 * 1024 * 1024) {
                return $this->json(['message' => 'Le fichier est trop volumineux (max 5 Mo)'], 400);
            }

            $newFilename = 'place-' . $id . '-' . uniqid() . '.' . $file->guessExtension();

            // Utilisation de public/uploads qui est déjà 777
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
            
            $file->move($uploadDir, $newFilename);

            // Supprimer l'ancienne image s'il existe
            $this->deletePhysicalImage($place);

            // On enregistre le chemin relatif public (champ "path" pour les lieux)
            $place->setPath('/uploads/' . $newFilename);
            $entityManager->flush();

            return $this->json([
                'message' => 'Image du lieu mise à jour avec succès',
                'imagePath' => '/uploads/' . $newFilename
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de l\'upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/places/{id}/image', name: 'api_place_image_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteImage(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $place = $entityManager->getRepository(Places::class)->find($id);

            if (!$place) {
                return $this->json(['message' => 'Lieu non trouvé'], 404);
            }

            $this->deletePhysicalImage($place);

            $place->setPath(""); 
            $entityManager->flush();

            return $this->json(['message' => 'Image du lieu supprimée avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function deletePhysicalImage(Places $place): void
    {
        $imagePath = $place->getPath();
        if ($imagePath && !empty($imagePath)) {
            $filename = str_replace(['/uploads/places/', '/images/places/', '/uploads/'], '', $imagePath);
            
            $paths = [
                $this->getParameter('kernel.project_dir') . '/public/uploads/' . $filename,
                $this->getParameter('kernel.project_dir') . '/public/images/places/' . $filename,
                $this->getParameter('kernel.project_dir') . '/public/uploads/places/' . $filename
            ];

            foreach ($paths as $path) {
                if (file_exists($path) && !is_dir($path)) {
                    @unlink($path);
                }
            }
        }
    }
}
