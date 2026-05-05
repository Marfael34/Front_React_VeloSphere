<?php

namespace App\Controller;

use App\Entity\CompetitionRegistration;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/competition_registrations', name: 'api_competition_registrations_')]
class CompetitionRegistrationController extends AbstractController
{
    #[Route('/{id}/licence', name: 'upload_licence', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function uploadLicence(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $registration = $entityManager->getRepository(CompetitionRegistration::class)->find($id);

            if (!$registration) {
                return $this->json(['message' => 'Inscription non trouvée'], 404);
            }

            // Vérification que l'utilisateur est le propriétaire ou admin
            if ($registration->getUser() !== $this->getUser() && !$this->isGranted('ROLE_ADMIN')) {
                return $this->json(['message' => 'Accès refusé'], 403);
            }

            /** @var UploadedFile $file */
            $file = $request->files->get('licence');

            if (!$file) {
                return $this->json(['message' => 'Aucun fichier reçu (le champ doit se nommer "licence")'], 400);
            }

            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/registrations';
            
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $filename = 'licence-' . $id . '-' . uniqid() . '.' . $file->guessExtension();
            $file->move($uploadDir, $filename);
            
            $registration->setLicencePath('/uploads/registrations/' . $filename);

            $entityManager->flush();

            return $this->json([
                'message' => 'Permis ajouté avec succès',
                'licencePath' => $registration->getLicencePath()
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de l\'upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
