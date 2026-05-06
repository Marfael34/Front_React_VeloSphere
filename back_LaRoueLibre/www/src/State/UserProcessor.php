<?php

namespace App\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Entity\User;
use App\Repository\AdressRepository;
use Symfony\Component\DependencyInjection\Attribute\Autowire;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

final class UserProcessor implements ProcessorInterface
{
    public function __construct(
        #[Autowire(service: 'api_platform.doctrine.orm.state.persist_processor')]
        private ProcessorInterface $persistProcessor,
        private UserPasswordHasherInterface $passwordHasher,
        private AdressRepository $adressRepository,
        private \Doctrine\ORM\EntityManagerInterface $entityManager
    ) {
    }

    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): mixed
    {
        // Si ce n'est pas un User, on passe à la suite directement
        if (!$data instanceof User) {
            return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
        }

        // 1. Gestion du mot de passe (si un nouveau a été saisi)
        if ($data->getPlainPassword()) {
            $hashedPassword = $this->passwordHasher->hashPassword(
                $data,
                $data->getPlainPassword()
            );
            $data->setPassword($hashedPassword);
            $data->eraseCredentials();
        }

        // 2. Logique de remplacement d'adresse (Suppression de l'ancienne)
        $newAdresses = $data->getAdresses();
        if (!$newAdresses->isEmpty()) {
            // On récupère toutes les adresses actuelles en BDD pour cet utilisateur avant le flush
            $currentUser = $this->adressRepository->createQueryBuilder('a')
                ->select('u')
                ->from(User::class, 'u')
                ->where('u.id = :id')
                ->setParameter('id', $data->getId())
                ->getQuery()
                ->getOneOrNullResult();

            $oldAdresses = $currentUser ? $currentUser->getAdresses()->toArray() : [];

            foreach ($newAdresses as $adress) {
                if ($adress->getId() === null) {
                    // L'utilisateur a saisi une nouvelle adresse (ou modifié l'existante)
                    
                    // 1. On commence par supprimer les anciennes adresses de l'utilisateur
                    foreach ($oldAdresses as $old) {
                        if ($old->getId() !== null) {
                            $data->removeAdress($old);
                            // On demande la suppression physique de l'ancienne adresse en BDD
                            $this->entityManager->remove($old);
                        }
                    }

                    // 2. On vérifie si la "nouvelle" adresse existe déjà ailleurs en BDD (Deduplication)
                    $existingAdress = $this->adressRepository->findOneBy([
                        'number' => $adress->getNumber(),
                        'type' => $adress->getType(),
                        'label' => $adress->getLabel(),
                        'complement' => $adress->getComplement(),
                        'cp' => $adress->getCp(),
                        'city' => $adress->getCity(),
                    ]);

                    if ($existingAdress) {
                        // Si elle existe, on utilise l'existante au lieu de créer un doublon
                        $data->removeAdress($adress);
                        $data->addAdress($existingAdress);
                    }
                    // Sinon, Doctrine créera la nouvelle adresse automatiquement
                }
            }
        }

        // On persiste l'utilisateur avec les relations corrigées
        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}