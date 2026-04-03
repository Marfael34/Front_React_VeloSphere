<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\LicenceRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: LicenceRepository::class)]
#[ApiResource]
class Licence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 25)]
    private ?string $nationaly = null;

    #[ORM\Column(length: 50)]
    private ?string $country_resid = null;

    #[ORM\Column]
    private ?int $phone = null;

    #[ORM\Column]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column]
    private ?bool $isActive = null;

    #[ORM\ManyToOne(inversedBy: 'licences')]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'licences')]
    private ?Etat $etat = null;

    #[ORM\ManyToOne(inversedBy: 'licences')]
    private ?PriceLicence $price_licence = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNationaly(): ?string
    {
        return $this->nationaly;
    }

    public function setNationaly(string $nationaly): static
    {
        $this->nationaly = $nationaly;

        return $this;
    }

    public function getCountryResid(): ?string
    {
        return $this->country_resid;
    }

    public function setCountryResid(string $country_resid): static
    {
        $this->country_resid = $country_resid;

        return $this;
    }

    public function getPhone(): ?int
    {
        return $this->phone;
    }

    public function setPhone(int $phone): static
    {
        $this->phone = $phone;

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

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }

    public function getEtat(): ?Etat
    {
        return $this->etat;
    }

    public function setEtat(?Etat $etat): static
    {
        $this->etat = $etat;

        return $this;
    }

    public function getPriceLicence(): ?PriceLicence
    {
        return $this->price_licence;
    }

    public function setPriceLicence(?PriceLicence $price_licence): static
    {
        $this->price_licence = $price_licence;

        return $this;
    }
}
