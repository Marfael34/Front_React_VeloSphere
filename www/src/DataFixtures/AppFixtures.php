<?php

namespace App\DataFixtures;

use App\Entity\Adress;
use App\Entity\Characteristic;
use App\Entity\Competition;
use App\Entity\Etat;
use App\Entity\Places;
use App\Entity\PriceLicence;
use App\Entity\Products;
use App\Entity\User;
use DateTime;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(private readonly UserPasswordHasherInterface $passwordHasher) {}

    public function load(ObjectManager $manager): void
    {
        $this->loadProduct($manager);
        $this->loadUser($manager);
        $this->loadCharacteristic($manager);
        $this->loadAdress($manager);
        $this->loadCompetition($manager);
        $this->loadEtat($manager);
        $this->loadPlaces($manager);
        $this->loadPriceLicence($manager);

        $manager->flush();
    }

    public function loadProduct(ObjectManager $manager)
    {
        $arrayProducts = [
            [
                'title' => "Elops Speed 920",
                'description' => "Un vélo urbain ultra-dynamique, cadre alu, avec moyeu Alfine 8 vitesses et éclairage intégré par moyeu dynamo. Poids: 12kg. Tailles: M à XL. Non électrique.",
                'price' => "650",
                'brand' => "Decathlon",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Loft 7i",
                'description' => "Le style California par excellence. Cadre ouvert, assise droite et transmission intégrée pour ne jamais dérailler. Poids: 15.5kg. Tailles: S, M, L. Non électrique.",
                'price' => "899",
                'brand' => "Electra",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Roadlite 5",
                'description' => "Un pur vélo de fitness. Très léger, il combine la rapidité d'un vélo de route avec un cintre plat. Poids: 9.9kg. Tailles: 2XS à 2XL. Non électrique.",
                'price' => "949",
                'brand' => "Canyon",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Bad Boy 3",
                'description' => "Le roi du style urbain : fourche monobras Lefty et look noir mat furtif. Poids: 11.8kg. Tailles: S à XL. Non électrique.",
                'price' => "1099",
                'brand' => "Cannondale",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Sirrus 2.0",
                'description' => "Équilibré et robuste. Un excellent vélo de tous les jours avec points de fixation pour porte-bagages. Poids: 11.5kg. Tailles: XS à XL. Non électrique.",
                'price' => "750",
                'brand' => "Specialized",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "District 4",
                'description' => "Haut de gamme urbain avec transmission par courroie Gates Carbon Drive propre et silencieuse. Poids: 13.2kg. Tailles: S à XL. Non électrique.",
                'price' => "1649",
                'brand' => "Trek",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Hyde Pro",
                'description' => "Look épuré et pneus larges pour absorber les pavés. Équipé d'un moyeu Shimano Nexus 8. Poids: 13.4kg. Tailles: XS à XL. Non électrique.",
                'price' => "1149",
                'brand' => "Cube",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Presidio 2",
                'description' => "Conçu pour le commuting pur et dur. Freins à disque hydrauliques puissants pour la pluie. Poids: 12.5kg. Tailles: S à XL. Non électrique.",
                'price' => "850",
                'brand' => "Marin",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Avenue",
                'description' => "Vélo hollandais à la française. Stable, confortable, idéal pour les courtes distances. Poids: 14.8kg. Tailles: M, L. Non électrique.",
                'price' => "699",
                'brand' => "MBK",
                'image' => "",
                'category' => "Vélos ville"
            ],
            [
                'title' => "Brooklyn Cruiser",
                'description' => "Un design intemporel avec cadre en acier chromoly. Un vélo élégant pour flâner. Poids: 15kg. Taille: Unique. Non électrique.",
                'price' => "780",
                'brand' => "Brooklyn",
                'image' => "",
                'category' => "Vélos ville"
            ],

            // VÉLOS ÉLECTRIQUES
            [
                'title' => "Lundi 27.1",
                'description' => "Le cadre iconique en M pour une stabilité hors pair. Moteur Bosch Active Line Plus. Poids: 25kg. Tailles: S, M, L. Électrique.",
                'price' => "3299",
                'brand' => "Moustache",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "Cowboy Cruiser",
                'description' => "Vélo ultra-intelligent sans boutons. Assistance automatique et GPS intégré. Poids: 19.3kg. Taille: 170-195cm. Électrique.",
                'price' => "2990",
                'brand' => "Cowboy",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "VanMoof S5",
                'description' => "Futuriste avec moteur ultra-silencieux et bouton Turbo Boost. Poids: 23kg. Taille: 165-210cm. Électrique.",
                'price' => "3498",
                'brand' => "VanMoof",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "Turbo Vado 4.0",
                'description' => "Moteur Specialized 2.0 développant 70Nm de couple. Grande autonomie. Poids: 24.5kg. Tailles: S à XL. Électrique.",
                'price' => "4000",
                'brand' => "Specialized",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "Endeavour 5.B",
                'description' => "Le SUV du vélo électrique. Solide, puissant (Bosch Performance). Poids: 26kg. Tailles: S à XL. Électrique.",
                'price' => "3199",
                'brand' => "Kalkhoff",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "GSD S10",
                'description' => "Vélo cargo compact. Peut porter 200kg (enfants, bagages). Poids: 33kg. Taille: Unique. Électrique.",
                'price' => "5499",
                'brand' => "Tern",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "RadRunner 3 Plus",
                'description' => "Utility bike à grosses roues. Look de mini-moto, parfait pour le sable. Poids: 34kg. Taille: Unique. Électrique.",
                'price' => "2199",
                'brand' => "Rad Power",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "Nevo 4",
                'description' => "Confort premium avec suspension totale et configuration personnalisable. Poids: 27kg. Tailles: 43 à 56cm. Électrique.",
                'price' => "5200",
                'brand' => "Riese & Müller",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "Angell S/Rapide",
                'description' => "Un des VAE les plus légers au monde. Écran intégré et fonctions de sécurité. Poids: 16.3kg. Taille: 160-180cm. Électrique.",
                'price' => "2850",
                'brand' => "Angell",
                'image' => "",
                'category' => "Vélos électriques"
            ],
            [
                'title' => "C20",
                'description' => "Électrique pliant d'entrée de gamme. Idéal pour les petits budgets urbains. Poids: 21kg. Taille: Unique. Électrique.",
                'price' => "899",
                'brand' => "Xiaomi",
                'image' => "",
                'category' => "Vélos électriques"
            ],

            // VTT
            [
                'title' => "Rockrider XC 120",
                'description' => "Géométrie compétition. Fourche Rockshox Recon 100mm et SRAM NX Eagle 12v. Poids: 12.1kg. Tailles: S à XL. Non électrique.",
                'price' => "1299",
                'brand' => "Decathlon",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Fuel EX 8",
                'description' => "VTT tout-suspendu polyvalent (Trail). Suspension FOX Rhythm 36. Poids: 15.6kg. Tailles: XS à XL. Non électrique.",
                'price' => "3999",
                'brand' => "Trek",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Nomad 6",
                'description' => "La référence de l'Enduro. Roues Mullet (29/27.5) pour l'agilité. Poids: 15.4kg. Tailles: S à XL. Non électrique.",
                'price' => "6500",
                'brand' => "Santa Cruz",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Grand Canyon 7",
                'description' => "Hardtail moderne avec tige de selle télescopique de série. Poids: 13.9kg. Tailles: XS à XL. Non électrique.",
                'price' => "1249",
                'brand' => "Canyon",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Spark RC",
                'description' => "Vélo de XC champion du monde. Amortisseur intégré dans le cadre. Poids: 10.9kg. Tailles: S à XL. Non électrique.",
                'price' => "5800",
                'brand' => "Scott",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Alma M50",
                'description' => "Cadre en carbone haut de gamme (OMR). Un vélo nerveux pour les bosses. Poids: 11.5kg. Tailles: S à XL. Non électrique.",
                'price' => "1899",
                'brand' => "Orbea",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Epic World Cup",
                'description' => "Vitesse pure. Suspension arrière minimaliste pour circuits de coupe du monde. Poids: 9.5kg. Tailles: S à XL. Non électrique.",
                'price' => "4500",
                'brand' => "Specialized",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Meta HT AM",
                'description' => "Un endurigide increvable. Grosse fourche de 160mm pour la descente. Poids: 14.5kg. Tailles: S à XL. Non électrique.",
                'price' => "1600",
                'brand' => "Commencal",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "SB160",
                'description' => "Système Switch Infinity. Précision chirurgicale pour l'Enduro. Poids: 15.2kg. Tailles: S à XL. Non électrique.",
                'price' => "8200",
                'brand' => "Yeti",
                'image' => "",
                'category' => "VTT"
            ],
            [
                'title' => "Trance X 29 1",
                'description' => "Tout-suspendu avec système Maestro. Équilibré montée/descente. Poids: 14.8kg. Tailles: S à XL. Non électrique.",
                'price' => "2700",
                'brand' => "Giant",
                'image' => "",
                'category' => "VTT"
            ],

            // ROUTE & GRAVEL
            [
                'title' => "NCR CF",
                'description' => "Neo Carbon Road. Vélo polyvalent en carbone, freins à disque. Poids: 8.3kg. Tailles: XXS à XL. Non électrique.",
                'price' => "1800",
                'brand' => "Van Rysel",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Madone SLR 9",
                'description' => "Summum de l'aéro avec IsoFlow. Shimano Dura-Ace Di2. Poids: 7.1kg. Tailles: 47 à 62cm. Non électrique.",
                'price' => "12500",
                'brand' => "Trek",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Grizl CF SL 8",
                'description' => "Gravel d'aventure. Pneus de 45mm et géométrie stable hors-piste. Poids: 9.1kg. Tailles: 2XS à 2XL. Non électrique.",
                'price' => "2499",
                'brand' => "Canyon",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Oltre RC",
                'description' => "Hyperbike aéro avec déflecteurs d'air. Technologie italienne pure. Poids: 6.8kg. Tailles: 47 à 59cm. Non électrique.",
                'price' => "13800",
                'brand' => "Bianchi",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Domane AL 2",
                'description' => "Vélo de route d'endurance abordable. Position confortable. Poids: 10.7kg. Tailles: 47 à 62cm. Non électrique.",
                'price' => "999",
                'brand' => "Trek",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Dogma F",
                'description' => "Le choix des pros. Équilibre parfait entre poids, aéro et rigidité. Poids: 6.9kg. Tailles: 11 choix. Non électrique.",
                'price' => "14500",
                'brand' => "Pinarello",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Diverge STR",
                'description' => "Gravel avec double suspension Future Shock. Confort ultime. Poids: 8.9kg. Tailles: 49 à 61cm. Non électrique.",
                'price' => "3200",
                'brand' => "Specialized",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "S5 Ultegra Di2",
                'description' => "Le plus rapide du peloton. Guidon en V unique. Poids: 7.9kg. Tailles: 48 à 61cm. Non électrique.",
                'price' => "9000",
                'brand' => "Cervélo",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Reveal 04",
                'description' => "Route endurance. Câblage intégré et cadre carbone filtrant. Poids: 7.8kg. Tailles: 50 à 63cm. Non électrique.",
                'price' => "2600",
                'brand' => "Rose",
                'image' => "",
                'category' => "Route et Gravel"
            ],
            [
                'title' => "Filante SLR",
                'description' => "Ultra-léger et aéro utilisé par les pros. Peinture haut de gamme. Poids: 6.8kg. Tailles: XS à XXL. Non électrique.",
                'price' => "8500",
                'brand' => "Wilier",
                'image' => "",
                'category' => "Route et Gravel"
            ],

            // ENFANT & PLIABLES
            [
                'title' => "C Line Explore",
                'description' => "Le pliable le plus compact au monde. Fabriqué à Londres. Poids: 12kg. Roues: 16 pouces. Non électrique.",
                'price' => "1750",
                'brand' => "Brompton",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Woom 3",
                'description' => "Ultra-léger pour les 4-6 ans. Ergonomie parfaite. Poids: 5.4kg. Roues: 16 pouces. Non électrique.",
                'price' => "449",
                'brand' => "Woom",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Runride 500",
                'description' => "Draisienne robuste avec vrai frein arrière. Poids: 3.4kg. Roues: 10 pouces. Non électrique.",
                'price' => "60",
                'brand' => "Btwin",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Frog 55",
                'description' => "Vélo hybride haut de gamme pour enfants. Composants adaptés. Poids: 8.5kg. Roues: 20 pouces. Non électrique.",
                'price' => "530",
                'brand' => "Frog Bikes",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Mariner D8",
                'description' => "Pliable polyvalent résistant à la corrosion marine. Poids: 12.4kg. Roues: 20 pouces. Non électrique.",
                'price' => "850",
                'brand' => "Dahon",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Belter 16",
                'description' => "Alu brossé et transmission par courroie (sans graisse). Poids: 5.9kg. Roues: 16 pouces. Non électrique.",
                'price' => "500",
                'brand' => "Early Rider",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Node D8",
                'description' => "Pliable avec grandes roues pour un confort urbain classique. Poids: 13.3kg. Roues: 24 pouces. Non électrique.",
                'price' => "950",
                'brand' => "Tern",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Cyke 20-7",
                'description' => "Qualité allemande. Complet avec garde-boue et porte-bagages. Poids: 9.9kg. Roues: 20 pouces. Non électrique.",
                'price' => "380",
                'brand' => "Puky",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Tilt 500 E",
                'description' => "Pliable électrique Decathlon. Autonomie 35km. Poids: 18.6kg. Roues: 20 pouces. Électrique.",
                'price' => "850",
                'brand' => "Decathlon",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
            [
                'title' => "Ramones 16",
                'description' => "Mini VTT avec gros pneus pour les petits casse-cous. Poids: 8kg. Roues: 16 pouces. Non électrique.",
                'price' => "450",
                'brand' => "Commencal",
                'image' => "",
                'category' => "Enfant et Pliable"
            ],
        ];

        foreach ($arrayProducts as $value) {
            $product = new Products();
            $product->setTitle($value['title']);
            $product->setDescription($value['description']);
            $product->setPrice($value['price']);
            $product->setBrand($value['brand']);
            $product->setImagePath($value['image']);
            $product->setCreatedAt(new DateTime());
            $product->setIsActive(true);

            $manager->persist($product);
        }
    }

    public function loadUser(ObjectManager $manager)
    {
        $admin = new User();
        $admin->setEmail('admin@admin.com');
        $admin->setFirstname("Admin");
        $admin->setLastname("Admin");
        $admin->setPseudo('Admin');
        $admin->setPassword($this->passwordHasher->hashPassword($admin, 'admin'));
        $admin->setRoles(['ROLE_ADMIN', 'ROLE_USER']);
        $admin->setBirthday(new \DateTime('2026-03-20'));
        $admin->setCreatedAt(new DateTime());
        $admin->setUpdatedAt(new DateTime());
        $admin->setIsActive(true);

        $manager->persist($admin);

        // création d'utilisateur
        $arrayUser = [
            ['prenom' => 'Léna', 'nom' => 'Bertrand', 'email' => 'l.bertrand.crea@gmail.com', 'pseudo' => 'PixelArtiste_92', 'birthday' => '1992-05-14'],
            ['prenom' => 'Julien', 'nom' => 'Masson', 'email' => 'j-masson-85@gmail.com', 'pseudo' => 'JulesLeRandonneur', 'birthday' => '1985-11-03'],
            ['prenom' => 'Inès', 'nom' => 'Belkacem', 'email' => 'belkacem.ines@gmail.com', 'pseudo' => 'CyberInes_XP', 'birthday' => '2001-08-22']
        ];

        foreach ($arrayUser as $key => $value) {
            $user = new User();
            $user->setFirstname($value['prenom']);
            $user->setLastname($value['nom']);
            $user->setEmail($value['email']);
            $user->setPseudo($value['pseudo']);
            $user->setBirthday(new \DateTime($value['birthday']));
            $user->setPassword($this->passwordHasher->hashPassword($user, 'user'));
            $user->setRoles(['ROLE_USER']);
            $user->setCreatedAt(new DateTime());
            $user->setIsActive(true);

            $manager->persist($user);

            $this->addReference('user_' . $key, $user);
        }
    }

    public function loadCharacteristic(ObjectManager $manager)
    {
        $arrayCharacteristic = [
            [
                'type' => 'string',
                'description' => 'categorie_velo',
                'value' => 'VTT'
            ],
            [
                'type' => 'string',
                'description' => 'categorie_velo',
                'value' => 'Vélos ville'
            ],
            [
                'type' => 'string',
                'description' => 'categorie_velo',
                'value' => 'Vélos route'
            ],
            [
                'type' => 'string',
                'description' => 'categorie_velo',
                'value' => 'Vélos Electroques'
            ],
            [
                'type' => 'string',
                'description' => 'coleur',
                'value' => 'Bleu'
            ],
            [
                'type' => 'string',
                'description' => 'couleur',
                'value' => 'Noir'
            ],
        ];

        foreach ($arrayCharacteristic as $value) {
            $characteristic = new Characteristic();
            $characteristic->setType($value['type']);
            $characteristic->setDescription($value['description']);
            $characteristic->setValue($value['value']);

            $manager->persist($characteristic);
        }
    }

    public function loadAdress(ObjectManager $manager)
    {
        $arrayAdress = [
            [
                'number' => '42',
                'type' => 'rue',
                'label' => 'des Ateliers',
                'city' => 'Lyon',
                'complement' => 'Apprt. 304, Résidence les Peintres',
                'cp' => 69007
            ],
            [
                'number' => '15',
                'type' => 'Chemin',
                'label' => 'de la Lande',
                'city' => 'Vannes',
                'complement' => 'Maison secondaire (Portail Vert)',
                'cp' => 56000
            ],
            [
                'number' => '8 bis',
                'type' => 'Avenue',
                'label' => 'de la République',
                'city' => 'Montreuil',
                'complement' => 'Bâtiment C, Interphone 12B',
                'cp' => 93100
            ]
        ];
        foreach ($arrayAdress as $value) {
            $adress = new Adress();
            $adress->setNumber($value['number']);
            $adress->setType($value['type']);
            $adress->setLabel($value['label']);
            $adress->setComplement($value['complement']);
            $adress->setCity($value['city']);
            $adress->setCp($value['cp']);

            $manager->persist($adress);
        }
    }

    public function loadCompetition(ObjectManager $manager)
    {
        $arrayCompet = [
            [
                'title' => 'L\'Odyssée des Sommets',
                'description' => 'Une course de cyclisme sur route ultra-exigeante qui traverse les plus hauts cols de montagne. Les participants devront faire preuve d\'un mental d\'acier pour venir à bout des dénivelés positifs impressionnants. L\'accent est mis sur la performance pure et le dépassement de soi dans des décors alpins grandioses.',
                'maxPoeple' => 250,
                'startDate' => '2026-06-15 08:00:00',
                'endDate' => '2026-06-17 18:00:00'
            ],
            [
                'title' => 'La Trace Sauvage (Gravel & Bivouac)',
                'description' => 'Une compétition de type "Gravel" en semi-autonomie. Entre chemins de terre, sentiers forestiers et routes goudronnées oubliées, les cyclistes doivent naviguer à l\'aide d\'une trace GPS. Un point de bivouac commun est organisé à mi-parcours pour partager un moment convivial autour d\'un feu de camp.',
                'maxPoeple' => 100,
                'startDate' => '2026-09-12 08:00:00',
                'endDate' => '2026-09-14 08:00:00'
            ],
            [
                'title' => 'L Critérium Électrique Urbain ',
                'description' => 'Une course urbaine nocturne ultra-rapide réservée aux vélos à assistance électrique (VAE). Le circuit est court, technique, avec de nombreux virages serrés en plein centre-ville. C\'est un événement spectaculaire, conçu pour tester la maniabilité et la gestion de la batterie sous pression.',
                'maxPoeple' => 100,
                'startDate' => '2026-07-03 20:00:00',
                'endDate' => '2026-07-03 23:30:00'
            ]
        ];

        foreach ($arrayCompet as $value) {
            $competions = new Competition();
            $competions->setTitle($value['title']);
            $competions->setDescription($value['description']);
            $competions->setMaxPeople($value['maxPoeple']);
            $competions->setStartAt(new \DateTime($value['startDate']));
            $competions->setEndAt(new \DateTime($value['endDate']));
            $competions->setCreatedAt(new \DateTime());
            $competions->setIsActive(true);

            $manager->persist($competions);
        }
    }

    public function loadEtat(ObjectManager $manager)
    {
        $arrayEtat = ['En attentes de paiment', 'Payées', 'En cours de livraison'];

        foreach ($arrayEtat as $value) {
            $etat = new Etat();
            $etat->setLabel($value);

            $manager->persist($etat);
        }
    }

    public function loadPlaces(ObjectManager $manager)
    {
        $arrayPlaces = [
            [
                'name' => "Canal de la Robine",
                'description' => " Narbonne vers Port-la-Nouvelle.
                Vous longez le canal classé à l'UNESCO, traversez les étangs de Bages-Sigean avec souvent des flamants roses en spectacle.",
                'coordinates' => "43.1833° N, 3.0041° E",
                'elevation' => "10",
                'distance' => "15",
                'difficulty' => "Très facile",
                'floor' => "Gravier stabilisé"
            ],
            [
                'name' => "Lido de Sète",
                'description' => "De Marseillan-Plage à Sète. Une piste cyclable rectiligne entre le lido (la plage) et les vignes de Listel. Idéal pour s'arrêter se baigner.",
                'coordinates' => "43.3508° N, 3.5552° E",
                'elevation' => "5",
                'distance' => "12",
                'difficulty' => "Très facile",
                'floor' => "Bitume lisse"
            ],
            [
                'name' => "Coulée Verte du Sud Parisien",
                'description' => "De Paris à Massy. Un aménagement paysager qui suit le tracé du TGV Atlantique. Jardins, aires de jeux et verdure sans voitures.",
                'coordinates' => "48.8358° N, 2.3194° E",
                'elevation' => "80",
                'distance' => "14",
                'difficulty' => "Facile",
                'floor' => "Bitume"
            ],
            [
                'name' => "Bord du Lac d'Annecy (Nord)",
                'description' => "D'Annecy à Duingt. Longe la rive ouest du lac. Passage par un ancien tunnel ferroviaire avec vue imprenable sur les montagnes et l'eau turquoise.",
                'coordinates' => "45.8976° N, 6.1272° E",
                'elevation' => "5",
                'distance' => "12",
                'difficulty' => "Très facile",
                'floor' => "Bitume haute qualité"
            ]

        ];

        foreach ($arrayPlaces as $value) {
            $places = new Places();
            $places->setName($value['name']);
            $places->setDescription($value['description']);
            $places->setCoordinates($value['coordinates']);
            $places->setElevation($value['elevation']);
            $places->setDistance($value['distance']);
            $places->setDifficulty($value['difficulty']);
            $places->setFloor($value['floor']);
            $places->setCreatedAt(new \DateTime());
            $places->setIsActive(true);

            $manager->persist($places);
        }
    }

    public function loadPriceLicence(ObjectManager $manager)
    {
        $arrayPriceLicence = [
            [
                'label' => "FFC Jeunesse",
                'price' => "65",
            ],
            [
                'label' => "FFC Pass Découverte",
                'price' => "50",
            ],
            [
                'label' => "FFC Access (Compétition régionale)",
                'price' => "95",
            ],
            [
                'label' => "FFC Open (Compétition nationale)",
                'price' => "165",
            ],
            [
                'label' => "FFC Élite",
                'price' => "240",
            ],

        ];

        foreach ($arrayPriceLicence as $value) {
            $priceLicence = new PriceLicence();
            $priceLicence->setLabel($value['label']);
            $priceLicence->setPrice($value['price']);

            $manager->persist($priceLicence);
        }
    }
}
