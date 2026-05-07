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

            // LOGGING DEBUG
            error_log("Tentative d'upload pour licence ID: " . $id);
            error_log("Fichiers reçus: " . implode(', ', array_keys($request->files->all())));

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

            if ($photoFile) error_log("Photo reçue: " . $photoFile->getClientOriginalName());
            if ($sigFile) error_log("Signature reçue: " . $sigFile->getClientOriginalName());

            $uploadRootDir = $this->getParameter('kernel.project_dir') . '/public/uploads/licences';
            $user = $licence->getUser();
            $safeName = $user ? str_replace([' ', "'"], '_', strtoupper($user->getLastname()) . '_' . ucfirst($user->getFirstname())) : 'ANONYMOUS';

            if ($idFile) {
                $subDir = $uploadRootDir . '/identite';
                if (!file_exists($subDir)) mkdir($subDir, 0777, true);
                $idFilename = 'ID_' . $safeName . '_' . $id . '.' . $idFile->guessExtension();
                $idFile->move($subDir, $idFilename);
                $licence->setIdentityCardPath('/uploads/licences/identite/' . $idFilename);
            }

            if ($medFile) {
                $subDir = $uploadRootDir . '/medical';
                if (!file_exists($subDir)) mkdir($subDir, 0777, true);
                $medFilename = 'MED_' . $safeName . '_' . $id . '.' . $medFile->guessExtension();
                $medFile->move($subDir, $medFilename);
                $licence->setMedicalCertificatePath('/uploads/licences/medical/' . $medFilename);
            }

            if ($photoFile) {
                $subDir = $uploadRootDir . '/photos';
                if (!file_exists($subDir)) mkdir($subDir, 0777, true);
                $photoFilename = 'PHOTO_' . $safeName . '_' . $id . '.' . $photoFile->guessExtension();
                $photoFile->move($subDir, $photoFilename);
                $licence->setPhotoPath('/uploads/licences/photos/' . $photoFilename);
            }

            if ($sigFile) {
                $subDir = $uploadRootDir . '/signatures';
                if (!file_exists($subDir)) mkdir($subDir, 0777, true);
                $sigFilename = 'SIG_' . $safeName . '_' . $id . '.' . $sigFile->guessExtension();
                $sigFile->move($subDir, $sigFilename);
                $licence->setSignaturePath('/uploads/licences/signatures/' . $sigFilename);
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

    #[Route('/{id}/notify-success', name: 'notify_validation', methods: ['POST'])]
    #[IsGranted('ROLE_ADMIN')]
    public function notifyValidation(
        int $id, 
        EntityManagerInterface $em, 
        \Symfony\Component\Mailer\MailerInterface $mailer
    ): JsonResponse {
        $currentUser = $this->getUser();
        if (!$currentUser) {
            error_log("Tentative d'appel notifyValidation sans authentification");
            return new JsonResponse(['message' => 'Unauthorized'], 401);
        }
        
        error_log("Notification de validation pour licence ID: " . $id . " par " . $currentUser->getUserIdentifier());
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
            error_log("Préparation de l'email pour : " . $targetUser->getEmail());
            $email = (new TemplatedEmail())
                ->from('no-reply@larouelibre.fr')
                ->to($targetUser->getEmail())
                ->subject('Votre demande de permis BMX a été approuvée !')
                ->htmlTemplate('emails/licence_approved.html.twig')
                ->context([
                    'user' => $targetUser,
                    'licence' => $licence,
                ]);

            error_log("Envoi de l'email...");
            $mailer->send($email);
            error_log("Email envoyé avec succès.");

            return new JsonResponse(['message' => 'Email de notification envoyé']);
        } catch (\Throwable $e) {
            error_log("Erreur critique notifyValidation : " . $e->getMessage());
            return new JsonResponse([
                'error' => 'Erreur lors de l\'envoi de l\'email : ' . $e->getMessage(),
                'type' => get_class($e)
            ], 500);
        }
    }
}
