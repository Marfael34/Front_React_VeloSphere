<?php
try {
    $pdo = new PDO("mysql:host=127.0.0.1;port=3306;dbname=larouelibre", "admin", "admin");
    $stmt = $pdo->query("SELECT id, name, coordinates, trajet FROM places");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach ($rows as &$row) {
        $row['trajet'] = json_decode($row['trajet'], true);
    }
    echo json_encode($rows, JSON_PRETTY_PRINT);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
