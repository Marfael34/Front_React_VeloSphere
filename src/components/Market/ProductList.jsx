import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import ProductCard from '../Card/ProductCard';
import ButtonLoader from '../Loader/ButtonLoader';

const ProductList = () => {
  // On sépare le state en deux catégories
  const [bikes, setBikes] = useState([]);
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await axios.get(`${API_ROOT}/api/products`);
        
        const productsData = response.data.member || response.data['hydra:member'] || [];
        
        // --- LOGIQUE DE FILTRAGE ---
        // On suppose que l'API renvoie le tableau 'characteristics' détaillé pour chaque produit.
        const filteredBikes = productsData.filter(product => 
          product.characteristics?.some(char => char.type === 'Catégorie vélo')
        );

        const filteredParts = productsData.filter(product => 
          product.characteristics?.some(char => char.type === 'Pièce détachée')
        );

        setBikes(filteredBikes);
        setParts(filteredParts);

      } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, []);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-transparent">
      
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-10 text-center">
          Notre Catalogue
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center items-center w-full py-20">
            <ButtonLoader size={80} />
          </div>
        ) : (
          <>
            {/* --- SECTION VÉLOS --- */}
            <div className="mb-16">
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 border-b border-slate-grey_06 pb-2">
                Nos Vélos
              </h2>
              
              {bikes.length === 0 ? (
                <div className="text-center text-white py-8 bg-white_01 rounded-lg">
                  <p className="text-lg">Aucun vélo en stock pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
                  {bikes.map((bike) => (
                    <ProductCard key={bike.id} product={bike} />
                  ))}
                </div>
              )}
            </div>

            {/* --- SECTION PIÈCES DÉTACHÉES --- */}
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-6 border-b border-slate-grey_06 pb-2">
                Pièces Détachées
              </h2>
              
              {parts.length === 0 ? (
                <div className="text-center text-white py-8 bg-white_01 rounded-lg">
                  <p className="text-lg">Aucune pièce détachée en stock pour le moment.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 place-items-center">
                  {parts.map((part) => (
                    <ProductCard key={part.id} product={part} />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

export default ProductList;