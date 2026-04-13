import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import ProductCard from '../Card/ProductCard';
import ButtonLoader from '../Loader/ButtonLoader';
import SearchBar from '../Services/Searchbar';


const ITEMS_PER_PAGE = 20;

const ProductList = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [allCharacteristics, setAllCharacteristics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  
  // États pour les filtres et la recherche (brandFilter supprimé car géré par searchTerm)
  const [searchTerm, setSearchTerm] = useState("");
  const [mainFilter, setMainFilter] = useState("all");
  const [subFilter, setSubFilter] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
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

  // --- 1. GÉNÉRATION DES OPTIONS ---
  const subCategoryOptions = useMemo(() => {
    if (mainFilter === "all") return [];
    const options = allCharacteristics
      .filter(char => char.type === mainFilter)
      .map(char => char.value);
    return Array.from(new Set(options)).sort();
  }, [allCharacteristics, mainFilter]);

  // --- 2. FILTRAGE ET TRI DES PRODUITS ---
  const filteredProducts = useMemo(() => {
    let result = allProducts.filter(product => {
      
      // Filtre Recherche textuelle (Nom ET Marque/Caractéristiques)
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase();
        const productName = product.name ? String(product.name).toLowerCase() : "";
        const matchesName = productName.includes(term);
        const productBrand = product.brand ? String(product.brand).toLowerCase() : "";
        const matchesBrand = productBrand.includes(term);
        const matchesCharacteristic = product.characteristics?.some(
          char => char.value && String(char.value).toLowerCase().includes(term)
        );

        if (!matchesName && !matchesBrand && !matchesCharacteristic) {
          return false;
        }
      }

      // Filtre Type Principal
      if (mainFilter !== "all") {
        const hasMainType = product.characteristics?.some(char => char.type === mainFilter);
        if (!hasMainType) return false;
      }

      // Filtre Sous-Catégorie
      if (subFilter !== "all") {
        const hasSub = product.characteristics?.some(char => char.value === subFilter);
        if (!hasSub) return false;
      }

      // Filtre Prix Minimum
      if (minPrice !== "" && product.price < parseFloat(minPrice)) {
        return false;
      }

      // Filtre Prix Maximum
      if (maxPrice !== "" && product.price > parseFloat(maxPrice)) {
        return false;
      }

      return true;
    });

    // Tri
    if (sortOrder === "asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allProducts, searchTerm, mainFilter, subFilter, minPrice, maxPrice, sortOrder]);

  // --- 3. PAGINATION ---
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProducts, currentPage]);

  // --- 4. GESTIONNAIRES D'ÉVÈNEMENTS ---
  const handleMainChange = (e) => {
    setMainFilter(e.target.value);
    setSubFilter("all");
    setCurrentPage(1);
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setMainFilter("all");
    setSubFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("default");
    setCurrentPage(1);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-10 min-h-screen bg-transparent">
      <div className="max-w-7xl mx-auto">
        
        {/* EN-TÊTE ET RECHERCHE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Notre Boutique</h1>
            <p className="text-gray-400">Découvrez nos équipements et vélos de haute performance.</p>
          </div>
          
          <div className="w-full md:w-auto mt-4 md:mt-0">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={handleSearchChange} 
              placeholder="Chercher un modèle, marque..." 
            />
          </div>
        </div>

        {/* BARRE DE FILTRES */}
        <div className="flex flex-wrap items-end gap-4 mb-12 p-6 bg-gray-800/40 border border-gray-700/50 rounded-2xl shadow-lg backdrop-blur-sm">
          
          {/* Type */}
          <div className="flex flex-col gap-2 grow min-w-35 md:grow-0">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Type</label>
            <select 
              className="bg-gray-900 text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none w-full"
              value={mainFilter}
              onChange={handleMainChange}
            >
              <option value="all">Tout le catalogue</option>
              <option value="Catégorie vélo">Vélos</option>
              <option value="Pièce détachée">Pièces Détachées</option>
            </select>
          </div>

          {/* Catégorie */}
          <div className={`flex flex-col gap-2 grow min-w-35 md:grow-0 transition-opacity duration-300 ${mainFilter === "all" ? "opacity-50 pointer-events-none" : "opacity-100"}`}>
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Catégorie</label>
            <select 
              className="bg-gray-900 text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none w-full"
              value={subFilter}
              onChange={handleFilterChange(setSubFilter)}
              disabled={mainFilter === "all"}
            >
              <option value="all">Toutes les catégories</option>
              {subCategoryOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div className="hidden md:block w-px h-12 bg-gray-700 mx-1"></div>

          {/* Filtres de Prix */}
          <div className="flex gap-3 grow min-w-45 md:grow-0">
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix Min</label>
              <input 
                type="number"
                placeholder="Ex: 50"
                className="bg-gray-900 text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none w-full placeholder-gray-600"
                value={minPrice}
                onChange={handleFilterChange(setMinPrice)}
                min="0"
              />
            </div>
            <div className="flex flex-col gap-2 w-1/2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Prix Max</label>
              <input 
                type="number"
                placeholder="Ex: 1500"
                className="bg-gray-900 text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none w-full placeholder-gray-600"
                value={maxPrice}
                onChange={handleFilterChange(setMaxPrice)}
                min="0"
              />
            </div>
          </div>

          <div className="hidden lg:block w-px h-12 bg-gray-700 mx-1"></div>

          {/* Tri par Prix */}
          <div className="flex flex-col gap-2 grow min-w-35 md:grow-0">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Trier par</label>
            <select 
              className="bg-gray-900 text-white px-4 py-2.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none w-full"
              value={sortOrder}
              onChange={handleFilterChange(setSortOrder)}
            >
              <option value="default">Pertinence</option>
              <option value="asc">Prix croissant</option>
              <option value="desc">Prix décroissant</option>
            </select>
          </div>

          {/* Bouton de réinitialisation */}
          <div className="flex flex-col gap-2 grow min-w-35 md:grow-0">
           <button 
              onClick={resetFilters}
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 transition-all text-sm font-medium h-11.5 flex items-center gap-2"
              title="Réinitialiser tous les filtres"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reinitialiser
            </button>
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
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-white mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Vos critères de recherche sont peut-être trop stricts. Essayez de modifier vos filtres ou d'élargir la fourchette de prix.
                </p>
                <button 
                  onClick={resetFilters}
                  className="mt-6 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-full transition-all text-sm"
                >
                  Voir tout le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

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