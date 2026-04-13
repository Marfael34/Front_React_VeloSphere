import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaChevronLeft, FaEdit, FaShoppingCart } from 'react-icons/fa';

const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState(null);
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const productRes = await axios.get(`${API_ROOT}/api/products/${id}`);
                setProduct(productRes.data);

                if (user?.token && user?.id) {
                    const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };
                    const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
                    const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];

                    // On utilise l'orthographe EXACTE de tes fixtures
                    const etatCible = etats.find(e => e.label === "En attente de paiement");

                    if (etatCible) {
                        const cartRes = await axios.get(
                            `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatCible['@id']}`,
                            authConfig
                        );
                        const cartsData = cartRes.data.member || cartRes.data['hydra:member'] || [];
                        if (cartsData.length > 0) {
                            setCart(cartsData[0]); 
                        }
                    }
                }
            } catch (error) {
                console.error("Erreur API :", error);
                setError("Impossible de charger le produit.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [id, user]);

    const handleAddToCart = async () => {
    if (!user || !user.token) {
        navigate('/login');
        return;
    }

    // Sécurité : Vérification du stock avant même de tenter l'ajout
    if (product.quantity <= 0) {
        alert("Désolé, ce produit est en rupture de stock.");
        return;
    }

    try {
        const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };

        // 1. Récupération des états avec une recherche plus souple
        const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
        const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];
        
        // On cherche l'état qui contient "attente" pour éviter les erreurs de frappe strictes
        const etatEnAttente = etats.find(e => 
            e.label.toLowerCase().includes("attente")
        );

        if (!etatEnAttente) {
            alert("Erreur : l'état 'En attente de paiement' est introuvable dans la base de données. Avez-vous chargé les fixtures ?");
            return;
        }

        const etatIri = etatEnAttente['@id'];
        const productIri = product['@id'] || `/api/products/${product.id}`;

        // 2. Recherche du panier
        const panierRes = await axios.get(
            `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatIri}`,
            authConfig
        );
        const paniersExistants = panierRes.data.member || panierRes.data['hydra:member'] || [];

        if (paniersExistants.length > 0) {
            const panierActuel = paniersExistants[0];
            const produitsActuelsIris = panierActuel.products.map(p => 
                typeof p === 'string' ? p : (p['@id'] || `/api/products/${p.id}`)
            );
            
            const nouveauxProduits = [...produitsActuelsIris, productIri];

            await axios.patch(`${API_ROOT}/api/paniers/${panierActuel.id}`, 
                { products: nouveauxProduits }, 
                {
                    headers: { 
                        'Content-Type': 'application/merge-patch+json',
                        'Authorization': `Bearer ${user.token}` 
                    }
                }
            );
            alert("Produit ajouté !");
        } else {
            await axios.post(`${API_ROOT}/api/paniers`, 
                {
                    user: `/api/users/${user.id}`,
                    etat: etatIri,
                    products: [productIri]
                }, 
                {
                    headers: { 
                        'Content-Type': 'application/ld+json',
                        'Authorization': `Bearer ${user.token}` 
                    }
                }
            );
            alert("Nouveau panier créé !");
        }
    } catch (error) {
        console.error("Erreur détaillée :", error.response?.data);
        alert("Erreur lors de l'ajout au panier.");
    }
};

    const getRolesFromToken = (token) => {
        if (!token) return [];
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
            return JSON.parse(jsonPayload).roles || [];
        } catch (error) { return []; }
    };

    const isAdmin = getRolesFromToken(user?.token).includes("ROLE_ADMIN");

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue"><ButtonLoader size={60} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-white bg-dark-nigth-blue"><p>{error}</p></div>;
    if (!product) return null; 

    return (
        <div className="bg-dark-nigth-blue min-h-screen pb-10 text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-orange mb-8 transition-colors">
                    <FaChevronLeft /> Retour au catalogue
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-black/30 p-8 rounded-3xl border border-white/10 shadow-2xl">
                    <div className="flex items-center justify-center bg-white/5 rounded-2xl p-4">
                        <img 
                            src={`${API_ROOT}${product.imagePath}`} 
                            alt={product.title}
                            className="max-h-125 object-contain rounded-xl"
                            onError={(e) => { e.target.src = `${IMAGE_URL}/default/default_product.png`; }}
                        />
                    </div>

                    <div className="flex flex-col">
                        <span className="text-orange font-bold uppercase tracking-wider text-sm mb-2">{product.brand || "LaRoueLibre"}</span>
                        <div className="flex justify-between items-start">
                            <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                            {isAdmin && (
                                <Link to={`/admin/edit-product/${product.id}`} className="bg-orange text-black p-3 rounded-full hover:scale-110 transition shadow-lg">
                                    <FaEdit size={20} />
                                </Link>
                            )}
                        </div>
                        
                        <p className="text-3xl font-bold text-orange mb-2">{product.price} €</p>
                        
                        {/* AFFICHAGE DU STOCK */}
                        <div className={`mb-6 font-bold ${product.quantity > 0 ? 'text-green-400' : 'text-red-500'}`}>
                            {product.quantity > 0 ? `En stock : ${product.quantity} unité(s)` : 'Rupture de stock'}
                        </div>
                        
                        <div className="border-t border-white/10 pt-6 mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-300">Description</h3>
                            <p className="text-gray-400 leading-relaxed">{product.description || "Aucune description."}</p>
                        </div>

                        <button 
                            onClick={handleAddToCart}
                            disabled={product.quantity <= 0}
                            className={`mt-auto flex items-center justify-center gap-3 w-full py-4 rounded-xl font-bold transition-all ${product.quantity <= 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-orange text-black hover:scale-105'}`}
                        >
                            <FaShoppingCart /> {product.quantity > 0 ? 'Ajouter au panier' : 'Indisponible'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;