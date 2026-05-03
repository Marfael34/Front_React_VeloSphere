<?php

namespace App\Controller;

use App\Entity\Licence;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Security\Http\Attribute\IsGranted;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;

#[Route('/api/licences', name: 'api_licences_')]
class LicenceController extends AbstractController
{
    #[Route('/{id}/files', name: 'upload_files', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function uploadFiles(
        int $id,
        Request $request,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        try {
            $licence = $entityManager->getRepository(Licence::class)->find($id);

            if (!$licence) {
                return $this->json(['message' => 'Licence non trouvée'], 404);
            }

            // Vérification que l'utilisateur est le propriétaire ou admin
            if ($licence->getUser() !== $this->getUser() && !$this->isGranted('ROLE_ADMIN')) {
                return $this->json(['message' => 'Accès refusé'], 403);
            }

            /** @var UploadedFile $idFile */
            $idFile = $request->files->get('identityCard');
            /** @var UploadedFile $medFile */
            $medFile = $request->files->get('medicalCertificate');
            /** @var UploadedFile $photoFile */
            $photoFile = $request->files->get('photo');
            /** @var UploadedFile $sigFile */
            $sigFile = $request->files->get('signature');

            $uploadDir = $this->getParameter('kernel.project_dir') . '/public/uploads/licences';
            
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            if ($idFile) {
                $idFilename = 'id-' . $id . '-' . uniqid() . '.' . $idFile->guessExtension();
                $idFile->move($uploadDir, $idFilename);
                $licence->setIdentityCardPath('/uploads/licences/' . $idFilename);
            }

            if ($medFile) {
                $medFilename = 'med-' . $id . '-' . uniqid() . '.' . $medFile->guessExtension();
                $medFile->move($uploadDir, $medFilename);
                $licence->setMedicalCertificatePath('/uploads/licences/' . $medFilename);
            }

            if ($photoFile) {
                $photoFilename = 'photo-' . $id . '-' . uniqid() . '.' . $photoFile->guessExtension();
                $photoFile->move($uploadDir, $photoFilename);
                $licence->setPhotoPath('/uploads/licences/' . $photoFilename);
            }

            if ($sigFile) {
                $sigFilename = 'sig-' . $id . '-' . uniqid() . '.' . $sigFile->guessExtension();
                $sigFile->move($uploadDir, $sigFilename);
                $licence->setSignaturePath('/uploads/licences/' . $sigFilename);
            }

            $entityManager->flush();

            return $this->json([
                'message' => 'Pièces jointes mises à jour avec succès',
                'identityCardPath' => $licence->getIdentityCardPath(),
                'medicalCertificatePath' => $licence->getMedicalCertificatePath(),
                'photoPath' => $licence->getPhotoPath(),
                'signaturePath' => $licence->getSignaturePath()
            ]);
        } catch (\Exception $e) {
            return $this->json([
                'message' => 'Une erreur est survenue lors de l\'upload',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    #[Route('/{id}/notify-validation', name: 'notify_validation', methods: ['POST'])]
    public function notifyValidation(
        int $id, 
        EntityManagerInterface $em, 
        \Symfony\Component\Mailer\MailerInterface $mailer
    ): JsonResponse {
        $licence = $em->getRepository(Licence::class)->find($id);

        if (!$licence) {
            return new JsonResponse(['error' => 'Licence non trouvée'], 404);
        }

        $targetUser = $licence->getUser();
        if (!$targetUser) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        $priceLicence = $licence->getPriceLicence();
        if (!$priceLicence) {
            return new JsonResponse(['error' => 'La formule de licence est manquante pour cette demande.'], 400);
        }

        try {
            $email = (new TemplatedEmail())
                ->from('no-reply@larouelibre.fr')
                ->to($targetUser->getEmail())
                ->subject('Votre demande de permis BMX a été approuvée !')
                ->htmlTemplate('emails/licence_approved.html.twig')
                ->context([
                    'user' => $targetUser,
                    'licence' => $licence,
                ]);

            $mailer->send($email);

            return new JsonResponse(['message' => 'Email de notification envoyé']);
        } catch (\Exception $e) {
            return new JsonResponse([
                'error' => 'Erreur lors de l\'envoi de l\'email : ' . $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }
}
