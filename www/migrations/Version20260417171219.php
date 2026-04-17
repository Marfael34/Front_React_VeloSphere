<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260417171219 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE order_etat (order_id INT NOT NULL, etat_id INT NOT NULL, INDEX IDX_183BCD758D9F6D38 (order_id), INDEX IDX_183BCD75D5E86FF (etat_id), PRIMARY KEY (order_id, etat_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE order_etat ADD CONSTRAINT FK_183BCD758D9F6D38 FOREIGN KEY (order_id) REFERENCES `order` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE order_etat ADD CONSTRAINT FK_183BCD75D5E86FF FOREIGN KEY (etat_id) REFERENCES etat (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY `FK_F5299398D5E86FF`');
        $this->addSql('DROP INDEX IDX_F5299398D5E86FF ON `order`');
        $this->addSql('ALTER TABLE `order` DROP etat_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE order_etat DROP FOREIGN KEY FK_183BCD758D9F6D38');
        $this->addSql('ALTER TABLE order_etat DROP FOREIGN KEY FK_183BCD75D5E86FF');
        $this->addSql('DROP TABLE order_etat');
        $this->addSql('ALTER TABLE `order` ADD etat_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT `FK_F5299398D5E86FF` FOREIGN KEY (etat_id) REFERENCES etat (id)');
        $this->addSql('CREATE INDEX IDX_F5299398D5E86FF ON `order` (etat_id)');
    }
}
