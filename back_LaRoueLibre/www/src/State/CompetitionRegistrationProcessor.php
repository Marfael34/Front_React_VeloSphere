<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\CompetitionRegistration;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;

final class CompetitionRegistrationProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private MailerInterface $mailer
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        if (!$data instanceof CompetitionRegistration) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // On persiste d'abord pour s'assurer que tout est ok en BDD
        $result = $this->persistProcessor->process($data, $operation, $uriVariables, $context);

        // Envoyer l'email approprié en fonction de l'opération
        if ($operation instanceof Post) {
            $this->sendRegistrationReceivedEmail($data);
        } elseif ($operation instanceof Patch) {
            if ($data->getStatus() === 'Confirmé') {
                $this->sendRegistrationAcceptedEmail($data);
            } elseif ($data->getStatus() === 'Annulé' || $data->getStatus() === 'Refusé') {
                $this->sendRegistrationRefusedEmail($data);
            }
        }

        return $result;
    }

    private function getEmailTemplate(string $title, string $message, string $details): string
    {
        return sprintf('
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #ff6600, #ff3300); padding: 30px 20px; text-align: center; }
                    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-style: italic; text-transform: uppercase; letter-spacing: 2px; }
                    .content { padding: 30px; color: #333333; line-height: 1.6; }
                    .content p { margin: 0 0 15px; font-size: 16px; }
                    .details { background-color: #f9f9f9; border-left: 4px solid #ff6600; padding: 20px; margin: 25px 0; border-radius: 4px; }
                    .details p { margin: 5px 0; font-size: 14px; }
                    .footer { background-color: #222222; color: #888888; text-align: center; padding: 20px; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>La Roue Libre</h1>
                    </div>
                    <div class="content">
                        <h2 style="color: #111111; margin-top: 0; font-size: 22px;">%s</h2>
                        %s
                        <div class="details">
                            %s
                        </div>
                        <p>Sportivement,<br><strong>L\'équipe La Roue Libre</strong></p>
                    </div>
                    <div class="footer">
                        Cet email a été envoyé automatiquement, merci de ne pas y répondre.<br>
                        &copy; 2026 La Roue Libre BMX
                    </div>
                </div>
            </body>
            </html>
        ', $title, $message, $details);
    }

    private function getCommonDetails(CompetitionRegistration $registration): string
    {
        $competition = $registration->getCompetition();
        return sprintf(
            '<p><strong>Compétition :</strong> %s</p>' .
            '<p><strong>Date :</strong> %s</p>' .
            '<p><strong>Lieu :</strong> %s</p>' .
            '<hr style="border: 0; border-top: 1px solid #ddd; margin: 15px 0;">' .
            '<p><strong>Pilote :</strong> %s %s</p>' .
            '<p><strong>Catégorie :</strong> %s</p>' .
            '<p><strong>Club :</strong> %s</p>' .
            '<p><strong>Plaque :</strong> %s</p>',
            $competition->getTitle(),
            $competition->getStartAt()?->format('d/m/Y H:i') ?? 'À confirmer',
            $competition->getLocation() ?? 'Lieu à confirmer',
            $registration->getFirstName(),
            $registration->getLastName(),
            $registration->getCategory(),
            $registration->getClub(),
            $registration->getPlateNumber()
        );
    }

    private function sendRegistrationReceivedEmail(CompetitionRegistration $registration): void
    {
        $user = $registration->getUser();
        if (!$user) return;

        $title = 'Demande d\'inscription reçue';
        $message = sprintf('<p>Bonjour %s,</p><p>Votre demande d\'inscription a bien été transmise à notre équipe. Elle est actuellement <strong>en attente de validation</strong> par un administrateur.</p><p>Vous recevrez un nouvel email dès que votre inscription sera confirmée ou refusée.</p>', $user->getFirstname());
        $details = $this->getCommonDetails($registration);

        $this->sendEmail($user->getEmail(), 'Demande d\'inscription en attente : ' . $registration->getCompetition()->getTitle(), $this->getEmailTemplate($title, $message, $details));
    }

    private function sendRegistrationAcceptedEmail(CompetitionRegistration $registration): void
    {
        $user = $registration->getUser();
        if (!$user) return;

        $title = 'Inscription Confirmée ! 🏆';
        $message = sprintf('<p>Félicitations %s,</p><p>Votre inscription a été <strong>validée avec succès</strong> ! Préparez-vous pour la course.</p>', $user->getFirstname());
        $details = $this->getCommonDetails($registration);

        $this->sendEmail($user->getEmail(), 'Inscription confirmée : ' . $registration->getCompetition()->getTitle(), $this->getEmailTemplate($title, $message, $details));
    }

    private function sendRegistrationRefusedEmail(CompetitionRegistration $registration): void
    {
        $user = $registration->getUser();
        if (!$user) return;

        $title = 'Inscription Refusée / Annulée';
        $message = sprintf('<p>Bonjour %s,</p><p>Malheureusement, votre demande d\'inscription n\'a pas pu être validée et a été <strong>refusée ou annulée</strong>.</p><p>Veuillez vérifier les informations fournies (notamment votre permis) et soumettre une nouvelle demande si nécessaire.</p>', $user->getFirstname());
        $details = $this->getCommonDetails($registration);

        $this->sendEmail($user->getEmail(), 'Inscription refusée : ' . $registration->getCompetition()->getTitle(), $this->getEmailTemplate($title, $message, $details));
    }

    private function sendEmail(string $to, string $subject, string $htmlBody): void
    {
        $email = (new Email())
            ->from('noreply@larouelibre.fr')
            ->to($to)
            ->subject($subject)
            ->html($htmlBody);

        try {
            $this->mailer->send($email);
        } catch (\Exception $e) {
            error_log("Erreur lors de l'envoi de l'email : " . $e->getMessage());
        }
    }
}
