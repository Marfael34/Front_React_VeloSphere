<?php

namespace App\Controller;

use App\Entity\Etat;
use App\Entity\Panier;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

class StripeController extends AbstractController
{
    #[Route('/api/create-payment-intent', name: 'api_create_payment_intent', methods: ['POST'])]
    public function createPaymentIntent(EntityManagerInterface $em): JsonResponse
    {
        // 1. Récupérer l'utilisateur
        $user = $this->getUser();

        // 2. Vérification que c'est bien NOTRE entité User
        if (!$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Utilisateur non connecté ou token invalide'], 401);
        }

        // Trouver l'état "En attentes de paiement"
        $etatEnAttente = $em->getRepository(Etat::class)->findOneBy(['label' => 'En attentes de paiement']);

        if (!$etatEnAttente) {
            return new JsonResponse(['error' => 'Erreur de configuration des états'], 500);
        }

        // 3. Récupérer le panier actif
        $panier = $em->getRepository(Panier::class)->findOneBy([
            'user' => $user,
            'etat' => $etatEnAttente
        ]);

        // MODIFICATION ICI : On utilise getItems() au lieu de getProducts()
        if (!$panier || $panier->getItems()->isEmpty()) {
            return new JsonResponse(['error' => 'Votre panier est vide'], 400);
        }

        // 4. Calculer le montant total avec les quantités
        $totalPrice = 0;
        foreach ($panier->getItems() as $item) {
            $product = $item->getProduct();
            if ($product) {
                // On multiplie le prix unitaire par la quantité de l'item (le prix est DÉJÀ en centimes)
                $totalPrice += ($product->getPrice() * $item->getQuantity());
            }
        }

        // Stripe attend un montant en CENTIMES, donc on envoie simplement le total
        $amountInCents = (int) round($totalPrice);

        // 5. Initialiser Stripe avec ta clé secrète
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        try {
            // 6. Créer l'intention de paiement
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents,
                'currency' => 'eur',
                'payment_method_types' => ['card'],
                'metadata' => [
                    'panier_id' => $panier->getId(),
                    'Email' => $user->getUserIdentifier(),
                    'Prénom' => $user->getFirstname(),
                    'Nom' => $user->getLastname(),
                ]
            ]);

            // 7. Renvoyer l'autorisation au front-end
            return new JsonResponse([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}
