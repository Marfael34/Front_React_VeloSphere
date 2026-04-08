<?php

namespace App\Controller;

use App\Entity\User;
use App\Entity\Adress;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class RegistrationController extends AbstractController
{
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function register(
        Request $request, 
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $entityManager
    ): JsonResponse {
        // 1. Récupérer le contenu JSON envoyé par React
        $data = json_decode($request->getContent(), true);

        // Vérification basique (pour éviter les erreurs SQL)
        if (empty($data['email']) || empty($data['password'])) {
            return $this->json(['message' => 'L\'email et le mot de passe sont obligatoires'], 400);
        }

        // 2. Création de l'entité User
        $user = new User();
        $user->setEmail($data['email']);
        $user->setLastName($data['lastName'] ?? null);
        $user->setFirstName($data['firstName'] ?? null);
        $user->setPseudo($data['pseudo'] ?? null);
        
        // Conversion de la chaîne de date "YYYY-MM-DD" en objet DateTime pour Symfony
        if (!empty($data['birthday'])) {
            $user->setBirthday(new \DateTime($data['birthday']));
        }

        // 3. Hachage du mot de passe
        $hashedPassword = $passwordHasher->hashPassword($user, $data['password']);
        $user->setPassword($hashedPassword);

        // 4. Création de l'entité Address (si les données sont présentes)
        if (isset($data['address'])) {
            $addrData = $data['address'];
            $address = new Adress();
            
            $address->setNumber($addrData['nbAdress'] ?? null);
            $address->setType($addrData['typeVoie'] ?? null);
            $address->setLabel($addrData['label'] ?? null);
            // On gère le complément (qui peut être null)
            $address->setComplement($addrData['complement'] ?? null);
            $address->setCity($addrData['city'] ?? null);
            $address->setCp($addrData['cp'] ?? null);

            // On demande à Doctrine de préparer la sauvegarde de l'adresse
            $entityManager->persist($address);

            // 5. On lie l'adresse à l'utilisateur ! (La magie opère ici)
            $user->setAdress($address);
        }

        // 6. On demande à Doctrine de préparer la sauvegarde de l'utilisateur
        $entityManager->persist($user);

        // 7. On exécute la requête SQL (INSERT)
        $entityManager->flush();

        // 8. On renvoie une réponse de succès à React
        return $this->json([
            'message' => 'Compte créé avec succès !'
        ], 201); // 201 = Created
    }
}