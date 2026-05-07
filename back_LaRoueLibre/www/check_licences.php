<?php
require 'vendor/autoload.php';

use App\Kernel;
use App\Entity\Licence;
use Symfony\Component\Dotenv\Dotenv;

$dotenv = new Dotenv();
$dotenv->load(__DIR__.'/.env');

$kernel = new Kernel($_SERVER['APP_ENV'], (bool) $_SERVER['APP_DEBUG']);
$kernel->boot();
$container = $kernel->getContainer();
$em = $container->get('doctrine.orm.entity_manager');

$licences = $em->getRepository(Licence::class)->findBy([], ['id' => 'DESC'], 5);

echo "Checking last 5 licences:\n";
foreach ($licences as $lic) {
    echo "ID: " . $lic->getId() . "\n";
    echo "  Photo Path: " . ($lic->getPhotoPath() ?: 'NULL') . "\n";
    echo "  Signature Path: " . ($lic->getSignaturePath() ?: 'NULL') . "\n";
    echo "  PDF Path: " . ($lic->getPdfPath() ?: 'NULL') . "\n";
    echo "-------------------\n";
}
