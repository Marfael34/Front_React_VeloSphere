<?php
require_once __DIR__.'/../vendor/autoload.php';
require_once __DIR__.'/../src/Kernel.php';

use App\Kernel;
use Symfony\Component\HttpFoundation\Request;

$kernel = new Kernel('dev', true);
$request = Request::createFromGlobals();
$response = $kernel->handle($request);
$response->send();
$kernel->terminate($request, $response);
