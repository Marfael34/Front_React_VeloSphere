<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260420125706 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE wishlist DROP FOREIGN KEY `FK_9CE12A31CA7E0C2E`');
        $this->addSql('DROP INDEX IDX_9CE12A31CA7E0C2E ON wishlist');
        $this->addSql('ALTER TABLE wishlist DROP etats_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE wishlist ADD etats_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE wishlist ADD CONSTRAINT `FK_9CE12A31CA7E0C2E` FOREIGN KEY (etats_id) REFERENCES etat (id)');
        $this->addSql('CREATE INDEX IDX_9CE12A31CA7E0C2E ON wishlist (etats_id)');
    }
}
