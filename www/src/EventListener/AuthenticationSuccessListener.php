<?php

namespace App\EventListener;

use Lexik\Bundle\JWTAuthenticationBundle\Event\AuthenticationSuccessEvent;
use App\Entity\User;

class AuthenticationSuccessListener
{
    public function onAuthenticationSuccessResponse(AuthenticationSuccessEvent $event)
    {
        $data = $event->getData();
        $user = $event->getUser();

        // 2. On vérifie que c'est bien TON entité User (et plus UserInterface)
        if (!$user instanceof User) {
            return;
        }

        // Maintenant, Intelephense sait que $user possède ces méthodes !
        $data['id'] = $user->getId();
        $data['firstName'] = $user->getFirstname();
        $data['lastName'] = $user->getLastname();
        $data['pseudo'] = $user->getPseudo();

        $event->setData($data);
    }
}