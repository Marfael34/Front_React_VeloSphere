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
                // 👉 2. ON CHARGE D'ABORD LE PRODUIT (C'est ce qu'il manquait !)
                const productRes = await axios.get(`${API_ROOT}/api/products/${id}`);
                setProduct(productRes.data);

                // 👉 3. SI LE USER EST CONNECTÉ, ON CHERCHE SON PANIER
                if (user?.token && user?.id) {
                    const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };
                    
                    const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
                    const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];
                    console.log("Vérification des états reçus :", etatsRes.data);

                    const etatCible = etats.find(e => 
                        e.label.replace(/\s+/g, ' ').trim().toLowerCase().includes("attente")
                    );

                    if (etatCible) {
                        const cartRes = await axios.get(
                            `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatCible['@id']}`,
                            authConfig
                        );
                        const cartsData = cartRes.data['hydra:member'] || [];
                        if (cartsData.length > 0) {
                            setCart(cartsData[0]); // On stocke le panier s'il existe
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

    // 👉 4. LOGIQUE D'AJOUT AU PANIER OPTIMISÉE
    const handleAddToCart = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const productIri = `/api/products/${product.id}`;

            if (cart) {
                // ---> UN PANIER EXISTE DÉJÀ : ON FAIT UN PATCH <---
                const authConfigPatch = {
                    headers: { 'Content-Type': 'application/merge-patch+json', Authorization: `Bearer ${user.token}` }
                };

                const currentProductIris = (cart.products || []).map(p => `/api/products/${p.id}`);
                
                // Sécurité : éviter les doublons
                if (currentProductIris.includes(productIri)) {
                    alert("Ce produit est déjà dans votre panier !");
                    return;
                }

                currentProductIris.push(productIri);

                await axios.patch(`${API_ROOT}/api/paniers/${cart.id}`, { products: currentProductIris }, authConfigPatch);
                
                alert(`${product.title} a été ajouté à votre panier !`);
                
                // On met à jour le state local sans avoir besoin de recharger la page
                setCart({ ...cart, products: [...cart.products, product] });
                
            } else {
                // ---> AUCUN PANIER ACTIF : ON LE CRÉE AVEC POST <---
                const authConfigPost = {
                    headers: { 'Content-Type': 'application/ld+json', Authorization: `Bearer ${user.token}` }
                };

                const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfigPost);
                const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];
                const etatCible = etats.find(e => e.label.replace(/\s+/g, ' ').trim().toLowerCase().includes("attente"));

                if (!etatCible) {
                    alert("Configuration manquante : Aucun état valide trouvé.");
                    return;
                }

                const newCartRes = await axios.post(
                    `${API_ROOT}/api/paniers`,
                    {
                        user: `/api/users/${user.id}`,
                        etat: etatCible['@id'],
                        products: [productIri] 
                    },
                    authConfigPost
                );
                
                alert(`Nouveau panier créé et ${product.title} ajouté !`);
                setCart(newCartRes.data);
            }

        } catch (error) {
            console.error("Erreur lors de l'ajout au panier :", error);
            alert("Une erreur de connexion est survenue.");
        }
    };

    // Gestion du rôle Admin
    const getRolesFromToken = (token) => {
        if (!token) return [];
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload).roles || [];
        } catch (error) { return []; }
    };

    const userRoles = getRolesFromToken(user?.token);
    const isAdmin = userRoles.includes("ROLE_ADMIN");

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue"><ButtonLoader size={60} /></div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-white bg-dark-nigth-blue"><p>{error}</p></div>;
    if (!product) return null; // Sécurité supplémentaire

    return (
        <div className="bg-dark-nigth-blue min-h-screen pb-10 text-white">
            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Bouton Retour */}
                <button 
                    onClick={() => navigate(-1)} 
                    className="flex items-center gap-2 text-gray-400 hover:text-orange mb-8 transition-colors"
                >
                    <FaChevronLeft /> Retour au catalogue
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-black/30 p-8 rounded-3xl border border-white/10 shadow-2xl">
                    {/* Colonne Image */}
                    <div className="flex items-center justify-center bg-white/5 rounded-2xl p-4">
                        <img 
                            src={`${API_ROOT}${product.imagePath}`} 
                            alt={product.title}
                            className="max-h-125 object-contain rounded-xl"
                            onError={(e) => { e.target.src = `${IMAGE_URL}/default/default_product.png`; }}
                        />
                    </div>

                    {/* Colonne Infos */}
                    <div className="flex flex-col">
                        <span className="text-orange font-bold uppercase tracking-wider text-sm mb-2">
                            {product.brand || "LaRoueLibre"}
                        </span>
                        <div className="flex justify-between items-start">
                          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>
                        
                            {isAdmin && (
                                <Link 
                                    to={`/admin/edit-product/${product.id}`}
                                    className="bg-orange text-black p-3 rounded-full hover:scale-110 transition shadow-lg"
                                    title="Modifier le produit"
                                >
                                    <FaEdit size={20} />
                                </Link>
                            )}
                        </div>
                        <p className="text-3xl font-bold text-orange mb-6">{product.price} €</p>
                        
                        <div className="border-t border-white/10 pt-6 mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-gray-300">Description</h3>
                            <p className="text-gray-400 leading-relaxed">
                                {product.description || "Aucune description disponible pour ce produit."}
                            </p>
                        </div>

                        {/* Caractéristiques techniques */}
                        {product.characteristics && product.characteristics.length > 0 && (
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold mb-3 text-gray-300">Spécifications</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {product.characteristics.map((char, index) => (
                                        <div key={index} className="bg-white/5 p-3 rounded-lg border border-white/5">
                                            <p className="text-xs text-gray-500 uppercase">{char.type}</p>
                                            <p className="font-medium">{char.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleAddToCart}
                            className="main-button mt-auto flex items-center justify-center gap-3"
                        >
                            <FaShoppingCart /> Ajouter au panier
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;