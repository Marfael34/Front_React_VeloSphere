import React, { useContext, useEffect, useState, useMemo } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { API_ROOT, IMAGE_URL } from '../constants/apiConstant';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom'; 
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaUser, FaShoppingBag, FaHistory, FaMapMarkerAlt, FaBirthdayCake, FaBoxOpen, FaEdit } from 'react-icons/fa';
import DeliveryTracker from '../components/UI/Order/DeliveryTracker';
import CustomButton from '../components/UI/CustomButton';
import EditProfileForm from '../components/Market/EditProfileForm';

const Profile = () => {
    const { user, setUser } = useContext(AuthContext);
    const [fullUser, setFullUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    
    const navigate = useNavigate(); 

    const fetchProfileData = async () => {
        if (!user?.token || !user?.id) {
            navigate('/login'); 
            return;
        }

        try {
            const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };

            // 1. Appel API User
            const userRes = await axios.get(`${API_ROOT}/api/users/${user.id}`, authConfig);
            setFullUser(userRes.data);

            // 2. Récupérer les états pour le panier
            const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
            const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];
            const etatEnCours = etats.find(e => e.label === "En attentes de paiement" || e.label.toLowerCase().includes("attente"));

            if (etatEnCours) {
                const etatIri = etatEnCours['@id'] || `/api/etats/${etatEnCours.id}`;
                try {
                    const cartRes = await axios.get(
                        `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatIri}`,
                        authConfig
                    );
                    const cartData = cartRes.data.member || cartRes.data['hydra:member'] || [];
                    setCart(cartData[0] || null);
                } catch (cartErr) { console.error("Erreur panier:", cartErr); }
            }

            // 3. Appel API Commandes
            try {
                const ordersRes = await axios.get(
                    `${API_ROOT}/api/orders?user=/api/users/${user.id}`,
                    authConfig
                );
                const ordersData = ordersRes.data.member || ordersRes.data['hydra:member'] || [];
                setOrders(ordersData);
            } catch (orderErr) { console.error("Erreur commandes:", orderErr); }

        } catch (err) {
            console.error("PROFIL Error:", err);
            setError("Impossible de charger les données du profil.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [user, navigate]);

    // Logique d'agrégation du panier (identique à votre original)
    const aggregatedCartItems = useMemo(() => {
        if (!cart || !cart.items) return [];
        const groups = cart.items.reduce((acc, item) => {
            const product = item.product;
            if (!product) return acc;
            const pid = product.id;
            if (!acc[pid]) {
                acc[pid] = { product: product, quantity: 0, totalPrice: 0 };
            }
            acc[pid].quantity += item.quantity;
            acc[pid].totalPrice += (parseFloat(product.price) || 0) * item.quantity;
            return acc;
        }, {});
        return Object.values(groups);
    }, [cart]);

    const calculateCartTotal = () => {
        return aggregatedCartItems.reduce((total, item) => total + item.totalPrice, 0).toFixed(2);
    };

    const handleUpdateSuccess = (updatedUser) => {
        setIsEditing(false);
        setFullUser(updatedUser);
        // On rafraîchit les infos globales du contexte (pseudo, etc)
        setUser({ ...user, ...updatedUser }); 
        fetchProfileData(); // On recharge tout pour être sûr
    };

    if (!user) return null; 
    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue"><ButtonLoader size={60} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500 bg-dark-nigth-blue"><p>{error}</p></div>;

    const formatDate = (dateString) => {
        if (!dateString) return "Non renseignée";
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
        } catch (err) { return "Date invalide"; }
    };

    return (
        <div className="bg-dark-nigth-blue min-h-screen pb-10">
            <div className="max-w-7xl mx-auto px-4 py-10 text-white">
                <div className="flex justify-between items-center mb-10">
                    <h1 className="title-h1">Mon Profil</h1>
                    {!isEditing && (
                        <CustomButton onClick={() => setIsEditing(true)} className="!py-2 !px-4 text-sm">
                            <FaEdit /> Modifier mon profil
                        </CustomButton>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* COLONNE GAUCHE : INFOS OU FORMULAIRE */}
                    <div className="bg-black/40 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl h-fit">
                        {isEditing ? (
                            <EditProfileForm 
                                user={user}
                                fullUser={fullUser}
                                onCancel={() => setIsEditing(false)}
                                onSuccess={handleUpdateSuccess}
                            />
                        ) : (
                            <>
                                <div className="flex flex-col items-center mb-8">
                                    <div className="relative w-32 h-32 mb-4">
                                        <img 
                                            src={fullUser?.avatar ? `${API_ROOT}${fullUser.avatar.startsWith('/') ? '' : '/'}${fullUser.avatar}` : `${IMAGE_URL}/default/avatar/default-avatar-1.png`} 
                                            alt="Avatar" 
                                            className="w-full h-full object-cover rounded-full border-4 border-orange shadow-lg"
                                            onError={(e) => { e.target.onerror = null; e.target.src = `${IMAGE_URL}/default/avatar/default-avatar-1.png`; }}
                                        />
                                    </div>
                                    <h2 className="text-2xl font-bold">{fullUser?.firstname || fullUser?.firstName} {fullUser?.lastname || fullUser?.lastName}</h2>
                                    <p className="text-orange font-medium">@{fullUser?.pseudo}</p>
                                </div>

                                <div className="space-y-5 border-t border-white/10 pt-6">
                                    <div>
                                        <p className="text-gray-400 text-sm">Email</p>
                                        <p className="font-medium">{fullUser?.email}</p>
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
                                                {fullUser.adresses.map((adr, index) => (
                                                    <div key={index} className="bg-white/5 p-3 rounded-lg border border-white/5 text-sm">
                                                        <p className="font-medium">{adr.number} {adr.type} {adr.label}</p>
                                                        {adr.complement && <p className="text-gray-400 italic text-xs">{adr.complement}</p>}
                                                        <p className="font-bold text-orange mt-1">{adr.cp} {adr.city}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p className="text-gray-500 italic text-sm ml-7">Aucune adresse enregistrée</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* COLONNE DROITE : PANIER & COMMANDES (Identique à votre original) */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* PANIER */}
                        <div className="bg-nigth-blue p-6 rounded-2xl shadow-lg border border-white/5">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                <FaShoppingBag className="text-orange" /> Mon Panier en cours
                            </h2>
                            {aggregatedCartItems.length > 0 ? (
                                <div>
                                    <div className="space-y-3 mb-6 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                        {aggregatedCartItems.map((item, idx) => (
                                            <div key={idx} className="flex justify-between items-center bg-black/20 p-3 rounded-xl border border-white/5">
                                                <div className="flex items-center gap-4">
                                                    <img 
                                                        src={item.product.imagePath ? `${API_ROOT}${item.product.imagePath}` : `${IMAGE_URL}/default/default_product.png`} 
                                                        alt={item.product.title} 
                                                        className="w-12 h-12 object-contain rounded-lg bg-white/10"
                                                    />
                                                    <div>
                                                        <p className="font-bold text-sm text-white">
                                                            {item.product.title} <span className="text-orange text-xs ml-1">(x{item.quantity})</span>
                                                        </p>
                                                        <p className="text-xs text-gray-400">{item.product.brand}</p>
                                                    </div>
                                                </div>
                                                <div className="font-bold text-orange">{item.totalPrice.toFixed(2)} €</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-black/40 p-5 rounded-xl border border-white/10">
                                        <div className="flex items-center justify-between mb-4">
                                            <p className="text-gray-400 text-sm">Total à régler</p>
                                            <p className="text-2xl font-black text-orange">{calculateCartTotal()} €</p>
                                        </div>
                                        <Link to="/panier" className="main-button block text-center w-full !m-0 !py-3 text-sm">
                                            Finaliser l'achat
                                        </Link>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-center py-6 bg-black/20 rounded-xl">Votre panier est vide.</p>
                            )}
                        </div>

                        {/* COMMANDES */}
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/10">
                            <h2 className="text-xl font-bold flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                                <FaHistory className="text-orange" /> Historique & Factures
                            </h2>
                            {orders.length > 0 ? (
                                <div className="space-y-6">
                                    {orders.map((order) => (
                                        <div key={order.id} className="bg-white/5 p-5 rounded-xl border border-white/5">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-bold text-lg">Commande #{order.id}</p>
                                                    <p className="text-sm text-gray-400 flex items-center gap-2">
                                                        <FaBoxOpen className="text-gray-500" /> {order.products?.length || 0} article(s)
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Le : {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Inconnue"}
                                                    </p>
                                                </div>
                                                {order.path && (
                                                    <a href={`${API_ROOT}${order.path}`} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-orange text-white hover:text-black font-bold px-4 py-2 rounded-lg text-sm transition">
                                                        Voir la facture
                                                    </a>
                                                )}
                                            </div>
                                            <hr className="border-white/5 my-4" />
                                            <div className="w-full">
                                                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Suivi :</p>
                                                <DeliveryTracker statusLabel={order.etat?.label} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 italic text-center py-6 bg-white/5 rounded-xl border border-white/5">Aucune commande.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;