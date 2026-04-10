import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { API_ROOT, IMAGE_URL } from '../constants/apiConstant';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaUser, FaShoppingBag, FaHistory, FaMapMarkerAlt, FaBirthdayCake } from 'react-icons/fa';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [fullUser, setFullUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            // 1. Vérification du token
            if (!user?.token || !user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const authConfig = {
                    headers: { Authorization: `Bearer ${user.token}` }
                };

                // 2. Appel API User
                const userRes = await axios.get(`${API_ROOT}/api/users/${user.id}`, authConfig);
                setFullUser(userRes.data);

                // 3. Appel API Panier (Etat 1 = en cours)
                try {
                    const cartRes = await axios.get(
                        `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=/api/etats/1`,
                        authConfig
                    );
                    setCart(cartRes.data['hydra:member']?.[0] || null);
                } catch (e) { console.error("Erreur panier:", e); }

                // 4. Appel API Commandes (Etat différent de 1)
                try {
                    const ordersRes = await axios.get(
                        `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat[not]=1`,
                        authConfig
                    );
                    setOrders(ordersRes.data['hydra:member'] || []);
                } catch (e) { console.error("Erreur commandes:", e); }

            } catch (error) {
                console.error("PROFIL: Erreur globale lors du chargement :", error);
                setError("Impossible de charger les données du profil.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    // Cas 1 : Utilisateur non connecté
    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-dark-nigth-blue">
                <p className="mb-4">Veuillez vous connecter pour accéder à votre profil.</p>
                <Link to="/login" className="main-button w-auto px-6">Se connecter</Link>
            </div>
        );
    }

    // Cas 2 : Chargement en cours
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue">
                <ButtonLoader size={60} />
            </div>
        );
    }

    // Cas 3 : Erreur API
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500 bg-dark-nigth-blue">
                <p>{error}</p>
            </div>
        );
    }

    // Fonction de formatage date sécurisée
    const formatDate = (dateString) => {
        if (!dateString) return "Non renseignée";
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch (error) { return "Date invalide"; }
    };

    return (
        <div className="bg-dark-nigth-blue min-h-screen pb-10">
            <div className="max-w-7xl mx-auto px-4 py-10 text-white">
                <h1 className="title-h1 mb-10">Mon Profil</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* COLONNE GAUCHE : INFOS & AVATAR */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl h-fit">
                        
                        <div className="flex flex-col items-center mb-8">
                           <div className="relative w-32 h-32 mb-4">
                                <img 
                                    src={
                                        fullUser?.avatar 
                                            ? `${API_ROOT}${fullUser.avatar.startsWith('/') ? '' : '/'}${fullUser.avatar}` 
                                            : `${IMAGE_URL}/default/avatar/default-avatar-1.png` // Remplace par le nom exact de ton fichier
                                    } 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-full border-4 border-orange shadow-lg"
                                    onError={(e) => { 
                                        // Si l'image de l'utilisateur n'existe pas physiquement sur le serveur (404)
                                        e.target.onerror = null; 
                                        e.target.src = `${IMAGE_URL}/default/avatar/default-avatar-1.png`; 
                                    }}
                                />
                            </div>
                            <h2 className="text-2xl font-bold">
                                {fullUser?.firstname || fullUser?.firstName || "Prénom"} {fullUser?.lastname || fullUser?.lastName || "Nom"}
                            </h2>
                            <p className="text-orange font-medium">@{fullUser?.pseudo || "Pseudo"}</p>
                        </div>

                        <div className="space-y-5 border-t border-white/10 pt-6">
                            <div>
                                <p className="text-gray-400 text-sm">Email</p>
                                <p className="font-medium">{fullUser?.email || user.email}</p>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                <FaBirthdayCake className="text-orange" size={18} />
                                <div>
                                    <p className="text-gray-400 text-sm">Date de naissance</p>
                                    <p className="font-medium">{formatDate(fullUser?.birthday)}</p>
                                </div>
                            </div>

                            {/* Dans src/screens/Profile.jsx */}

                            <div className="pt-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <FaMapMarkerAlt className="text-orange" size={18} />
                                    <p className="text-gray-400 text-sm">Mon Adresse</p>
                                </div>
                                
                                {fullUser?.adresses && fullUser.adresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {fullUser.adresses.map((adr, index) => {
                                            // Si l'API renvoie encore une chaîne (IRI), on affiche une alerte de debug
                                            if (typeof adr === 'string') {
                                                return (
                                                    <p key={index} className="text-xs text-red-400 italic">
                                                        Problème lors du chargement des données : {adr}
                                                    </p>
                                                );
                                            }

                                            return (
                                                <div key={index} className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                                                    <p className="font-medium">
                                                        {/* Utilisation des nouveaux noms de champs de votre entité Adress */}
                                                        {adr.number} {adr.type} {adr.label}
                                                    </p>
                                                    {adr.complement && (
                                                        <p className="text-gray-400 italic text-xs">{adr.complement}</p>
                                                    )}
                                                    <p className="font-bold text-orange mt-1">
                                                        {adr.cp} {adr.city}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic text-sm ml-7">Aucune adresse enregistrée</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE : PANIER & COMMANDES */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Panier (Simplifié pour test) */}
                        <div className="bg-nigth-blue p-6 rounded-2xl shadow-lg border border-white/5">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                                <FaShoppingBag className="text-orange" /> Panier en cours
                            </h2>
                            {cart?.products?.length > 0 ? (
                                <p>{cart.products.length} produit(s) dans le panier.</p>
                            ) : <p className="text-gray-400 italic">Votre panier est vide.</p>}
                        </div>

                        {/* Commandes (Simplifié pour test) */}
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6">
                                <FaHistory className="text-orange" /> Historique
                            </h2>
                            {orders.length > 0 ? (
                                <p>{orders.length} commande(s) passée(s).</p>
                            ) : <p className="text-gray-400 italic">Aucune commande.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;