<?php

namespace App\Controller;

use App\Entity\Products;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\String\Slugger\SluggerInterface;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ProductController extends AbstractController
{
    #[Route('/api/products/{id}/image', name: 'api_product_image', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function uploadImage(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager,
        SluggerInterface $slugger
    ): JsonResponse {
        try {
            $product = $entityManager->getRepository(Products::class)->find($id);

            if (!$product) {
                return $this->json(['message' => 'Produit non trouvé'], 404);
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

            $originalFilename = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $safeFilename = $slugger->slug($originalFilename);
            $newFilename = 'product-' . $id . '-' . uniqid() . '.' . $file->guessExtension();

            // Utilisation de public/uploads qui est déjà 777
            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads';
            
            $file->move($uploadDir, $newFilename);

            // Supprimer l'ancienne image s'il existe
            $this->deletePhysicalImage($product);

            // On enregistre le chemin relatif public
            $product->setImagePath('/uploads/' . $newFilename);
            $entityManager->flush();

            return $this->json([
                'message' => 'Image du produit mise à jour avec succès',
                'imagePath' => '/uploads/' . $newFilename
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de l\'upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/api/products/{id}/image', name: 'api_product_image_delete', methods: ['DELETE'])]
    #[IsGranted('ROLE_ADMIN')]
    public function deleteImage(
        int $id,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $product = $entityManager->getRepository(Products::class)->find($id);

            if (!$product) {
                return $this->json(['message' => 'Produit non trouvé'], 404);
            }

            $this->deletePhysicalImage($product);

            // Utilisation d'une chaine vide pour éviter l'erreur NOT NULL si la BDD n'est pas à jour
            $product->setImagePath(""); 
            $entityManager->flush();

            return $this->json(['message' => 'Image du produit supprimée avec succès']);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de la suppression',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    private function deletePhysicalImage(Products $product): void
    {
        $imagePath = $product->getImagePath();
        if ($imagePath && !empty($imagePath)) {
            // Nettoyage des préfixes pour trouver le nom du fichier
            $filename = str_replace(['/uploads/products/', '/images/products/', '/uploads/'], '', $imagePath);
            
            $paths = [
                $this->getParameter('kernel.project_dir') . '/public/uploads/' . $filename,
                $this->getParameter('kernel.project_dir') . '/public/images/products/' . $filename,
                $this->getParameter('kernel.project_dir') . '/public/uploads/products/' . $filename
            ];

            foreach ($paths as $path) {
                if (file_exists($path) && !is_dir($path)) {
                    @unlink($path);
                }
            }
        }
    }
}
