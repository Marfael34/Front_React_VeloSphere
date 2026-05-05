<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\PriceLicenceRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: PriceLicenceRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['price_licence:read']],
    denormalizationContext: ['groups' => ['price_licence:write']]
)]
class PriceLicence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['price_licence:read', 'licence:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 200)]
    #[Groups(['price_licence:read', 'licence:read', 'user:read'])]
    private ?string $label = null;

    #[ORM\Column]
    #[Groups(['price_licence:read', 'licence:read', 'user:read'])]
    private ?int $price = null;

    #[ORM\Column(type: 'text', nullable: true)]
    #[Groups(['price_licence:read', 'licence:read', 'user:read'])]
    private ?string $description = null;

    /**
     * @var Collection<int, Licence>
     */
    #[ORM\OneToMany(targetEntity: Licence::class, mappedBy: 'price_licence')]
    private Collection $licences;

    public function __construct()
    {
        $this->licences = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getLabel(): ?string
    {
        return $this->label;
    }

    public function setLabel(string $label): static
    {
        $this->label = $label;

        return $this;
    }

    public function getPrice(): ?int
    {
        return $this->price;
    }

    public function setPrice(int $price): static
    {
        $this->price = $price;

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

    /**
     * @return Collection<int, Licence>
     */
    public function getLicences(): Collection
    {
        return $this->licences;
    }

    public function addLicence(Licence $licence): static
    {
        if (!$this->licences->contains($licence)) {
            $this->licences->add($licence);
            $licence->setPriceLicence($this);
        }

        return $this;
    }

    public function removeLicence(Licence $licence): static
    {
        if ($this->licences->removeElement($licence)) {
            // set the owning side to null (unless already changed)
            if ($licence->getPriceLicence() === $this) {
                $licence->setPriceLicence(null);
            }
        }

        return $this;
    }
}
