<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260421170413 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE adress (id INT AUTO_INCREMENT NOT NULL, number VARCHAR(255) NOT NULL, complement VARCHAR(255) DEFAULT NULL, type VARCHAR(20) NOT NULL, label VARCHAR(255) NOT NULL, city VARCHAR(50) NOT NULL, cp INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE characteristic (id INT AUTO_INCREMENT NOT NULL, type VARCHAR(255) NOT NULL, description LONGTEXT NOT NULL, value VARCHAR(255) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE competition (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(255) NOT NULL, description LONGTEXT DEFAULT NULL, max_people INT NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, start_at DATETIME NOT NULL, end_at DATETIME NOT NULL, is_active TINYINT NOT NULL, path VARCHAR(255) DEFAULT NULL, user_id INT DEFAULT NULL, INDEX IDX_B50A2CB1A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE etat (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(200) NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE licence (id INT AUTO_INCREMENT NOT NULL, nationaly VARCHAR(25) NOT NULL, country_resid VARCHAR(50) NOT NULL, phone VARCHAR(14) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, is_active TINYINT NOT NULL, user_id INT DEFAULT NULL, etat_id INT DEFAULT NULL, price_licence_id INT DEFAULT NULL, INDEX IDX_1DAAE648A76ED395 (user_id), INDEX IDX_1DAAE648D5E86FF (etat_id), INDEX IDX_1DAAE648926708CD (price_licence_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE `order` (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME DEFAULT NULL, path VARCHAR(255) DEFAULT NULL, user_id INT DEFAULT NULL, INDEX IDX_F5299398A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE order_etat (order_id INT NOT NULL, etat_id INT NOT NULL, INDEX IDX_183BCD758D9F6D38 (order_id), INDEX IDX_183BCD75D5E86FF (etat_id), PRIMARY KEY (order_id, etat_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE order_products (order_id INT NOT NULL, products_id INT NOT NULL, INDEX IDX_5242B8EB8D9F6D38 (order_id), INDEX IDX_5242B8EB6C8A81A9 (products_id), PRIMARY KEY (order_id, products_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE panier (id INT AUTO_INCREMENT NOT NULL, etat_id INT DEFAULT NULL, user_id INT DEFAULT NULL, INDEX IDX_24CC0DF2D5E86FF (etat_id), INDEX IDX_24CC0DF2A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE panier_item (id INT AUTO_INCREMENT NOT NULL, quantity INT NOT NULL, panier_id INT DEFAULT NULL, product_id INT DEFAULT NULL, INDEX IDX_EBFD0067F77D927C (panier_id), INDEX IDX_EBFD00674584665A (product_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE places (id INT AUTO_INCREMENT NOT NULL, name VARCHAR(200) NOT NULL, description LONGTEXT DEFAULT NULL, coordinates VARCHAR(25) DEFAULT NULL, elevation INT DEFAULT NULL, distance DOUBLE PRECISION NOT NULL, difficulty VARCHAR(255) NOT NULL, floor VARCHAR(50) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, is_active TINYINT NOT NULL, path VARCHAR(255) DEFAULT NULL, user_id INT DEFAULT NULL, INDEX IDX_FEAF6C55A76ED395 (user_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE price_licence (id INT AUTO_INCREMENT NOT NULL, label VARCHAR(200) NOT NULL, price INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE products (id INT AUTO_INCREMENT NOT NULL, title VARCHAR(200) NOT NULL, description LONGTEXT DEFAULT NULL, price DOUBLE PRECISION NOT NULL, brand VARCHAR(150) NOT NULL, image_path VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, is_active TINYINT NOT NULL, quantity INT NOT NULL, PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE products_characteristic (products_id INT NOT NULL, characteristic_id INT NOT NULL, INDEX IDX_CC059F76C8A81A9 (products_id), INDEX IDX_CC059F7DEE9D12B (characteristic_id), PRIMARY KEY (products_id, characteristic_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE refresh_tokens (refresh_token VARCHAR(128) NOT NULL, username VARCHAR(255) NOT NULL, valid DATETIME NOT NULL, id INT AUTO_INCREMENT NOT NULL, UNIQUE INDEX UNIQ_9BACE7E1C74F2195 (refresh_token), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user (id INT AUTO_INCREMENT NOT NULL, email VARCHAR(180) NOT NULL, roles JSON NOT NULL, password VARCHAR(255) NOT NULL, firstname VARCHAR(100) NOT NULL, lastname VARCHAR(100) NOT NULL, pseudo VARCHAR(150) NOT NULL, birthday DATETIME NOT NULL, avatar VARCHAR(255) DEFAULT NULL, created_at DATETIME NOT NULL, updated_at DATETIME DEFAULT NULL, is_active TINYINT NOT NULL, telephone VARCHAR(100) DEFAULT NULL, UNIQUE INDEX UNIQ_IDENTIFIER_EMAIL (email), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user_adress (user_id INT NOT NULL, adress_id INT NOT NULL, INDEX IDX_39BEDC83A76ED395 (user_id), INDEX IDX_39BEDC838486F9AC (adress_id), PRIMARY KEY (user_id, adress_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE user_wishlist (user_id INT NOT NULL, places_id INT NOT NULL, INDEX IDX_7C6CCE31A76ED395 (user_id), INDEX IDX_7C6CCE318317B347 (places_id), PRIMARY KEY (user_id, places_id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('CREATE TABLE wishlist (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, user_id INT NOT NULL, place_id INT NOT NULL, etat_id INT NOT NULL, INDEX IDX_9CE12A31A76ED395 (user_id), INDEX IDX_9CE12A31DA6A219 (place_id), INDEX IDX_9CE12A31D5E86FF (etat_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE competition ADD CONSTRAINT FK_B50A2CB1A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE licence ADD CONSTRAINT FK_1DAAE648A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE licence ADD CONSTRAINT FK_1DAAE648D5E86FF FOREIGN KEY (etat_id) REFERENCES etat (id)');
        $this->addSql('ALTER TABLE licence ADD CONSTRAINT FK_1DAAE648926708CD FOREIGN KEY (price_licence_id) REFERENCES price_licence (id)');
        $this->addSql('ALTER TABLE `order` ADD CONSTRAINT FK_F5299398A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE order_etat ADD CONSTRAINT FK_183BCD758D9F6D38 FOREIGN KEY (order_id) REFERENCES `order` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE order_etat ADD CONSTRAINT FK_183BCD75D5E86FF FOREIGN KEY (etat_id) REFERENCES etat (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE order_products ADD CONSTRAINT FK_5242B8EB8D9F6D38 FOREIGN KEY (order_id) REFERENCES `order` (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE order_products ADD CONSTRAINT FK_5242B8EB6C8A81A9 FOREIGN KEY (products_id) REFERENCES products (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE panier ADD CONSTRAINT FK_24CC0DF2D5E86FF FOREIGN KEY (etat_id) REFERENCES etat (id)');
        $this->addSql('ALTER TABLE panier ADD CONSTRAINT FK_24CC0DF2A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE panier_item ADD CONSTRAINT FK_EBFD0067F77D927C FOREIGN KEY (panier_id) REFERENCES panier (id)');
        $this->addSql('ALTER TABLE panier_item ADD CONSTRAINT FK_EBFD00674584665A FOREIGN KEY (product_id) REFERENCES products (id)');
        $this->addSql('ALTER TABLE places ADD CONSTRAINT FK_FEAF6C55A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE products_characteristic ADD CONSTRAINT FK_CC059F76C8A81A9 FOREIGN KEY (products_id) REFERENCES products (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE products_characteristic ADD CONSTRAINT FK_CC059F7DEE9D12B FOREIGN KEY (characteristic_id) REFERENCES characteristic (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_adress ADD CONSTRAINT FK_39BEDC83A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_adress ADD CONSTRAINT FK_39BEDC838486F9AC FOREIGN KEY (adress_id) REFERENCES adress (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_wishlist ADD CONSTRAINT FK_7C6CCE31A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE user_wishlist ADD CONSTRAINT FK_7C6CCE318317B347 FOREIGN KEY (places_id) REFERENCES places (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE wishlist ADD CONSTRAINT FK_9CE12A31A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE wishlist ADD CONSTRAINT FK_9CE12A31DA6A219 FOREIGN KEY (place_id) REFERENCES places (id)');
        $this->addSql('ALTER TABLE wishlist ADD CONSTRAINT FK_9CE12A31D5E86FF FOREIGN KEY (etat_id) REFERENCES etat (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE competition DROP FOREIGN KEY FK_B50A2CB1A76ED395');
        $this->addSql('ALTER TABLE licence DROP FOREIGN KEY FK_1DAAE648A76ED395');
        $this->addSql('ALTER TABLE licence DROP FOREIGN KEY FK_1DAAE648D5E86FF');
        $this->addSql('ALTER TABLE licence DROP FOREIGN KEY FK_1DAAE648926708CD');
        $this->addSql('ALTER TABLE `order` DROP FOREIGN KEY FK_F5299398A76ED395');
        $this->addSql('ALTER TABLE order_etat DROP FOREIGN KEY FK_183BCD758D9F6D38');
        $this->addSql('ALTER TABLE order_etat DROP FOREIGN KEY FK_183BCD75D5E86FF');
        $this->addSql('ALTER TABLE order_products DROP FOREIGN KEY FK_5242B8EB8D9F6D38');
        $this->addSql('ALTER TABLE order_products DROP FOREIGN KEY FK_5242B8EB6C8A81A9');
        $this->addSql('ALTER TABLE panier DROP FOREIGN KEY FK_24CC0DF2D5E86FF');
        $this->addSql('ALTER TABLE panier DROP FOREIGN KEY FK_24CC0DF2A76ED395');
        $this->addSql('ALTER TABLE panier_item DROP FOREIGN KEY FK_EBFD0067F77D927C');
        $this->addSql('ALTER TABLE panier_item DROP FOREIGN KEY FK_EBFD00674584665A');
        $this->addSql('ALTER TABLE places DROP FOREIGN KEY FK_FEAF6C55A76ED395');
        $this->addSql('ALTER TABLE products_characteristic DROP FOREIGN KEY FK_CC059F76C8A81A9');
        $this->addSql('ALTER TABLE products_characteristic DROP FOREIGN KEY FK_CC059F7DEE9D12B');
        $this->addSql('ALTER TABLE user_adress DROP FOREIGN KEY FK_39BEDC83A76ED395');
        $this->addSql('ALTER TABLE user_adress DROP FOREIGN KEY FK_39BEDC838486F9AC');
        $this->addSql('ALTER TABLE user_wishlist DROP FOREIGN KEY FK_7C6CCE31A76ED395');
        $this->addSql('ALTER TABLE user_wishlist DROP FOREIGN KEY FK_7C6CCE318317B347');
        $this->addSql('ALTER TABLE wishlist DROP FOREIGN KEY FK_9CE12A31A76ED395');
        $this->addSql('ALTER TABLE wishlist DROP FOREIGN KEY FK_9CE12A31DA6A219');
        $this->addSql('ALTER TABLE wishlist DROP FOREIGN KEY FK_9CE12A31D5E86FF');
        $this->addSql('DROP TABLE adress');
        $this->addSql('DROP TABLE characteristic');
        $this->addSql('DROP TABLE competition');
        $this->addSql('DROP TABLE etat');
        $this->addSql('DROP TABLE licence');
        $this->addSql('DROP TABLE `order`');
        $this->addSql('DROP TABLE order_etat');
        $this->addSql('DROP TABLE order_products');
        $this->addSql('DROP TABLE panier');
        $this->addSql('DROP TABLE panier_item');
        $this->addSql('DROP TABLE places');
        $this->addSql('DROP TABLE price_licence');
        $this->addSql('DROP TABLE products');
        $this->addSql('DROP TABLE products_characteristic');
        $this->addSql('DROP TABLE refresh_tokens');
        $this->addSql('DROP TABLE user');
        $this->addSql('DROP TABLE user_adress');
        $this->addSql('DROP TABLE user_wishlist');
        $this->addSql('DROP TABLE wishlist');
    }
}
