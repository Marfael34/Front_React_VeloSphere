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
            $licenceId = $paymentIntent->metadata->licence_id ?? null;
            $type = $paymentIntent->metadata->type ?? 'panier';

            if ($type === 'licence' && $licenceId) {
                $logger->info("Paiement réussi pour la licence ID : " . $licenceId);
                $licence = $em->getRepository(\App\Entity\Licence::class)->find($licenceId);
                if ($licence) {
                    $etatValide = $em->getRepository(Etat::class)->findOneBy(['label' => 'Validées']);
                    
                    if ($etatValide) {
                        $licence->setEtat($etatValide);
                        $licence->setIsActive(true);

                        // --- CALCUL DE LA VALIDITÉ (Règles FFC) ---
                        $now = new \DateTime();
                        $currentMonth = (int)$now->format('n');
                        $currentYear = (int)$now->format('Y');
                        $expiryYear = ($currentMonth >= 9) ? ($currentYear + 1) : $currentYear;
                        $validUntil = new \DateTime($expiryYear . '-12-31 23:59:59');
                        $licence->setValidUntil($validUntil);
                    }

                    try {
                        $logger->info("Génération du PDF de la licence ID " . $licenceId . " en cours...");
                        $pdfOptions = new Options();
                        $pdfOptions->set('defaultFont', 'Arial');
                        $pdfOptions->set('isRemoteEnabled', true);
                        $dompdf = new Dompdf($pdfOptions);

                        $logoPath = $params->get('kernel.project_dir') . '/public/images/logo.png';
                        $logoData = null;
                        if (file_exists($logoPath)) {
                            $typeLogo = pathinfo($logoPath, PATHINFO_EXTENSION);
                            $dataLogo = file_get_contents($logoPath);
                            $logoData = 'data:image/' . $typeLogo . ';base64,' . base64_encode($dataLogo);
                        }

                        // --- RÉCUPÉRATION DE LA PHOTO (Priorité à la photo de licence, sinon avatar) ---
                        $user = $licence->getUser();
                        $photoPathForPdf = $licence->getPhotoPath() ?: ($user ? $user->getAvatar() : null);
                        $photoData = null;

                        if ($photoPathForPdf) {
                            $fullPhotoPath = $params->get('kernel.project_dir') . '/public' . $photoPathForPdf;
                            if (file_exists($fullPhotoPath)) {
                                $typePhoto = pathinfo($fullPhotoPath, PATHINFO_EXTENSION);
                                $dataPhoto = file_get_contents($fullPhotoPath);
                                $photoData = 'data:image/' . $typePhoto . ';base64,' . base64_encode($dataPhoto);
                            }
                        }

                        // --- RÉCUPÉRATION DE LA SIGNATURE ---
                        $signaturePath = $licence->getSignaturePath();
                        $signatureData = null;
                        if ($signaturePath) {
                            $fullSignaturePath = $params->get('kernel.project_dir') . '/public' . $signaturePath;
                            if (file_exists($fullSignaturePath)) {
                                $typeSig = pathinfo($fullSignaturePath, PATHINFO_EXTENSION);
                                $dataSig = file_get_contents($fullSignaturePath);
                                $signatureData = 'data:image/' . $typeSig . ';base64,' . base64_encode($dataSig);
                            }
                        }

                        $html = $twig->render('licence/licence_pdf.html.twig', [
                            'licence' => $licence,
                            'user' => $user,
                            'logo' => $logoData,
                            'avatar' => $photoData,
                            'signature' => $signatureData
                        ]);

                        $dompdf->loadHtml($html);
                        $dompdf->setPaper('A4', 'portrait');
                        $dompdf->render();

                        $currentYear = (new \DateTime())->format('Y');
                        $safeName = $user ? str_replace([' ', "'"], '_', strtoupper($user->getLastname()) . '_' . ucfirst($user->getFirstname())) : 'ANONYMOUS';
                        $fileName = 'LICENCE_' . $currentYear . '_' . $safeName . '.pdf';
                        $pdfDirectory = $params->get('kernel.project_dir') . '/public/uploads/licences/pdf_officiels';

                        if (!is_dir($pdfDirectory)) {
                            mkdir($pdfDirectory, 0777, true);
                        }

                        $pdfPath = $pdfDirectory . '/' . $fileName;
                        file_put_contents($pdfPath, $dompdf->output());

                        $licence->setPdfPath('/uploads/licences/pdf_officiels/' . $fileName);
                        $logger->info("PDF de licence généré : " . $fileName);
                    } catch (\Exception $e) {
                        $logger->error("Erreur génération PDF licence : " . $e->getMessage());
                    }
                    // ---------------------------------------

                    $em->flush();
                    $logger->info("SUCCÈS : Licence ID " . $licenceId . " activée et PDF généré.");
                }
                return new Response('Licence payée', 200);
            }

            if ($panierId) {
                try {
                    $panier = $em->getRepository(Panier::class)->find($panierId);

                    if (!$panier) {
                        $logger->error("ERREUR : Panier introuvable en base pour l'ID " . $panierId);
                        return new Response('Panier introuvable', 404);
                    }

                    // --- RÉCUPÉRATION DES ÉTATS OPTIMISÉE ---
                    $etats = $em->getRepository(Etat::class)
                        ->createQueryBuilder('e')
                        ->where('e.label LIKE :paye OR e.label LIKE :validation')
                        ->setParameter('paye', '%Payées%')
                        ->setParameter('validation', '%En attente de validation%')
                        ->getQuery()
                        ->getResult();

                    $etatPaye = null;
                    $etatValidation = null;

                    foreach ($etats as $etat) {
                        if (stripos($etat->getLabel(), 'payées') !== false) {
                            $etatPaye = $etat;
                        } elseif (stripos($etat->getLabel(), 'en attente de validation') !== false) {
                            $etatValidation = $etat;
                        }
                    }

                    if (!$etatPaye || !$etatValidation) {
                        $logger->error("ERREUR : L'état 'Payées' ou 'En attente de validation' est introuvable en BDD.");
                        return new Response('Etats manquants', 404);
                    }

                    $order = new Order();
                    $order->setUser($panier->getUser());
                    $order->addEtat($etatPaye);
                    $order->addEtat($etatValidation);
                    $order->setCreatedAt(new \DateTime());

                    $totalPrice = 0;
                    $invoiceLines = [];

                    foreach ($panier->getItems() as $item) {
                        $product = $item->getProduct();
                        if (!$product) continue;

                        $qtyBought = $item->getQuantity();
                        $unitPriceEuros = $product->getPrice() / 100;
                        $subtotal = $unitPriceEuros * $qtyBought;

                        $invoiceLines[] = [
                            'title' => $product->getTitle(),
                            'price' => $unitPriceEuros,
                            'quantity' => $qtyBought,
                            'subtotal' => $subtotal
                        ];

                        $order->addProduct($product);
                        $currentQuantity = $product->getQuantity();
                        $product->setQuantity(max(0, $currentQuantity - $qtyBought));

                        $totalPrice += $subtotal;
                        $em->remove($item);
                    }

                    $logger->info("Génération du PDF en cours...");
                    $pdfOptions = new Options();
                    $pdfOptions->set('defaultFont', 'Arial');
                    $pdfOptions->set('isRemoteEnabled', true);
                    $dompdf = new Dompdf($pdfOptions);

                    $logoPath = $params->get('kernel.project_dir') . '/public/images/logo.png';
                    $logoData = null;

                    if (file_exists($logoPath)) {
                        $type = pathinfo($logoPath, PATHINFO_EXTENSION);
                        $data = file_get_contents($logoPath);
                        $logoData = 'data:image/' . $type . ';base64,' . base64_encode($data);
                    }

                    $html = $twig->render('invoice/invoice.html.twig', [
                        'order' => $order,
                        'user' => $panier->getUser(),
                        'lines' => $invoiceLines,
                        'total' => $totalPrice,
                        'date' => clone $order->getCreatedAt(),
                        'logo' => $logoData
                    ]);

                    $dompdf->loadHtml($html);
                    $dompdf->setPaper('A4', 'portrait');
                    $dompdf->render();

                    $fileName = 'facture_' . uniqid() . '.pdf';
                    $pdfDirectory = $params->get('kernel.project_dir') . '/public/uploads/invoices';

                    if (!is_dir($pdfDirectory)) {
                        mkdir($pdfDirectory, 0777, true);
                    }

                    $pdfPath = $pdfDirectory . '/' . $fileName;
                    file_put_contents($pdfPath, $dompdf->output());

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
