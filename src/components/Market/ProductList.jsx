import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import ProductCard from '../Card/ProductCard';
import ButtonLoader from '../Loader/ButtonLoader';

const ITEMS_PER_PAGE = 20;

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [allCharacteristics, setAllCharacteristics] = useState([]);
  const [mainFilter, setMainFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  
  // Nouvel état pour la pagination
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        // Récupération globale pour tous (connecté ou non)
        const [prodRes, charRes] = await Promise.all([
          axios.get(`${API_ROOT}/api/products`),
          axios.get(`${API_ROOT}/api/characteristics`)
        ]);

        const productsData = prodRes.data.member || prodRes.data['hydra:member'] || prodRes.data || [];
        const charsData = charRes.data.member || charRes.data['hydra:member'] || charRes.data || [];

        setAllProducts(productsData);
        setAllCharacteristics(charsData);
      } catch (error) {
        console.error("Erreur API :", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // --- 1. GÉNÉRATION DES OPTIONS (Tirées de la table characteristics) ---
  const subCategoryOptions = useMemo(() => {
    if (mainFilter === "all") return [];

    // Récupère toutes les caractéristiques liées au type choisi, même si aucun produit ne l'utilise
    const options = allCharacteristics
      .filter(char => char.type === mainFilter)
      .map(char => char.value);

    // Supprime les doublons et trie par ordre alphabétique
    return Array.from(new Set(options)).sort();
  }, [allCharacteristics, mainFilter]);

  // --- 2. FILTRAGE DES PRODUITS ---
  const filteredProducts = useMemo(() => {
    return allProducts.filter(product => {
      if (mainFilter === "all") return true;

      // Vérifie si le produit correspond au type principal (ex: Vélo)
      const hasMainType = product.characteristics?.some(char => char.type === mainFilter);
      if (!hasMainType) return false;

      // Vérifie si le produit correspond à la sous-catégorie (ex: VTT)
      if (subFilter !== "all") {
        return product.characteristics?.some(char => char.value === subFilter);
      }
      return true;
    });
  }, [allProducts, mainFilter, subFilter]);

  // --- 3. PAGINATION ---
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // --- GESTIONNAIRES D'ÉVÈNEMENTS ---
  const handleMainChange = (e) => {
    setMainFilter(e.target.value);
    setSubFilter("all"); // Réinitialise la sous-catégorie
    setCurrentPage(1);   // Retour à la page 1
  };

  const handleSubChange = (e) => {
    setSubFilter(e.target.value);
    setCurrentPage(1);   // Retour à la page 1 lors d'un nouveau filtre
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE ET FILTRES */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Notre Boutique</h1>
            <p className="text-gray-400">Découvrez nos équipements et vélos de haute performance.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            {/* Filtre Principal (Niveau 1) */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</label>
              <select 
                className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 w-full md:w-56 outline-none shadow-lg"
                value={mainFilter}
                onChange={handleMainChange}
              >
                <option value="all">Tout le catalogue</option>
                <option value="Catégorie vélo">Vélos</option>
                <option value="Pièce détachée">Pièces Détachées</option>
              </select>
            </div>

            {/* Filtre Secondaire (Niveau 2) */}
            {mainFilter !== "all" && (
              <div className="flex flex-col gap-2 transition-all duration-300">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Catégorie</label>
                <select 
                  className="bg-gray-900 text-white px-4 py-3 rounded-xl border border-gray-700 focus:border-blue-500 w-full md:w-56 outline-none shadow-lg"
                  value={subFilter}
                  onChange={handleSubChange}
                >
                  <option value="all">Toutes les catégories</option>
                  {subCategoryOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
        
        {/* CONTENU PRINCIPAL */}
        {isLoading ? (
          <div className="flex justify-center items-center w-full py-20">
            <ButtonLoader size={80} />
          </div>
        ) : (
          <div className="w-full">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-24 bg-gray-800/10 rounded-3xl border border-dashed border-gray-700">
                <div className="text-5xl mb-4">🚲</div>
                <h3 className="text-xl font-semibold text-white mb-2">Bientôt de retour !</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Il n'y a actuellement aucun produit dans la catégorie <span className="text-blue-400 font-bold">"{subFilter}"</span>. 
                  Revenez plus tard ou explorez une autre catégorie.
                </p>
                <button 
                  onClick={() => handleSubChange({ target: { value: 'all' } })}
                  className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all text-sm"
                >
                  Voir tous les {mainFilter === "Catégorie vélo" ? "vélos" : "pièces"}
                </button>
              </div>
            ) : (
              <>
                {/* GRILLE DES PRODUITS PAGINÉS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* CONTRÔLES DE PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center mt-12 gap-4">
                    <button 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                      Précédent
                    </button>
                    
                    <span className="text-gray-400 text-sm font-medium">
                      Page <span className="text-white">{currentPage}</span> sur <span className="text-white">{totalPages}</span>
                    </span>

                    <button 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                    >
                      Suivant
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProductList;