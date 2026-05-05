<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\CompetitionRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Serializer\Attribute\Groups;

#[ORM\Entity(repositoryClass: CompetitionRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['competition:read']],
    denormalizationContext: ['groups' => ['competition:write']]
)]
class Competition
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    #[Groups(['competition:read'])]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    #[Groups(['competition:read', 'user:read'])]
    private ?string $title = null;

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    #[Groups(['competition:read'])]
    private ?string $description = null;

    #[ORM\Column]
    #[Groups(['competition:read'])]
    private ?int $maxPeople = null;

    #[ORM\Column]
    #[Groups(['competition:read'])]
    private ?\DateTime $createdAt = null;

    #[ORM\Column(nullable: true)]
    #[Groups(['competition:read'])]
    private ?\DateTime $updatedAt = null;

    #[ORM\Column]
    #[Groups(['competition:read', 'user:read'])]
    private ?\DateTime $startAt = null;

    #[ORM\Column]
    #[Groups(['competition:read'])]
    private ?\DateTime $endAt = null;

    #[ORM\Column]
    #[Groups(['competition:read'])]
    private ?bool $isActive = null;

    #[ORM\ManyToOne(inversedBy: 'competitions')]
    private ?User $user = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['competition:read'])]
    private ?string $path = null;

    #[ORM\Column(length: 255, nullable: true)]
    #[Groups(['competition:read', 'user:read'])]
    private ?string $location = null;

    #[ORM\OneToMany(mappedBy: 'competition', targetEntity: CompetitionRegistration::class, orphanRemoval: true)]
    private Collection $registrations;

    public function __construct()
    {
        $this->registrations = new ArrayCollection();
        $this->createdAt = new \DateTime();
    }

    /**
     * @return Collection<int, CompetitionRegistration>
     */
    public function getRegistrations(): Collection
    {
        return $this->registrations;
    }

    public function addRegistration(CompetitionRegistration $registration): static
    {
        if (!$this->registrations->contains($registration)) {
            $this->registrations->add($registration);
            $registration->setCompetition($this);
        }

        return $this;
    }

    public function removeRegistration(CompetitionRegistration $registration): static
    {
        if ($this->registrations->removeElement($registration)) {
            // set the owning side to null (unless already changed)
            if ($registration->getCompetition() === $this) {
                $registration->setCompetition(null);
            }
        }

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;
        return $this;
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

    public function getMaxPeople(): ?int
    {
        return $this->maxPeople;
    }

    public function setMaxPeople(int $maxPeople): static
    {
        $this->maxPeople = $maxPeople;

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

    public function getStartAt(): ?\DateTime
    {
        return $this->startAt;
    }

    public function setStartAt(\DateTime $startAt): static
    {
        $this->startAt = $startAt;

        return $this;
    }

    public function getEndAt(): ?\DateTime
    {
        return $this->endAt;
    }

    public function setEndAt(\DateTime $endAt): static
    {
        $this->endAt = $endAt;

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

    public function getPath(): ?string
    {
        return $this->path;
    }

    public function setPath(?string $path): static
    {
        $this->path = $path;
        return $this;
    }

/*
    #[Groups(['competition:read'])]
    public function getRegistrationsCount(): int
    {
        return $this->registrations->count();
    }
*/
}
