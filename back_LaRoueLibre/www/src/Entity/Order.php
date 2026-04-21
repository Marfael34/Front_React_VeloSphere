<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\OrderRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: OrderRepository::class)]
#[ORM\Table(name: '`order`')]
#[ApiResource(
    normalizationContext: ['groups' => ['order:read']]
)]
#[ApiFilter(SearchFilter::class, properties: ['user' => 'exact'])]
class Order
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['order:read'])]
    private ?int $id = null;

    /**
     * @var Collection<int, Etat>
     */
    #[ORM\ManyToMany(targetEntity: Etat::class, inversedBy: 'orders')]
    #[Groups(['order:read'])]
    private Collection $etats;

    #[ORM\ManyToOne(inversedBy: 'orders')]
    #[Groups(['order:read'])]
    private ?User $user = null;

    /**
     * @var Collection<int, Products>
     */
    #[ORM\ManyToMany(targetEntity: Products::class, inversedBy: 'orders')]
    #[Groups(['order:read'])]
    private Collection $products;

    #[ORM\Column(nullable: true)]
    #[Groups(['order:read'])]
    private ?\DateTime $created_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['order:read'])]
    private ?string $path = null;

    public function __construct()
    {
        $this->products = new ArrayCollection();
        $this->etats = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Collection<int, Etat>
     */
    public function getEtats(): Collection
    {
        return $this->etats;
    }

    public function addEtat(Etat $etat): static
    {
        if (!$this->etats->contains($etat)) {
            $this->etats->add($etat);
        }

        return $this;
    }

    public function removeEtat(Etat $etat): static
    {
        $this->etats->removeElement($etat);

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    /**
     * @return Collection<int, Products>
     */
    public function getProducts(): Collection
    {
        return $this->products;
    }

    public function addProduct(Products $product): static
    {
        if (!$this->products->contains($product)) {
            $this->products->add($product);
        }

        return $this;
    }

    public function removeProduct(Products $product): static
    {
        $this->products->removeElement($product);

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->created_at;
    }

    // Le '?' est OBLIGATOIRE ici pour éviter l'erreur 500
    public function setCreatedAt(?\DateTime $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getPath(): ?string
    {
        return $this->path;
    }

    // Le '?' est OBLIGATOIRE ici pour éviter l'erreur 500
    public function setPath(?string $path): static
    {
        $this->path = $path;

        return $this;
    }
}