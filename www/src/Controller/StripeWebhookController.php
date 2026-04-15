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
        $logger->info('=== WEBHOOK STRIPE REÇU ===');

        $payload = $request->getContent();
        $event = json_decode($payload);

        if ($event && $event->type === 'payment_intent.succeeded') {
            $paymentIntent = $event->data->object;
            $panierId = $paymentIntent->metadata->panier_id ?? null;

            $logger->info("Paiement réussi pour le panier ID : " . $panierId);

            if ($panierId) {
                $panier = $em->getRepository(Panier::class)->find($panierId);
                
                if ($panier) {
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
                        
                        // 2. TRANSFERER ET DÉCRÉMENTER LE STOCK
                        foreach ($panier->getProducts() as $product) {
                            $order->addProduct($product);       // Ajout à la facture
                            $panier->removeProduct($product);   // Vidage du panier
                            
                            // ---- DÉDUCTION DU STOCK ----
                            $currentQuantity = $product->getQuantity();
                            // On retire 1, en s'assurant mathématiquement de ne jamais passer en négatif
                            $newQuantity = max(0, $currentQuantity - 1); 
                            $product->setQuantity($newQuantity);
                        }

                        // 3. CHANGER L'ÉTAT DU PANIER
                        $panier->setEtat($etatPaye);

                        $em->persist($order);
                        $em->flush(); // Sauvegarde la facture, le panier vide ET les nouveaux stocks !

                        $logger->info("SUCCÈS : Commande créée, panier vidé et stocks mis à jour.");
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