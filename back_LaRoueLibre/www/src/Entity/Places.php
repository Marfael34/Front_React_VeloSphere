<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Put;
use ApiPlatform\Metadata\Patch;
use ApiPlatform\Metadata\Delete;
use App\Repository\PlacesRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;
use Symfony\Component\Serializer\Attribute\SerializedName;

#[ORM\Entity(repositoryClass: PlacesRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['place:read']],
    denormalizationContext: ['groups' => ['place:write']],
    operations: [
        new Get(),
        new GetCollection(),
        new Post(security: "is_granted('ROLE_ADMIN')"),
        new Put(security: "is_granted('ROLE_ADMIN')"),
        new Patch(security: "is_granted('ROLE_ADMIN')")
    ]
)]
#[ORM\HasLifecycleCallbacks]
class Places
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['place:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $name = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $description = null;

    #[ORM\Column(length:225, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $coordinates = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?int $elevation = null;

    #[ORM\Column]
    #[Groups(['place:read', 'place:write'])]
    private ?float $distance = null;

    #[ORM\Column]
    #[Groups(['place:read', 'place:write'])]
    private ?string $difficulty = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $floor = null;

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column]
    #[Groups(['place:read', 'place:write'])]
    private ?bool $isActive = null;

    #[ORM\ManyToOne(inversedBy: 'places')]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?string $path = null;

    #[ORM\Column(type: Types::JSON, nullable: true)]
    #[Groups(['place:read', 'place:write'])]
    private ?array $trajet = null;

    /**
     * @var Collection<int, Wishlist>
     */
    #[ORM\OneToMany(targetEntity: Wishlist::class, mappedBy: 'place')]
    private Collection $wishlists;

    public function __construct()
    {
        $this->wishlists = new ArrayCollection();
        $this->createdAt = new \DateTime();
        $this->isActive = true;
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        if ($this->createdAt === null) {
            $this->createdAt = new \DateTime();
        }
        if ($this->isActive === null) {
            $this->isActive = true;
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): static
    {
        $this->name = $name;

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

    public function getCoordinates(): ?string
    {
        return $this->coordinates;
    }

    public function setCoordinates(?string $coordinates): static
    {
        $this->coordinates = $coordinates;

        return $this;
    }

    public function getElevation(): ?int
    {
        return $this->elevation;
    }

    public function setElevation(?int $elevation): static
    {
        $this->elevation = $elevation;

        return $this;
    }

    public function getDistance(): ?float
    {
        return $this->distance;
    }

    public function setDistance(float $distance): static
    {
        $this->distance = $distance;

        return $this;
    }

    public function getDifficulty(): ?string
    {
        return $this->difficulty;
    }

    public function setDifficulty(string $difficulty): static
    {
        $this->difficulty = $difficulty;

        return $this;
    }

    public function getFloor(): ?string
    {
        return $this->floor;
    }

    public function setFloor(?string $floor): static
    {
        $this->floor = $floor;

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

    #[Groups(['place:read'])]
    #[SerializedName('is_active')]
    public function getIsActive(): ?bool
    {
        return $this->isActive;
    }

    #[Groups(['place:write'])]
    #[SerializedName('is_active')]
    public function setIsActive(bool $isActive): static
    {
        $this->isActive = $isActive;

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

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(?string $path): static
    {
        $this->path = $path;

        return $this;
    }

    public function getTrajet(): ?array
    {
        return $this->trajet;
    }

    public function setTrajet(?array $trajet): static
    {
        $this->trajet = $trajet;

        return $this;
    }

    /**
     * @return Collection<int, Wishlist>
     */
    public function getWishlists(): Collection
    {
        return $this->wishlists;
    }

    public function addWishlist(Wishlist $wishlist): static
    {
        if (!$this->wishlists->contains($wishlist)) {
            $this->wishlists->add($wishlist);
            $wishlist->setPlace($this);
        }

        return $this;
    }

    public function removeWishlist(Wishlist $wishlist): static
    {
        if ($this->wishlists->removeElement($wishlist)) {
            // set the owning side to null (unless already changed)
            if ($wishlist->getPlace() === $this) {
                $wishlist->setPlace(null);
            }
        }

        return $this;
    }
}
