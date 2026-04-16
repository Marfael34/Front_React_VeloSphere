<?php
namespace App\Controller;

use App\Entity\Etat;
use App\Entity\Order;
use App\Entity\Panier;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Twig\Environment;
use Dompdf\Dompdf;
use Dompdf\Options;
use Symfony\Component\DependencyInjection\ParameterBag\ParameterBagInterface;

class StripeWebhookController extends AbstractController
{
    #[Route('/api/stripe/webhook', name: 'api_stripe_webhook', methods: ['POST'])]
    public function handleWebhook(
        Request $request, 
        EntityManagerInterface $em, 
        LoggerInterface $logger,
        Environment $twig,
        ParameterBagInterface $params
    ): Response {
        $logger->info('=== WEBHOOK STRIPE REÇU ===');

        $payload = $request->getContent();
        $event = json_decode($payload);

        if ($event && $event->type === 'payment_intent.succeeded') {
            $paymentIntent = $event->data->object;
            $panierId = $paymentIntent->metadata->panier_id ?? null;

            $logger->info("Paiement réussi pour le panier ID : " . $panierId);

            if ($panierId) {
                try {
                    $panier = $em->getRepository(Panier::class)->find($panierId);
                    
                    if (!$panier) {
                        $logger->error("ERREUR : Panier introuvable en base pour l'ID " . $panierId);
                        return new Response('Panier introuvable', 404);
                    }

                    $etatPaye = $em->getRepository(Etat::class)
                        ->createQueryBuilder('e')
                        ->where('e.label LIKE :motCle')
                        ->setParameter('motCle', '%Payées%')
                        ->setMaxResults(1)
                        ->getQuery()
                        ->getOneOrNullResult();

                    if (!$etatPaye) {
                        $logger->error("ERREUR : État contenant 'Payées' introuvable.");
                        return new Response('Etat introuvable', 404);
                    }

                    // 1. CRÉATION DE L'ORDER
                    $order = new Order();
                    $order->setUser($panier->getUser());
                    $order->setEtat($etatPaye);
                    $order->setCreatedAt(new \DateTime());
                    
                    $totalPrice = 0;
                    $invoiceLines = [];

                    // 2. TRANSFERT ET DÉCRÉMENTATION DU STOCK
                    foreach ($panier->getItems() as $item) {
                        $product = $item->getProduct(); 
                        if (!$product) continue;

                        $qtyBought = $item->getQuantity();
                        $subtotal = $product->getPrice() * $qtyBought;

                        $invoiceLines[] = [
                            'title' => $product->getTitle(),
                            'price' => $product->getPrice(),
                            'quantity' => $qtyBought,
                            'subtotal' => $subtotal
                        ];

                        $order->addProduct($product); 
                        
                        $currentQuantity = $product->getQuantity();
                        $product->setQuantity(max(0, $currentQuantity - $qtyBought));
                        
                        $totalPrice += $subtotal;
                        $em->remove($item);
                    }

                    // 3. GÉNÉRATION DU PDF ET TRAITEMENT DE L'IMAGE
                    $logger->info("Génération du PDF en cours...");
                    $pdfOptions = new Options();
                    $pdfOptions->set('defaultFont', 'Arial');
                    $pdfOptions->set('isRemoteEnabled', true); 
                    $dompdf = new Dompdf($pdfOptions);

                    // --- AJOUT POUR LE LOGO ---
                    // On va chercher l'image physique dans le dossier public/images/
                    $logoPath = $params->get('kernel.project_dir') . '/public/images/logo.png';
                    $logoData = null;

                    if (file_exists($logoPath)) {
                        $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                        $data = file_get_contents($logoPath);
                        $logoData = 'data:image/' . $type . ';base64,' . base64_encode($data);
                    } else {
                        $logger->warning("Attention: Logo introuvable au chemin : " . $logoPath);
                    }
                    // --------------------------

                    $html = $twig->render('invoice/invoice.html.twig', [
                        'order' => $order,
                        'user' => $panier->getUser(),
                        'lines' => $invoiceLines, 
                        'total' => $totalPrice,
                        'date' => clone $order->getCreatedAt(),
                        'logo' => $logoData // On passe la variable logo à Twig ici
                    ]);

                    $dompdf->loadHtml($html);
                    $dompdf->setPaper('A4', 'portrait');
                    $dompdf->render();

                    // 4. SAUVEGARDE DU PDF SUR LE SERVEUR
                    $fileName = 'facture_' . uniqid() . '.pdf';
                    $pdfDirectory = $params->get('kernel.project_dir') . '/public/uploads/invoices';
                    
                    if (!is_dir($pdfDirectory)) {
                        mkdir($pdfDirectory, 0777, true);
                    }
                    
                    $pdfPath = $pdfDirectory . '/' . $fileName;
                    file_put_contents($pdfPath, $dompdf->output());
                    
                    // 5. MISE À JOUR DE L'ORDER ET ÉTAT DU PANIER
                    $order->setPath('/uploads/invoices/' . $fileName);
                    $panier->setEtat($etatPaye);

                    $em->persist($order);
                    $em->flush();

                    $logger->info("SUCCÈS : Commande FAC-" . $order->getId() . " créée.");

                } catch (\Exception $e) {
                    $logger->error("ERREUR FATALE WEBHOOK : " . $e->getMessage() . " à la ligne " . $e->getLine());
                    return new Response('Erreur serveur', 500);
                }
            }
        }

        return new Response('Webhook traité', 200);
    }
}