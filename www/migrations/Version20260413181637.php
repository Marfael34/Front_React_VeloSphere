<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260413181637 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE competition ADD path VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE `order` ADD created_at DATETIME NOT NULL');
        $this->addSql('ALTER TABLE places ADD path VARCHAR(255) DEFAULT NULL');
        $this->addSql('ALTER TABLE products ADD quantity INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE competition DROP path');
        $this->addSql('ALTER TABLE `order` DROP created_at');
        $this->addSql('ALTER TABLE places DROP path');
        $this->addSql('ALTER TABLE products DROP quantity');
    }
}
