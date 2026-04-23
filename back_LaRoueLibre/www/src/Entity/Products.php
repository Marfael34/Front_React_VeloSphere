<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Delete;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use App\Repository\ProductsRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: ProductsRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['product:read']],
    operations: [
        new Get(), // Lecture d'un produit (publique)
        new GetCollection(), // Lecture de tous les produits (publique)
        new Post(security: "is_granted('ROLE_ADMIN')"), // Création (protégée)
        new Put(security: "is_granted('ROLE_ADMIN')"), // Modification (protégée)
        new Delete(security: "is_granted('ROLE_ADMIN')") // Suppression (protégée)
    ],
    // Cette ligne permet à React de dire "donne moi tout" avec ?pagination=false
    paginationClientEnabled: true,
    // Optionnel : tu peux aussi augmenter la limite par défaut ici
    paginationItemsPerPage: 100
)]

class Products
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['product:read', 'panier:read', 'order:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    #[Groups(['product:read', 'panier:read', 'order:read'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['product:read', 'panier:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['product:read', 'panier:read', 'order:read'])]
    private ?float $price = null;

    #[ORM\Column(length: 150)]
    #[Groups(['product:read', 'panier:read'])]
    private ?string $brand = null;

    #[ORM\Column(length: 255)]
    #[Groups(['product:read', 'panier:read'])]
    private ?string $imagePath = null;

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column]
    private ?bool $isActive = null;

    /**
     * @var Collection<int, Order>
     */
    #[ORM\ManyToMany(targetEntity: Order::class, mappedBy: 'products')]
    private Collection $orders;

    /**
     * @var Collection<int, Characteristic>
     */
    #[ORM\ManyToMany(targetEntity: Characteristic::class, inversedBy: 'products')]
    #[Groups(['product:read'])]
    private Collection $characteristics;

    #[ORM\Column]
    #[Groups(['product:read'])]
    private ?int $quantity = null;

    public function __construct()
    {
        $this->orders = new ArrayCollection();
        $this->characteristics = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): ?string
    {
        return $this->title;
    }

    public function setTitle(string $title): static
    {
        $this->title = $title;

        return $this;
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }

    public function setDescription(?string $description): static
    {
        $this->description = $description;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): static
    {
        $this->price = $price;

        return $this;
    }

    public function getBrand(): ?string
    {
        return $this->brand;
    }

    public function setBrand(string $brand): static
    {
        $this->brand = $brand;

        return $this;
    }

    public function getImagePath(): ?string
    {
        return $this->imagePath;
    }

    public function setImagePath(string $imagePath): static
    {
        $this->imagePath = $imagePath;

        return $this;
    }

    public function getCreatedAt(): ?\DateTime
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTime $createdAt): static
    {
        $this->createdAt = $createdAt;

        return $this;
    }

    public function getUpdatedAt(): ?\DateTime
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTime $updatedAt): static
    {
        $this->updatedAt = $updatedAt;

        return $this;
    }

    public function isActive(): ?bool
    {
        return $this->isActive;
    }

    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

        return $this;
    }

    /**
     * @return Collection<int, Order>
     */
    public function getOrders(): Collection
    {
        return $this->orders;
    }

    public function addOrder(Order $order): static
    {
        if (!$this->orders->contains($order)) {
            $this->orders->add($order);
            $order->addProduct($this);
        }

        return $this;
    }

    public function removeOrder(Order $order): static
    {
        if ($this->orders->removeElement($order)) {
            $order->removeProduct($this);
        }

        return $this;
    }

    /**
     * @return Collection<int, Characteristic>
     */
    public function getCharacteristics(): Collection
    {
        return $this->characteristics;
    }

    public function addCharacteristic(Characteristic $characteristic): static
    {
        if (!$this->characteristics->contains($characteristic)) {
            $this->characteristics->add($characteristic);
        }

        return $this;
    }

    public function removeCharacteristic(Characteristic $characteristic): static
    {
        $this->characteristics->removeElement($characteristic);

        return $this;
    }

    public function getQuantity(): ?int
    {
        return $this->quantity;
    }

    public function setQuantity(int $quantity): static
    {
        $this->quantity = $quantity;

        return $this;
    }
}
