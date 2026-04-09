import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';

// IMPORT DE TON CONTEXTE (Ajuste le chemin si besoin)
import { AuthContext } from '../contexts/AuthContext'; 
import ButtonLoader from '../components/Loader/ButtonLoader';

const Panier = () => {
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchCart = async () => {
      if (!user || !user.token || !user.id) {
        setIsLoading(false);
        return;
      }

      try {
        const authConfig = {
          headers: { Authorization: `Bearer ${user.token}` }
        };

        const response = await axios.get(
          `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=/api/etats/1`,
          authConfig
        );
        
        const cartsData = response.data['hydra:member'] || [];
        
        if (cartsData.length > 0) {
          setCart(cartsData[0]);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du panier:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const handleRemoveProduct = async (productIdToRemove) => {
    if (!cart || !user?.token) return;

    try {
      const updatedProducts = cart.products.filter(p => p.id !== productIdToRemove);
      const productIris = updatedProducts.map(p => `/api/products/${p.id}`);

      await axios.patch(
        `${API_ROOT}/api/paniers/${cart.id}`,
        { products: productIris },
        { 
          headers: { 
            'Content-Type': 'application/merge-patch+json',
            'Authorization': `Bearer ${user.token}` 
          } 
        }
      );

      setCart({ ...cart, products: updatedProducts });
    } catch (error) {
      console.error("Erreur lors de la suppression de l'article :", error);
      alert("Impossible de retirer l'article.");
    }
  };

  const calculateTotal = () => {
    if (!cart || !cart?.products) return 0;
    return cart.products.reduce((total, product) => total + product.price, 0);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex justify-center items-center text-white">
        <div className="bg-gray-800 p-8 rounded-lg text-center shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Oups !</h2>
          <p>Vous devez être connecté pour voir votre panier.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <ButtonLoader size={60} />
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-transparent text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 border-b border-gray-700 pb-4">
          Mon Panier
        </h1>

        {/* CONDITION DU PANIER VIDE : Soit null, soit tableau vide */}
        {!cart || cart?.products?.length === 0 ? (
          <div className="text-center py-16 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold mb-4 text-white">Votre panier est tristement vide</h2>
            <p className="text-gray-400 mb-8">Vous n'avez ajouté aucun vélo ou équipement pour le moment.</p>
            {/* Lien vers la page des produits - Ajuste le href (ou utilise <Link to="..."> de react-router-dom) */}
            <a 
              href="/market" 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition"
            >
              Découvrir nos produits
            </a>
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
                    onError={(e) => { e.target.src = '/placeholder.jpg'; }}
                    className="w-24 h-24 object-cover rounded-md mr-4"
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

            <div className="w-full md:w-1/3 bg-gray-800 p-6 rounded-lg h-fit shadow-lg">
              <h2 className="text-2xl font-bold mb-4">Résumé</h2>
              <div className="flex justify-between border-b border-gray-600 pb-2 mb-4">
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
}

export default Panier;