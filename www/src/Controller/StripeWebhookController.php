<?php
namespace App\Controller;

use App\Entity\Etat;
use App\Entity\Order;
use App\Entity\Panier;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

class StripeWebhookController extends AbstractController
{
    #[Route('/api/stripe/webhook', name: 'stripe_webhook', methods: ['POST'])]
    public function handleWebhook(Request $request, EntityManagerInterface $em): Response
    {
        $payload = $request->getContent();
        $event = json_decode($payload);

        // Si le paiement est réussi
        if ($event && $event->type === 'payment_intent.succeeded') {
            $paymentIntent = $event->data->object;
            $panierId = $paymentIntent->metadata->panier_id ?? null;

            if ($panierId) {
                $panier = $em->getRepository(Panier::class)->find($panierId);
                $etatPaye = $em->getRepository(Etat::class)->findOneBy(['label' => 'Payées']);

                if ($panier && $etatPaye) {
                    // 1. On change l'état du panier
                    $panier->setEtat($etatPaye);

                    // 2. On crée une COPIE dans la table Order pour l'historique/facture
                    $order = new Order();
                    $order->setUser($panier->getUser());
                    $order->setEtat($etatPaye);
                    foreach ($panier->getProducts() as $product) {
                        $order->addProduct($product);
                    }

                    $em->persist($order);
                    $em->flush();
                }
            }
        }
        return new Response('Succès', 200);
    }
}