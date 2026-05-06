<?php

namespace App\Command;

use App\Repository\CompetitionRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;
use Symfony\Component\Console\Style\SymfonyStyle;

#[AsCommand(
    name: 'app:competitions:deactivate-old',
    description: 'Désactive les compétitions terminées depuis plus d\'une semaine.',
)]
class DeactivateOldCompetitionsCommand extends Command
{
    public function __construct(
        private CompetitionRepository $competitionRepository,
        private EntityManagerInterface $entityManager
    ) {
        parent::__construct();
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $io = new SymfonyStyle($input, $output);
        $oneWeekAgo = new \DateTime('-1 week');

        $competitions = $this->competitionRepository->createQueryBuilder('c')
            ->where('c.endAt < :oneWeekAgo')
            ->andWhere('c.isActive = :active')
            ->setParameter('oneWeekAgo', $oneWeekAgo)
            ->setParameter('active', true)
            ->getQuery()
            ->getResult();

        $count = count($competitions);

        foreach ($competitions as $competition) {
            $competition->setIsActive(false);
        }

        $this->entityManager->flush();

        if ($count > 0) {
            $io->success(sprintf('%d compétition(s) ont été désactivées.', $count));
        } else {
            $io->info('Aucune compétition à désactiver.');
        }

        return Command::SUCCESS;
    }
}
