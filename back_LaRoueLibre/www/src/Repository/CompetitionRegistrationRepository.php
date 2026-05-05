<?php

namespace App\Repository;

use App\Entity\CompetitionRegistration;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CompetitionRegistration>
 *
 * @method CompetitionRegistration|null find($id, $lockMode = null, $lockVersion = null)
 * @method CompetitionRegistration|null findOneBy(array $criteria, array $orderBy = null)
 * @method CompetitionRegistration[]    findAll()
 * @method CompetitionRegistration[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class CompetitionRegistrationRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CompetitionRegistration::class);
    }
}
