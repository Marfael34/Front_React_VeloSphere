import React, { useState, useEffect, useContext, useMemo } from 'react';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { Link, useNavigate } from 'react-router-dom'; 

const Panier = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);
  
  const navigate = useNavigate(); 

  useEffect(() => {
    if (!user?.id || !user?.token) {
      navigate('/login');
      return; 
    }

    const fetchCart = async () => {
      try {
        const authConfig = { headers: { Authorization: `Bearer ${user.token}` } };
        const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
        const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];
        const etatCible = etats.find(e => e.label === "En attentes de paiement" || e.label.toLowerCase().includes("attente"));

        if (!etatCible) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatCible['@id']}`,
          authConfig
        );

        const cartsData = response.data.member || response.data['hydra:member'] || [];
        if (cartsData.length > 0) {
          setCart(cartsData[0]);
        } else {
          setCart(null);
        }
      } catch (error) {
        console.error("Erreur API Panier :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  //Regroupe les items et on les trie par ID pour que l'ordre reste fixe
  const aggregatedCartItems = useMemo(() => {
    if (!cart?.items) return [];
    
    const groups = cart.items.reduce((acc, item) => {
      const product = item.product;
      if (!product) return acc;
      const pid = product.id;
      
      if (!acc[pid]) {
        acc[pid] = { product: product, quantity: 0, dbIds: [] };
      }
      acc[pid].quantity += item.quantity;
      acc[pid].dbIds.push(item.id); 
      return acc;
    }, {});

    return Object.values(groups).sort((a, b) => a.product.id - b.product.id);
  }, [cart]);

  const calculateTotal = () => {
    return aggregatedCartItems.reduce((acc, item) => {
      return acc + (parseFloat(item.product.price || 0) * item.quantity);
    }, 0).toFixed(2);
  };

  const getTotalArticlesCount = () => {
    return aggregatedCartItems.reduce((acc, item) => acc + item.quantity, 0);
  };

  // Fonction pour mettre à jour la quantité (+ ou -)
  const handleUpdateQuantity = async (aggregatedItem, delta) => {
    // 1. Vérification du stock disponible
    if (delta === 1 && aggregatedItem.quantity >= aggregatedItem.product.quantity) {
      alert(`Stock maximum atteint. Il ne reste que ${aggregatedItem.product.quantity} unité(s).`);
      return;
    }

    // 2. Si on est à 1 et qu'on fait -1, on supprime le produit complètement
    if (delta === -1 && aggregatedItem.quantity === 1) {
      return handleRemoveProduct(aggregatedItem.dbIds);
    }

    try {
      // On cible la première ligne correspondante dans la BDD
      const targetDbId = aggregatedItem.dbIds[0];
      const originalItem = cart.items.find(i => i.id === targetDbId);

      const authConfig = { 
        headers: { 
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/merge-patch+json' // Requis pour les requêtes PATCH sur API Platform
        } 
      };

      // Si la ligne ciblée a une quantité de 1 et qu'on fait -1, on supprime la ligne
      if (delta === -1 && originalItem.quantity === 1) {
        await axios.delete(`${API_ROOT}/api/panier_items/${targetDbId}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        setCart(prev => ({
          ...prev,
          items: prev.items.filter(item => item.id !== targetDbId)
        }));
        return;
      }

      // Mise à jour classique avec PATCH
      const newQuantity = originalItem.quantity + delta;
      await axios.patch(`${API_ROOT}/api/panier_items/${targetDbId}`, 
        { quantity: newQuantity }, 
        authConfig
      );

      // Mise à jour immédiate de l'interface visuelle
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item => item.id === targetDbId ? { ...item, quantity: newQuantity } : item)
      }));

    } catch (error) {
      console.error("Erreur mise à jour quantité :", error);
      alert("Erreur lors de la mise à jour de la quantité.");
    }
  };

  const handleRemoveProduct = async (dbIds) => {
    if (!window.confirm("Voulez-vous retirer ce produit du panier ?")) return;
    
    try {
      const authConfig = { headers: { 'Authorization': `Bearer ${user.token}` } };
      await Promise.all(dbIds.map(id => axios.delete(`${API_ROOT}/api/panier_items/${id}`, authConfig)));

      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => !dbIds.includes(item.id))
      }));
    } catch (error) {
      console.error("Erreur suppression item:", error);
      alert("Impossible de retirer ce produit.");
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-dark-nigth-blue">
      <ButtonLoader size={60} />
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 min-h-screen text-white bg-dark-nigth-blue">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 border-b border-gray-700 pb-4">
          Mon Panier
        </h1>

        {aggregatedCartItems.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Votre panier est vide</h2>
            <p className="text-gray-400 mb-8">Vous n'avez ajouté aucun article pour le moment.</p>
            <Link 
              to="/market" 
              className="bg-orange hover:bg-orange/80 text-black font-bold py-3 px-6 rounded transition inline-block"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {aggregatedCartItems.map((item) => (
                <div key={item.product.id} className="flex items-center bg-gray-800 p-4 rounded-lg shadow border border-white/5 hover:border-orange/30 transition">
                  <img 
                    src={item.product?.imagePath ? `${API_ROOT}${item.product.imagePath}` : `${IMAGE_URL}/default/default_product.png`} 
                    alt={item.product?.title} 
                    onError={(e) => { e.target.onerror = null; e.target.src = `${IMAGE_URL}/default/default_product.png`; }}
                    className="w-24 h-24 object-contain rounded-md mr-4 bg-white/5"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">
                      {item.product?.title || "Produit sans titre"}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">{item.product?.brand}</p>
                    
                    {/* Contrôleur de quantité aligné avec le prix */}
                    <div className="flex items-center gap-6 mt-2">
                      <p className="text-orange font-bold text-lg w-20">
                        {(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)} €
                      </p>

                      <div className="flex items-center gap-2 bg-black/30 rounded-lg p-1 border border-white/5">
                        <button 
                          onClick={() => handleUpdateQuantity(item, -1)}
                          className="w-7 h-7 rounded bg-white/5 hover:bg-orange hover:text-black flex items-center justify-center font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="font-bold w-8 text-center text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => handleUpdateQuantity(item, 1)}
                          className="w-7 h-7 rounded bg-white/5 hover:bg-orange hover:text-black flex items-center justify-center font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                  </div>
                  <button 
                    onClick={() => handleRemoveProduct(item.dbIds)}
                    className="text-red-500 hover:text-white hover:bg-red-500 transition px-3 py-1 border border-red-500 rounded text-sm ml-4"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-lg h-fit shadow-lg border border-white/10">
              <h2 className="text-2xl font-bold mb-4">Résumé</h2>
              <div className="flex justify-between border-b border-gray-600 pb-2 mb-4 text-gray-300">
                <span>Articles ({getTotalArticlesCount()})</span>
                <span>{calculateTotal()} €</span>
              </div>
              <div className="flex justify-between font-bold text-xl mb-6 text-orange">
                <span>Total</span>
                <span>{calculateTotal()} €</span>
              </div>
              <Link to="/checkout" className="block text-center bg-orange hover:bg-orange/80 text-black font-bold py-3 rounded-lg transition">
                  Valider et Payer
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Panier;