//======================
// CONSTANTES DE L'API
//======================
// ce fichier centralisent toutes les URL de l'API Symfony 
// l'avantage: Modifier l'URL de base en un seul endroit 

// URL racine du serveur backend
export const API_ROOT = 'http://localhost:8087';

// l'URL de base pour l'API Plateform 
export const API_URL = `${API_ROOT}/api`;

// ==============================
// URLS DES RESSOURCES STATIQUES
// ==============================

// Image générales  (logo, ect)
export const IMAGE_URL = `${API_ROOT}/images`;

// Avatars des utilisateur 
export const AVATAR_URL = `${IMAGE_URL}/avatars`;

