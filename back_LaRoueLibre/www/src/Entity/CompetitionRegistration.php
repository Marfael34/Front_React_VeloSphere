<?php

namespace App\Entity;

use ApiPlatform\Doctrine\Orm\Filter\SearchFilter;
use ApiPlatform\Metadata\ApiFilter;
use ApiPlatform\Metadata\ApiResource;
use ApiPlatform\Metadata\Get;
use ApiPlatform\Metadata\GetCollection;
use ApiPlatform\Metadata\Post;
use App\Repository\CompetitionRegistrationRepository;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: CompetitionRegistrationRepository::class)]
#[ApiResource(
    operations: [
        new Get(),
        new GetCollection(),
        new Post(security: "is_authenticated()")
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

    #[ORM\ManyToOne(targetEntity: User::class, inversedBy: 'competitionRegistrations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?User $user = null;

    #[ORM\ManyToOne(targetEntity: Competition::class, inversedBy: 'registrations')]
    #[ORM\JoinColumn(nullable: false)]
    #[Groups(['registration:read', 'registration:write'])]
    private ?Competition $competition = null;

    #[ORM\Column]
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

    public function __construct()
    {
        $this->createdAt = new \DateTime();
    }

    public function getId(): ?int
    {
        return $this->id;
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

    public function getCompetition(): ?Competition
    {
        return $this->competition;
    }

    public function setCompetition(?Competition $competition): static
    {
        $this->competition = $competition;

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

    public function getCategory(): ?string
    {
        return $this->category;
    }

    public function setCategory(?string $category): static
    {
        $this->category = $category;
        return $this;
    }

    public function getClub(): ?string
    {
        return $this->club;
    }

    public function setClub(?string $club): static
    {
        $this->club = $club;
        return $this;
    }

    public function getPlateNumber(): ?string
    {
        return $this->plateNumber;
    }

    public function setPlateNumber(?string $plateNumber): static
    {
        $this->plateNumber = $plateNumber;
        return $this;
    }
}
