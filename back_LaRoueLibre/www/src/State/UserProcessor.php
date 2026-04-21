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
        private AdressRepository $adressRepository // Ajout du repository pour chercher les adresses
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

        // 2. Déduplication des adresses
        foreach ($data->getAdresses() as $adress) {
            // Si l'adresse n'a pas d'ID, c'est qu'elle vient d'être créée par le payload JSON de React
            if ($adress->getId() === null) {
                // On cherche si une adresse avec exactement les mêmes champs existe déjà en BDD
                $existingAdress = $this->adressRepository->findOneBy([
                    'number' => $adress->getNumber(),
                    'type' => $adress->getType(),
                    'label' => $adress->getLabel(),
                    'complement' => $adress->getComplement(),
                    'cp' => $adress->getCp(),
                    'city' => $adress->getCity(),
                ]);

                if ($existingAdress) {
                    // Si elle existe, on retire la nouvelle adresse générée
                    $data->removeAdress($adress);
                    // Et on associe l'utilisateur à l'adresse existante à la place
                    $data->addAdress($existingAdress);
                }
            }
        }

        // On persiste l'utilisateur avec les relations corrigées
        return $this->persistProcessor->process($data, $operation, $uriVariables, $context);
    }
}