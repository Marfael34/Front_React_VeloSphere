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

        // 2. VÉRIFICATION CRUCIALE : On s'assure que c'est bien NOTRE entité User
        if (!$user instanceof \App\Entity\User) {
            return new JsonResponse(['error' => 'Utilisateur non connecté ou token invalide'], 401);
        }
        // 2. Trouver l'état "En attentes de paiement" (Nom exact d'après tes Fixtures)
       // On remet la recherche exacte avec l'orthographe exacte de la base de données
        $etatEnAttente = $em->getRepository(Etat::class)->findOneBy(['label' => 'En attentes de paiement']);
        
        if (!$etatEnAttente) {
            return new JsonResponse(['error' => 'Erreur de configuration des états'], 500);
        }

        // 3. Récupérer le panier actif de cet utilisateur précis
        $panier = $em->getRepository(Panier::class)->findOneBy([
            'user' => $user,
            'etat' => $etatEnAttente
        ]);

        if (!$panier || $panier->getProducts()->isEmpty()) {
            return new JsonResponse(['error' => 'Votre panier est vide'], 400);
        }

        // 4. Calculer le montant total du panier de façon sécurisée (côté serveur !)
        $totalPrice = 0;
        foreach ($panier->getProducts() as $product) {
            $totalPrice += $product->getPrice();
        }

        // Stripe attend un montant en CENTIMES et entier (ex: 154.50€ devient 15450)
        $amountInCents = (int) round($totalPrice * 100);

        // 5. Initialiser Stripe avec ta clé secrète (depuis le .env)
        Stripe::setApiKey($_ENV['STRIPE_SECRET_KEY']);

        try {
            // 6. Créer l'intention de paiement avec le vrai montant
            $paymentIntent = PaymentIntent::create([
                'amount' => $amountInCents, 
                'currency' => 'eur',
                // ligne pour tout les méthode de paiment
                // 'automatic_payment_methods' => [
                //     'enabled' => true,
                // ],

                // Force uniquement la carte bancaire
                'payment_method_types' => ['card'], 
                // Optionnel mais très utile : on attache l'ID du panier à ce paiement 
                // pour le retrouver facilement plus tard (dans le Webhook par exemple)
                'metadata' => [
                    'panier_id' => $panier->getId(),
                    'Email' => $user->getUserIdentifier(),
                    'Prénom' => $user->getFirstname(), 
                    'Nom' => $user->getLastname(),
                ]
            ]);

            // 7. Renvoyer l'autorisation au front-end React
            return new JsonResponse([
                'clientSecret' => $paymentIntent->client_secret,
            ]);
        } catch (\Exception $e) {
            return new JsonResponse(['error' => $e->getMessage()], 500);
        }
    }
}