<?php

namespace App\Controller;

use App\Entity\Places;
use App\Entity\Wishlist;
use App\Repository\EtatRepository;
use App\Repository\WishlistRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Vérifie que cette route de base est bien là
#[Route('/api/wishlist', name: 'api_wishlist_')]
class WishlistController extends AbstractController
{
    #[Route('/me', name: 'my_wishlist', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getUserWishlist(WishlistRepository $wishlistRepository): JsonResponse
    {
        $user = $this->getUser();
        // Récupère uniquement les entrées de la table wishlist pour cet utilisateur
        $wishlistItems = $wishlistRepository->findBy(['user' => $user]);

        $data = array_map(function(Wishlist $item) {
            $place = $item->getPlace();
            return [
                'id' => $item->getId(),
                'placeId' => $place->getId(),
                'placeName' => $place->getName(),
                'placeDescription' => $place->getDescription(),
                'placeImg' => $place->getPath(),
                'placeDifficulty' => $place->getDifficulty(),
                'etatId' => $item->getEtat()->getId(),
            ];
        }, $wishlistItems);

        return new JsonResponse($data, Response::HTTP_OK);
    }

    #[Route('/toggle/{id}', name: 'toggle', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function toggle(Places $place, EntityManagerInterface $em, WishlistRepository $repo, EtatRepository $etatRepo): JsonResponse 
    {
        $user = $this->getUser();
        $item = $repo->findOneBy(['user' => $user, 'place' => $place]);

        if ($item) {
            $em->remove($item);
            $em->flush();
            return new JsonResponse(['isFavorite' => false]);
        }

        $etat = $etatRepo->findOneBy(['label' => 'Favoris']);
        $new = new Wishlist();
        $new->setUser($user);
        $new->setPlace($place);
        $new->setEtat($etat);
        $em->persist($new);
        $em->flush();

        return new JsonResponse(['isFavorite' => true]);
    }
}