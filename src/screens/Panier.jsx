import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../constants/apiConstant';
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

        // Récupération de l'état "en attente"
        const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
        const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];

        const etatCible = etats.find(e => 
          e.label.replace(/\s+/g, ' ').trim().toLowerCase().includes("attente")
        );

        if (!etatCible) {
          setIsLoading(false);
          return;
        }

        // Récupération du panier de l'utilisateur avec cet état
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
      const updatedProductsList = cart.products.filter(p => p.id !== productId);
      const updatedProductIris = updatedProductsList.map(p => `/api/products/${p.id}`);

      if (updatedProductIris.length === 0) {
        // Suppression complète si le panier est vide
        await axios.delete(`${API_ROOT}/api/paniers/${cart.id}`, {
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        setCart(null); 
      } else {
        // Mise à jour via Patch
        await axios.patch(`${API_ROOT}/api/paniers/${cart.id}`, {
          products: updatedProductIris
        }, {
          headers: { 
            'Content-Type': 'application/merge-patch+json',
            'Authorization': `Bearer ${user.token}` 
          }
        });

        setCart({ ...cart, products: updatedProductsList });
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
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

        {/* CONDITION DU PANIER VIDE */}
        {!cart || !cart.products || cart.products.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Votre panier est tristement vide</h2>
            <p className="text-gray-400 mb-8">Vous n'avez ajouté aucun vélo ou équipement pour le moment.</p>
            <Link 
              to="/market" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition inline-block"
            >
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          /* AFFICHAGE DU PANIER REMPLI */
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 space-y-4">
              {cart.products.map((product) => (
                <div key={product.id} className="flex items-center bg-gray-800 p-4 rounded-lg shadow">
                  <img 
                    src={`${API_ROOT}${product.imagePath}`} 
                    alt={product.title} 
                    onError={(e) => { e.target.onerror = null; e.target.src = `${IMAGE_URL}/default/default_product.png`; }}
                    className="w-24 h-24 object-contain rounded-md mr-4 bg-white/5"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{product.title}</h3>
                    <p className="text-blue-400 font-semibold mt-1">{product.price} €</p>
                  </div>
                  <button 
                    onClick={() => handleRemoveProduct(product.id)}
                    className="text-red-500 hover:text-red-400 transition ml-4 px-3 py-1 border border-red-500 rounded hover:bg-red-500 hover:text-white"
                  >
                    Retirer
                  </button>
                </div>
              ))}
            </div>

            {/* RÉSUMÉ DE LA COMMANDE */}
            <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-lg h-fit shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Résumé</h2>
              <div className="flex justify-between border-b border-gray-600 pb-2 mb-4 text-gray-300">
                <span>Articles ({cart.products.length})</span>
                <span>{calculateTotal()} €</span>
              </div>
              <div className="flex justify-between font-bold text-xl mb-6 text-blue-400">
                <span>Total</span>
                <span>{calculateTotal()} €</span>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition">
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