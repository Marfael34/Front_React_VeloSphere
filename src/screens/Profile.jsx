import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { API_ROOT, IMAGE_URL } from '../constants/apiConstant';
import axios from 'axios';
import { Link } from 'react-router-dom';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaUser, FaShoppingBag, FaHistory, FaMapMarkerAlt, FaBirthdayCake, FaBoxOpen } from 'react-icons/fa';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const [fullUser, setFullUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!user?.token || !user?.id) {
                setIsLoading(false);
                return;
            }

            try {
                const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };

                // 1. Appel API User
                const userRes = await axios.get(`${API_ROOT}/api/users/${user.id}`, authConfig);
                setFullUser(userRes.data);

                // 2. Récupérer les états
                const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
                const etats = etatsRes.data['hydra:member'] || [];
                
                const etatEnCours = etats.find(e => e.label === "En attente de paiement");

                if (etatEnCours) {
                    const etatIri = etatEnCours['@id'];

                    // 3. Appel API Panier
                    try {
                        const cartRes = await axios.get(
                            `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatIri}`,
                            authConfig
                        );
                        setCart(cartRes.data['hydra:member']?.[0] || null);
                    } catch (cartErr) { 
                        console.error("Panier vide ou erreur:", cartErr); 
                    }

                    // 4. Appel API Commandes
                    try {
                        const ordersRes = await axios.get(
                            `${API_ROOT}/api/orders?user=/api/users/${user.id}`,
                            authConfig
                        );
                        setOrders(ordersRes.data['hydra:member'] || []);
                    } catch (orderErr) { 
                        console.error("Erreur commandes:", orderErr); 
                    }
                }
            } catch (err) {
                console.error("PROFIL: Erreur globale lors du chargement :", err);
                setError("Impossible de charger les données du profil.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchProfileData();
    }, [user]);

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-white bg-dark-nigth-blue">
                <p className="mb-4">Veuillez vous connecter pour accéder à votre profil.</p>
                <Link to="/login" className="main-button w-auto px-6">Se connecter</Link>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue">
                <ButtonLoader size={60} />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500 bg-dark-nigth-blue">
                <p>{error}</p>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Non renseignée";
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch (err) { return "Date invalide"; }
    };

    // Calcul du total du panier
    const calculateCartTotal = () => {
        if (!cart || !cart.products) return 0;
        return cart.products.reduce((total, product) => total + (product.price || 0), 0).toFixed(2);
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
                                            : `${IMAGE_URL}/default/avatar/default-avatar-1.png` 
                                    } 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover rounded-full border-4 border-orange shadow-lg"
                                    onError={(e) => { 
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

                            <div className="pt-2">
                                <div className="flex items-center gap-3 mb-3">
                                    <FaMapMarkerAlt className="text-orange" size={18} />
                                    <p className="text-gray-400 text-sm">Mon Adresse</p>
                                </div>
                                
                                {fullUser?.adresses && fullUser.adresses.length > 0 ? (
                                    <div className="space-y-3">
                                        {fullUser.adresses.map((adr, index) => {
                                            if (typeof adr === 'string') return null;
                                            return (
                                                <div key={index} className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                                                    <p className="font-medium">{adr.number} {adr.type} {adr.label}</p>
                                                    {adr.complement && <p className="text-gray-400 italic text-xs">{adr.complement}</p>}
                                                    <p className="font-bold text-orange mt-1">{adr.cp} {adr.city}</p>
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
                        
                        {/* --- SECTION PANIER DÉTAILLÉ --- */}
                        <div className="bg-nigth-blue p-6 rounded-2xl shadow-lg border border-white/5">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                <FaShoppingBag className="text-orange" /> Mon Panier en cours
                            </h2>
                            
                            {cart?.products?.length > 0 ? (
                                <div>
                                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {cart.products.map((product, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5 hover:border-orange/30 transition">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center text-gray-400">
                                                        <FaBoxOpen size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm text-white">{product.title || "Produit"}</p>
                                                        <p className="text-xs text-gray-400">{product.brand || "Marque inconnue"}</p>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-orange whitespace-nowrap">
                                                    {product.price} €
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between bg-black/40 p-4 rounded-xl border border-white/10">
                                        <div>
                                            <p className="text-gray-400 text-sm">Total à régler</p>
                                            <p className="text-2xl font-black text-orange">{calculateCartTotal()} €</p>
                                        </div>
                                        <Link to="/panier" className="main-button !m-0 !py-2 !px-6 text-sm">
                                            Finaliser l'achat
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-center py-6 bg-black/20 rounded-xl">
                                    Votre panier est actuellement vide.
                                </p>
                            )}
                        </div>

                        {/* --- SECTION HISTORIQUE DES COMMANDES --- */}
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                <FaHistory className="text-orange" /> Historique & Factures
                            </h2>
                            {orders.length > 0 ? (
                                <div className="space-y-4">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white/5 p-4 rounded-xl flex justify-between items-center border border-white/5 hover:border-orange/30 transition">
                                            <div>
                                                <p className="font-bold text-lg">Commande #{order.id}</p>
                                                <p className="text-sm text-gray-400 flex items-center gap-2">
                                                    <FaBoxOpen className="text-gray-500" /> {order.products?.length || 0} article(s)
                                                </p>
                                                <span className="inline-block mt-2 px-2 py-1 text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30 rounded-md">
                                                    Statut : Payée
                                                </span>
                                            </div>
                                            <Link 
                                                to={`/invoice/${order.id}`} 
                                                className="bg-white/10 hover:bg-orange text-white hover:text-black font-bold px-4 py-2 rounded-lg text-sm transition duration-300 shadow-md"
                                            >
                                                Voir la facture
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-center py-6 bg-white/5 rounded-xl border border-white/5">
                                    Vous n'avez pas encore passé de commande.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;