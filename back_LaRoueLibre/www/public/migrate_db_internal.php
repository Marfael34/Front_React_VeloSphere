<?php

use App\Kernel;
use Symfony\Bundle\FrameworkBundle\Console\Application;
use Symfony\Component\Console\Input\ArrayInput;
use Symfony\Component\Console\Output\BufferedOutput;

require dirname(__DIR__).'/vendor/autoload_runtime.php';

return function (array $context) {
    $kernel = new Kernel($context['APP_ENV'], (bool) $context['APP_DEBUG']);
    $application = new Application($kernel);
    $application->setAutoExit(false);

    $input = new ArrayInput([
        'command' => 'doctrine:schema:update',
        '--force'  => true,
        '--no-interaction' => true,
    ]);

    $output = new BufferedOutput();
    $application->run($input, $output);

    $content = $output->fetch();

    header('Content-Type: text/plain');
    echo "Migration Status:\n";
    echo $content;
    exit;
};
