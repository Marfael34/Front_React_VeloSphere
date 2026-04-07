<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

class ApiController extends AbstractController
{
    #[Route('/api', name: 'api', methods: ['GET'])]
    #[IsGranted('ROLE_ADMIN')]
    public function api(): JsonResponse
    {
        $user = $this->getUser();

        return $this->json([
            'message' => 'Bravo, vous avez accès à la zone protégée !',
            'user' => $user ? $user->getUserIdentifier() : 'inconnu'
        ]);
    }
}