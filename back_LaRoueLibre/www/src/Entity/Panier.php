<?php
namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Post;
use App\Repository\PanierRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: PanierRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['panier:read']],
    denormalizationContext: ['groups' => ['panier:write']],
    operations: [new Get(), new GetCollection(), new Post(), new Patch(), new Delete()]
)]
#[ApiFilter(SearchFilter::class, properties: ['user' => 'exact', 'etat' => 'exact'])]
class Panier
{
    #[ORM\Id, ORM\GeneratedValue, ORM\Column]
    #[Groups(['panier:read', 'panier:write', 'user:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(inversedBy: 'paniers')]
    #[Groups(['panier:read', 'panier:write', 'user:read'])]
    private ?Etat $etat = null;

    #[ORM\ManyToOne(inversedBy: 'paniers')]
    #[Groups(['panier:read', 'panier:write'])]
    private ?User $user = null;

    #[ORM\OneToMany(mappedBy: 'panier', targetEntity: PanierItem::class, cascade: ['persist', 'remove'])]
    #[Groups(['panier:read', 'user:read'])]
    private Collection $items;

    public function __construct() { $this->items = new ArrayCollection(); }
    public function getId(): ?int { return $this->id; }
    public function getEtat(): ?Etat { return $this->etat; }
    public function setEtat(?Etat $etat): static { $this->etat = $etat; return $this; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }
    
    /** @return Collection<int, PanierItem> */
    public function getItems(): Collection { return $this->items; }
    public function addItem(PanierItem $item): static {
        if (!$this->items->contains($item)) { $this->items->add($item); $item->setPanier($this); } return $this;
    }
    public function removeItem(PanierItem $item): static {
        if ($this->items->removeElement($item)) { if ($item->getPanier() === $this) { $item->setPanier(null); } } return $this;
    }
}