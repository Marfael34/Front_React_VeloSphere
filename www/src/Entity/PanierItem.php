<?php
namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity]
#[ApiResource(
    normalizationContext: ['groups' => ['panier:read']],
    denormalizationContext: ['groups' => ['panier:write']]
)]
class PanierItem
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['panier:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: Panier::class, inversedBy: 'items')]
    #[Groups(['panier:write'])] // Uniquement write pour bloquer la boucle 500
    private ?Panier $panier = null;

    #[ORM\ManyToOne(targetEntity: Products::class)]
    #[Groups(['panier:read', 'panier:write', 'user:read'])]
    private ?Products $product = null;

    #[ORM\Column]
    #[Groups(['panier:read', 'panier:write', 'user:read'])]
    private int $quantity = 1;

    public function getId(): ?int { return $this->id; }
    public function getProduct(): ?Products { return $this->product; }
    public function setProduct(?Products $product): self { $this->product = $product; return $this; }
    public function getQuantity(): int { return $this->quantity; }
    public function setQuantity(int $quantity): self { $this->quantity = $quantity; return $this; }
    public function getPanier(): ?Panier { return $this->panier; }
    public function setPanier(?Panier $panier): self { $this->panier = $panier; return $this; }
}