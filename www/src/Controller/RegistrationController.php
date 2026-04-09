<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Adress;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route; 
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $entityManager
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['message' => 'L\'email et le mot de passe sont obligatoires'], 400);
        }

        // 1. Création de l'utilisateur
        $user = new User();
        $user->setEmail($data['email']);
        $user->setLastName($data['lastName'] ?? null);
        $user->setFirstName($data['firstName'] ?? null);
        $user->setPseudo($data['pseudo'] ?? null);
        $user->setAvatar($data['avatar'] ?? null);
        
        if (!empty($data['birthday'])) {
            $user->setBirthday(new \DateTime($data['birthday']));
        }

        $user->setPassword($passwordHasher->hashPassword($user, $data['password']));

        // 2. Gestion de l'adresse
        if (isset($data['address']) && is_array($data['address'])) {
            $addrData = $data['address'];
            $address = new Adress();
            
            // On s'assure que les données ne sont pas nulles pour les champs obligatoires
            $address->setNumber((string)($addrData['nbAdress'] ?? '0'));
            $address->setType((string)($addrData['typeVoie'] ?? 'Rue'));
            $address->setLabel((string)($addrData['label'] ?? 'Non précisé'));
            $address->setCity((string)($addrData['city'] ?? 'Non précisée'));
            $address->setCp((int)($addrData['cp'] ?? 0));
            $address->setComplement($addrData['complement'] ?? null);

            // Liaison (le cascade persist de User s'occupe du reste)
            $user->addAdress($address); 
        }
        // 3. Métadonnées obligatoires
        $now = new \DateTime();
        if (method_exists($user, 'setCreatedAt')) { $user->setCreatedAt($now); }
        if (method_exists($user, 'setUpdatedAt')) { $user->setUpdatedAt($now); }
        if (method_exists($user, 'setIsActive')) { $user->setIsActive(true); }
        if (method_exists($user, 'setRoles')) { $user->setRoles(['ROLE_USER']); }

        // 4. Persister l'utilisateur et Flush (Envoi en BDD)
        $entityManager->persist($user);
        
        try {
            $entityManager->flush();
        } catch (\Exception $e) {
            // En cas d'erreur SQL (contrainte, table manquante), on renvoie le détail
            return $this->json([
                'error' => 'Erreur SQL lors de la sauvegarde',
                'detail' => $e->getMessage()
            ], 500);
        }

        return $this->json(['message' => 'Compte créé avec succès !'], 201);
    }
}