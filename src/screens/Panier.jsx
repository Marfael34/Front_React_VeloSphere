import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { Link } from 'react-router-dom';

const Panier = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id || !user?.token) {
        setIsLoading(false);
        return;
      }

      try {
        const authConfig = {
          headers: { Authorization: `Bearer ${user.token}` }
        };

        // 👉 CORRECTION 1 : On ajoute .member ici !
        const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
        const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];

        const etatCible = etats.find(e => 
          e.label.replace(/\s+/g, ' ').trim().toLowerCase().includes("attente")
        );

        if (!etatCible) {
          console.warn("DEBUG - Aucun état contenant 'attente' n'a été trouvé.");
          setIsLoading(false);
          return;
        }

        // 👉 CORRECTION 2 : On ajoute .member ici aussi !
        const response = await axios.get(
          `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatCible['@id']}`,
          authConfig
        );

        const cartsData = response.data.member || response.data['hydra:member'] || [];
        
        if (cartsData.length > 0) {
          setCart(cartsData[0]);
        }

      } catch (error) {
        console.error("Erreur API :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const calculateTotal = () => {
    if (!cart?.products) return "0.00";
    return cart.products.reduce((acc, p) => acc + parseFloat(p.price || 0), 0).toFixed(2);
  };

  const handleRemoveProduct = async (productId) => {
    try {
      // On filtre la liste locale pour enlever le produit cliqué
      const updatedProductsList = cart.products.filter(p => p.id !== productId);
      
      // On prépare le tableau des IRI pour Symfony
      const updatedProductIris = updatedProductsList.map(p => `/api/products/${p.id}`);

      // CONDITION : Le panier devient-il complètement vide ?
      if (updatedProductIris.length === 0) {
        
        // 1. OUI : On supprime complètement le panier de la base de données
        await axios.delete(`${API_ROOT}/api/paniers/${cart.id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        
        // On vide le panier visuellement sur React
        setCart(null); 
        
      } else {
        
        // 2. NON : Il reste des produits, on met juste à jour la relation panier_products
        const authConfigPatch = {
          headers: { 
            'Content-Type': 'application/merge-patch+json',
            'Authorization': `Bearer ${user.token}` 
          }
        };

        await axios.patch(`${API_ROOT}/api/paniers/${cart.id}`, {
          products: updatedProductIris
        }, authConfigPatch);

        // On met à jour l'affichage sur React
        setCart({ 
          ...cart, 
          products: updatedProductsList 
        });
      }

    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Impossible de retirer ce produit du panier.");
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] bg-dark-nigth-blue">
      <ButtonLoader size={60} />
    </div>
  );

  return (
    <div className="w-full px-4 py-10 min-h-screen bg-dark-nigth-blue text-white">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 border-b border-white/10 pb-4">Mon Panier</h1>

        {!cart || !cart.products || cart.products.length === 0 ? (
          <div className="text-center py-16 bg-black/40 rounded-2xl border border-white/10 shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Votre panier est vide</h2>
            <Link to="/market" className="main-button px-8 py-3 w-auto inline-block text-black bg-orange hover:bg-orange/80 rounded-full font-bold transition-all">
              Aller à la boutique
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cart.products.map((product) => (
                <div key={product.id} className="flex flex-col sm:flex-row items-center bg-black/40 p-4 rounded-xl border border-white/5 shadow-lg gap-4">
                  <img 
                    src={`${API_ROOT}${product.imagePath}`} 
                    className="w-24 h-24 object-contain rounded-lg bg-white/5 p-2"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/images/default/default_product.png'; }}
                    alt={product.title}
                  />
                  <div className="flex-1 text-center sm:text-left w-full">
                    <Link to={`/product/${product.id}`} className="hover:text-orange transition-colors">
                      <h3 className="font-bold text-lg">{product.title}</h3>
                    </Link>
                    <p className="text-sm text-gray-400">{product.brand}</p>
                    <p className="text-orange font-bold mt-1 text-xl">{product.price} €</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveProduct(product.id)} 
                    className="w-full sm:w-auto text-red-500 hover:text-red-400 font-bold px-4 py-2 border border-red-500/30 hover:bg-red-500/10 rounded-lg transition-all"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            <div className="w-full lg:w-80 bg-black/40 p-6 rounded-xl border border-white/10 h-fit sticky top-24">
              <h2 className="text-xl font-bold mb-6">Résumé de la commande</h2>
              <div className="flex justify-between items-center mb-4 text-gray-300">
                <span>Nombre d'articles</span>
                <span>{cart.products.length}</span>
              </div>
              <div className="flex justify-between text-2xl font-bold text-orange mb-8 pt-4 border-t border-white/10">
                <span>Total</span>
                <span>{calculateTotal()} €</span>
              </div>
              <button className="main-button w-full">
                Valider la commande
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Panier;