import React, { useState, useEffect, useContext } from 'react';
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
        const authConfig = {
          headers: { Authorization: `Bearer ${user.token}` }
        };

        // 1. Récupérer les états pour trouver celui du panier actif
        const etatsRes = await axios.get(`${API_ROOT}/api/etats`, authConfig);
        const etats = etatsRes.data.member || etatsRes.data['hydra:member'] || [];

        // Recherche plus robuste de l'état (doit correspondre à vos fixtures)
        const etatCible = etats.find(e => 
            e.label === "En attentes de paiement" || 
            e.label.toLowerCase().includes("attente")
        );

        if (!etatCible) {
          console.error("État de panier introuvable");
          setIsLoading(false);
          return;
        }

        // 2. Récupérer le panier avec l'état trouvé
        const response = await axios.get(
          `${API_ROOT}/api/paniers?user=/api/users/${user.id}&etat=${etatCible['@id']}`,
          authConfig
        );

        const cartsData = response.data.member || response.data['hydra:member'] || [];
        
        // On vérifie si un panier existe et contient des items
        if (cartsData.length > 0) {
          setCart(cartsData[0]);
          console.log("Panier chargé :", cartsData[0]); // Debug pour voir la structure
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

  // Calcul du total basé sur les PanierItems (prix * quantité)
  const calculateTotal = () => {
    if (!cart?.items) return "0.00";
    return cart.items.reduce((acc, item) => {
      const price = parseFloat(item.product?.price || 0);
      return acc + (price * item.quantity);
    }, 0).toFixed(2);
  };

  // Calcul du nombre total d'unités dans le panier
  const getTotalArticlesCount = () => {
    if (!cart?.items) return 0;
    return cart.items.reduce((acc, item) => acc + item.quantity, 0);
  };

  const handleRemoveItem = async (itemId) => {
    if (!window.confirm("Voulez-vous retirer ce produit du panier ?")) return;
    
    try {
      const authConfig = {
        headers: { 'Authorization': `Bearer ${user.token}` }
      };

      // Suppression de l'entrée PanierItem (relation produit/quantité)
      await axios.delete(`${API_ROOT}/api/panier_items/${itemId}`, authConfig);

      // Mise à jour locale de l'interface
      const updatedItems = cart.items.filter(item => item.id !== itemId);
      
      if (updatedItems.length === 0) {
        setCart(null);
      } else {
        setCart({ ...cart, items: updatedItems });
      }
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

        {/* Vérification sur cart.items car la structure a changé */}
        {!cart || !cart.items || cart.items.length === 0 ? (
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
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center bg-gray-800 p-4 rounded-lg shadow border border-white/5 hover:border-orange/30 transition">
                  <img 
                    src={item.product?.imagePath ? `${API_ROOT}${item.product.imagePath}` : `${IMAGE_URL}/default/default_product.png`} 
                    alt={item.product?.title} 
                    onError={(e) => { e.target.onerror = null; e.target.src = `${IMAGE_URL}/default/default_product.png`; }}
                    className="w-24 h-24 object-contain rounded-md mr-4 bg-white/5"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">
                      {item.product?.title || "Produit sans titre"} 
                      <span className="ml-3 px-2 py-1 bg-orange/20 text-orange text-sm rounded-md font-bold">
                        x{item.quantity}
                      </span>
                    </h3>
                    <p className="text-gray-400 text-sm mb-1">{item.product?.brand}</p>
                    <p className="text-orange font-bold">
                      {(parseFloat(item.product?.price || 0) * item.quantity).toFixed(2)} €
                    </p>
                  </div>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-white hover:bg-red-500 transition px-3 py-1 border border-red-500 rounded text-sm"
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