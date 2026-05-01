<?php
require 'vendor/autoload.php';

use App\Entity\Competition;
use App\Kernel;
use Symfony\Component\Dotenv\Dotenv;

(new Dotenv())->bootEnv(__DIR__ . '/.env');

$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();

$container = $kernel->getContainer();
$em = $container->get('doctrine.orm.entity_manager');

$competitions = [
    [
        'title' => 'Open BMX La Roue Libre',
        'description' => 'Compétition régionale ouverte à tous les niveaux. Venez défier les meilleurs pilotes de la région sur notre piste technique.',
        'location' => 'Piste BMX de Montpellier',
        'startAt' => new \DateTime('2026-06-15 09:00:00'),
        'endAt' => new \DateTime('2026-06-15 18:00:00'),
        'maxPeople' => 100,
    ],
    [
        'title' => 'Championnat de France - Round 3',
        'description' => 'Le haut niveau du BMX français se réunit pour une étape cruciale du championnat. Spectacle garanti !',
        'location' => 'Stade BMX de Saint-Etienne',
        'startAt' => new \DateTime('2026-07-04 10:00:00'),
        'endAt' => new \DateTime('2026-07-05 17:00:00'),
        'maxPeople' => 250,
    ],
    [
        'title' => 'Nocturne des Crêtes',
        'description' => 'Une compétition originale en nocturne sous les projecteurs. Ambiance électrique et courses rapides au programme.',
        'location' => 'Piste des Crêtes, Lyon',
        'startAt' => new \DateTime('2026-08-20 20:00:00'),
        'endAt' => new \DateTime('2026-08-21 00:00:00'),
        'maxPeople' => 80,
    ]
];

foreach ($competitions as $data) {
    $existing = $em->getRepository(Competition::class)->findOneBy(['title' => $data['title']]);
    if (!$existing) {
        $comp = new Competition();
        $comp->setTitle($data['title']);
        $comp->setDescription($data['description']);
        $comp->setLocation($data['location']);
        $comp->setStartAt($data['startAt']);
        $comp->setEndAt($data['endAt']);
        $comp->setMaxPeople($data['maxPeople']);
        $comp->setCreatedAt(new \DateTime());
        $comp->setIsActive(true);
        $em->persist($comp);
    }
}

$em->flush();
echo "Compétitions de test créées avec succès.\n";
