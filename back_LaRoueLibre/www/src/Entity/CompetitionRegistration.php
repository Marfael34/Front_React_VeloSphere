<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use ApiPlatform\Metadata\Patch;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: "App\Repository\CompetitionRegistrationRepository")]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(security: "is_granted('IS_AUTHENTICATED_FULLY')", processor: \App\State\CompetitionRegistrationProcessor::class),
        new Patch(security: "is_granted('ROLE_ADMIN')", processor: \App\State\CompetitionRegistrationProcessor::class)
    ],
    normalizationContext: ['groups' => ['registration:read']],
    denormalizationContext: ['groups' => ['registration:write']]
)]
#[ApiFilter(SearchFilter::class, properties: ['user' => 'exact'])]
class CompetitionRegistration
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['registration:read'])]
    private ?int $id = null;

    #[ORM\ManyToOne(targetEntity: "App\Entity\User", inversedBy: "competitionRegistrations")]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: "App\Entity\Competition", inversedBy: "registrations")]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?Competition $competition = null;

    #[ORM\Column(type: "datetime")]
    #[Groups(['registration:read'])]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $category = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $club = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $plateNumber = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $firstName = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $lastName = null;

    #[ORM\ManyToOne(targetEntity: "App\Entity\Licence")]
    #[ORM\JoinColumn(nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?Licence $licence = null;

    #[ORM\Column(length: 50, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $status = 'En attente';

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $licencePath = null;

    #[ORM\Column(length: 100, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $emergencyContactName = null;

    #[ORM\Column(length: 20, nullable: true)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?string $emergencyContactPhone = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int { return $this->id; }
    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): self { $this->user = $user; return $this; }
    public function getCompetition(): ?Competition { return $this->competition; }
    public function setCompetition(?Competition $competition): self { $this->competition = $competition; return $this; }
    public function getCreatedAt(): ?\DateTime { return $this->createdAt; }
    public function setCreatedAt(?\DateTime $createdAt): self { $this->createdAt = $createdAt; return $this; }
    public function getCategory(): ?string { return $this->category; }
    public function setCategory(?string $category): self { $this->category = $category; return $this; }
    public function getClub(): ?string { return $this->club; }
    public function setClub(?string $club): self { $this->club = $club; return $this; }
    public function getPlateNumber(): ?string { return $this->plateNumber; }
    public function setPlateNumber(?string $plateNumber): self { $this->plateNumber = $plateNumber; return $this; }
    public function getFirstName(): ?string { return $this->firstName; }
    public function setFirstName(?string $firstName): self { $this->firstName = $firstName; return $this; }
    public function getLastName(): ?string { return $this->lastName; }
    public function setLastName(?string $lastName): self { $this->lastName = $lastName; return $this; }
    public function getLicence(): ?Licence { return $this->licence; }
    public function setLicence(?Licence $licence): self { $this->licence = $licence; return $this; }
    public function getStatus(): ?string { return $this->status; }
    public function setStatus(?string $status): self { $this->status = $status; return $this; }
    public function getLicencePath(): ?string { return $this->licencePath; }
    public function setLicencePath(?string $licencePath): self { $this->licencePath = $licencePath; return $this; }
    public function getEmergencyContactName(): ?string { return $this->emergencyContactName; }
    public function setEmergencyContactName(?string $name): self { $this->emergencyContactName = $name; return $this; }
    public function getEmergencyContactPhone(): ?string { return $this->emergencyContactPhone; }
    public function setEmergencyContactPhone(?string $phone): self { $this->emergencyContactPhone = $phone; return $this; }
}
