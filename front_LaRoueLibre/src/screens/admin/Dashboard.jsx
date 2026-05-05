import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import { FaUsers, FaBicycle, FaMapMarkedAlt, FaShoppingBag, FaChartLine } from 'react-icons/fa';
import NavbarAdmin from '../../components/UI/admin/NavbarAdmin';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [stats, setStats] = useState({
        users: 0,
        products: 0,
        places: 0,
        orders: 0
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Les vérifications de rôles sont maintenant gérées par ProtectedRoute dans Router.jsx
        
        // Récupération des statistiques
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                
                // Fonction pour éviter que Promise.all ne crash si une route (ex: /api/users) renvoie 404
                const safeFetch = (url) => axios.get(url, config).catch(err => {
                    console.warn(`Erreur sur la route ${url}:`, err.message);
                    return { data: { 'hydra:totalItems': 0, 'hydra:member': [] } }; // Valeur par défaut
                });

                // Requêtes simultanées sécurisées
                const [usersRes, productsRes, placesRes, ordersRes] = await Promise.all([
                    safeFetch(`${API_ROOT}/api/users`),
                    safeFetch(`${API_ROOT}/api/products`),
                    safeFetch(`${API_ROOT}/api/places`),
                    safeFetch(`${API_ROOT}/api/orders`)
                ]);

                // API Platform renvoie généralement le total dans hydra:totalItems (si paginé) ou dans le tableau member
                const getCount = (res) => res.data['hydra:totalItems'] || res.data['hydra:member']?.length || res.data.member?.length || 0;

                setStats({
                    users: getCount(usersRes),
                    products: getCount(productsRes),
                    places: getCount(placesRes),
                    orders: getCount(ordersRes)
                });

            } catch (err) {
                console.error("Erreur Dashboard API:", err);
                setError("Impossible de charger les statistiques.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, [user, navigate]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue"><ButtonLoader size={60} /></div>;

    return (
        <div className="animate-fade-in">
            <div className="border-b border-white/10 pb-6 mb-10 flex items-center justify-between">
                    <div>
                        <h1 className="title-h1 flex items-center gap-3">
                            <FaChartLine className="text-orange" />
                            Dashboard Administrateur
                        </h1>
                        <p className="text-gray-400 mt-2">Vue d'ensemble des données de l'application LaRoueLibre</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-8">
                        {error}
                    </div>
                )}

                {/* CARTES DE STATISTIQUES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    
                    {/* Carte Utilisateurs */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl flex items-center gap-6 hover:border-orange/50 transition-colors">
                        <div className="p-4 bg-orange/20 text-orange rounded-xl"><FaUsers size={30} /></div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Utilisateurs</p>
                            <p className="text-3xl font-black">{stats.users}</p>
                        </div>
                    </div>

                    {/* Carte Produits */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl flex items-center gap-6 hover:border-orange/50 transition-colors">
                        <div className="p-4 bg-orange/20 text-orange rounded-xl"><FaBicycle size={30} /></div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Produits</p>
                            <p className="text-3xl font-black">{stats.products}</p>
                        </div>
                    </div>

                    {/* Carte Lieux */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl flex items-center gap-6 hover:border-orange/50 transition-colors">
                        <div className="p-4 bg-orange/20 text-orange rounded-xl"><FaMapMarkedAlt size={30} /></div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Itinéraires</p>
                            <p className="text-3xl font-black">{stats.places}</p>
                        </div>
                    </div>

                    {/* Carte Commandes */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl flex items-center gap-6 hover:border-orange/50 transition-colors">
                        <div className="p-4 bg-orange/20 text-orange rounded-xl"><FaShoppingBag size={30} /></div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider font-bold">Commandes</p>
                            <p className="text-3xl font-black">{stats.orders}</p>
                        </div>
                    </div>

            </div>
        </div>
    );
};

export default Dashboard;