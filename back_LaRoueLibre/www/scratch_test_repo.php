<?php

use App\Entity\CompetitionRegistration;
use App\Kernel;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;

require_once __DIR__.'/vendor/autoload.php';

(new \Symfony\Component\Dotenv\Dotenv())->bootEnv(__DIR__.'/.env');

$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();

$container = $kernel->getContainer();
$entityManager = $container->get('doctrine.orm.entity_manager');
$repository = $entityManager->getRepository(CompetitionRegistration::class);

try {
    echo "Fetching all registrations...\n";
    $registrations = $repository->findAll();
    echo "Found " . count($registrations) . " registrations.\n";
    
    foreach ($registrations as $reg) {
        echo sprintf("ID: %d, User: %s, Competition: %s\n", 
            $reg->getId(), 
            $reg->getUser() ? $reg->getUser()->getEmail() : 'NULL',
            $reg->getCompetition() ? $reg->getCompetition()->getTitle() : 'NULL'
        );
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
