<?php
namespace App\Controller;

use App\Entity\Etat;
use App\Entity\Order;
use App\Entity\Panier;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class StripeWebhookController extends AbstractController
{
    #[Route('/api/stripe/webhook', name: 'api_stripe_webhook', methods: ['POST'])]
    public function handleWebhook(Request $request, EntityManagerInterface $em, LoggerInterface $logger): Response
    {
        // 1. On signale que le webhook a été touché !
        $logger->info('=== WEBHOOK STRIPE REÇU ===');

        $payload = $request->getContent();
        $event = json_decode($payload);

        // Si le paiement est validé
        if ($event && $event->type === 'payment_intent.succeeded') {
            $paymentIntent = $event->data->object;
            $panierId = $paymentIntent->metadata->panier_id ?? null;

            $logger->info("Paiement réussi pour le panier ID : " . $panierId);

            if ($panierId) {
                $panier = $em->getRepository(Panier::class)->find($panierId);
                
                if ($panier) {
                    // Recherche de l'état (avec sécurité LIKE pour éviter les erreurs d'orthographe de la BDD)
                    $etatPaye = $em->getRepository(Etat::class)
                        ->createQueryBuilder('e')
                        ->where('e.label LIKE :motCle')
                        ->setParameter('motCle', '%Payées%')
                        ->setMaxResults(1)
                        ->getQuery()
                        ->getOneOrNullResult();

                    if ($etatPaye) {
                        // 1. COPIER DANS LA TABLE ORDER
                        $order = new Order();
                        $order->setUser($panier->getUser());
                        $order->setEtat($etatPaye);
                        
                        // On boucle sur les produits
                        foreach ($panier->getProducts() as $product) {
                            $order->addProduct($product);       // Ajout à la facture
                            $panier->removeProduct($product);   // VIDAGE DU PANIER INITIAL
                        }

                        // 2. CHANGER L'ÉTAT DU PANIER
                        $panier->setEtat($etatPaye);

                        // On sauvegarde en base de données
                        $em->persist($order);
                        $em->flush();

                        $logger->info("SUCCÈS : Commande créée, panier vidé et mis à jour en 'Payées'.");
                    } else {
                        $logger->error("ERREUR : État 'Payées' introuvable en base de données.");
                    }
                } else {
                    $logger->error("ERREUR : Panier introuvable en base.");
                }
            }
        }

        return new Response('Webhook traité', 200);
    }
}