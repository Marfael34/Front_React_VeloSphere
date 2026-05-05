<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiProperty;
use ApiPlatform\Metadata\ApiResource;
use App\Repository\LicenceRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: LicenceRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['licence:read']],
    denormalizationContext: ['groups' => ['licence:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['user' => 'exact'])]
#[ORM\HasLifecycleCallbacks]
class Licence
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['licence:read', 'user:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 25)]
    #[Groups(['licence:read', 'licence:write', 'user:read'])]
    private ?string $nationaly = null;

    #[ORM\Column(length: 50)]
    #[Groups(['licence:read', 'licence:write'])]
    private ?string $country_resid = null;

    #[ORM\Column(length: 14)]
    #[Assert\NotBlank(message: 'Le numéro de téléphone est obligatoire.')]
    #[Assert\Regex(
        pattern: '/^[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}$/',
        message: 'Le numéro de téléphone doit être au format xx.xx.xx.xx.xx'
    )]
    #[Groups(['licence:read', 'licence:write'])]
    private ?string $phone = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['licence:read'])]
    private ?string $identityCardPath = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['licence:read'])]
    private ?string $medicalCertificatePath = null;

    #[ORM\Column]
    #[Groups(['licence:read', 'user:read'])]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['licence:read'])]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column]
    #[Groups(['licence:read', 'user:read'])]
    private ?bool $isActive = null;

    #[ORM\ManyToOne(inversedBy: 'licences')]
    #[Groups(['licence:write'])]
    private ?User $user = null;

    #[ORM\ManyToOne(inversedBy: 'licences')]
    #[Groups(['licence:read', 'licence:write', 'user:read'])]
    #[ApiProperty(readableLink: true)]
    private ?Etat $etat = null;

    #[ORM\ManyToOne(inversedBy: 'licences')]
    #[Groups(['licence:read', 'licence:write', 'user:read'])]
    #[ApiProperty(readableLink: true)]
    private ?PriceLicence $price_licence = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['licence:read', 'user:read'])]
    private ?string $pdfPath = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['licence:read', 'user:read'])]
    private ?string $photoPath = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['licence:read', 'user:read'])]
    private ?string $signaturePath = null;

    #[ORM\Column(type: 'datetime', nullable: true)]
    #[Groups(['licence:read', 'user:read'])]
    private ?\DateTimeInterface $validUntil = null;

    public function getSignaturePath(): ?string
    {
        return $this->signaturePath;
    }

    public function setSignaturePath(?string $signaturePath): static
    {
        $this->signaturePath = $signaturePath;
        return $this;
    }

    public function getValidUntil(): ?\DateTimeInterface
    {
        return $this->validUntil;
    }

    public function setValidUntil(?\DateTimeInterface $validUntil): static
    {
        $this->validUntil = $validUntil;
        return $this;
    }

    public function getPdfPath(): ?string
    {
        return $this->pdfPath;
    }

    public function setPdfPath(?string $pdfPath): static
    {
        $this->pdfPath = $pdfPath;
        return $this;
    }

    public function getPhotoPath(): ?string
    {
        return $this->photoPath;
    }

    public function setPhotoPath(?string $photoPath): static
    {
        $this->photoPath = $photoPath;
        return $this;
    }

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->isActive = false; // Par défaut, en attente de validation
    }

    #[ORM\PrePersist]
    public function onPrePersist(): void
    {
        if ($this->createdAt === null) {
            $this->createdAt = new \DateTime();
        }
    }

    #[ORM\PreUpdate]
    public function onPreUpdate(): void
    {
        $this->updatedAt = new \DateTime();
    }

    public function getIdentityCardPath(): ?string
    {
        return $this->identityCardPath;
    }

    public function setIdentityCardPath(?string $identityCardPath): static
    {
        $this->identityCardPath = $identityCardPath;
        return $this;
    }

    public function getMedicalCertificatePath(): ?string
    {
        return $this->medicalCertificatePath;
    }

    public function setMedicalCertificatePath(?string $medicalCertificatePath): static
    {
        $this->medicalCertificatePath = $medicalCertificatePath;
        return $this;
    }

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

    public function getPhone(): ?string
    {
        return $this->phone;
    }

    public function setPhone(string $phone): static
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
