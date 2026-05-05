<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260505182848 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE competition_registration ADD licence_path VARCHAR(255) DEFAULT NULL, ADD emergency_contact_name VARCHAR(100) DEFAULT NULL, ADD emergency_contact_phone VARCHAR(20) DEFAULT NULL');
        $this->addSql('ALTER TABLE price_licence ADD description LONGTEXT DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE competition_registration DROP licence_path, DROP emergency_contact_name, DROP emergency_contact_phone');
        $this->addSql('ALTER TABLE price_licence DROP description');
    }
}
