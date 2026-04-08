<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Adress;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
// C'EST CETTE LIGNE QUI CHANGE TOUT :
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

        $user = new User();
        $user->setEmail($data['email']);
        $user->setLastName($data['lastName'] ?? null);
        $user->setFirstName($data['firstName'] ?? null);
        $user->setPseudo($data['pseudo'] ?? null);
        
        if (!empty($data['birthday'])) {
            $user->setBirthday(new \DateTime($data['birthday']));
        }

        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        if (isset($data['address'])) {
            $addrData = $data['address'];
            $address = new Adress();
            
            $address->setNumber($addrData['nbAdress'] ?? null);
            $address->setType($addrData['typeVoie'] ?? null);
            $address->setLabel($addrData['label'] ?? null);
            $address->setComplement($addrData['complement'] ?? null);
            $address->setCity($addrData['city'] ?? null);
            $address->setCp($addrData['cp'] ?? null);

            $entityManager->persist($address);
            $user->addAdress($address); 
        }

        if (method_exists($user, 'setCreatedAt')) {
            $user->setCreatedAt(new \DateTime());
        }
        
        // Si vous avez aussi "updated_at" obligatoire (ce que montre votre log SQL)
        if (method_exists($user, 'setUpdatedAt')) {
            $user->setUpdatedAt(new \DateTime());
        }

        // Si vous avez "is_active" (pour dire que le compte n'est pas banni/désactivé)
        if (method_exists($user, 'setIsActive')) {
            $user->setIsActive(true); // true = 1 en SQL
        }

        if(method_exists($user, 'setRoles')){
            $user->setRoles(['ROLE_USER']);
        }

        $entityManager->persist($user);
        $entityManager->flush();

        return $this->json(['message' => 'Compte créé avec succès !'], 201);
    }
}