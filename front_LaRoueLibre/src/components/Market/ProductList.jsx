import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import ProductCard from '../Card/ProductCard';
import ButtonLoader from '../Loader/ButtonLoader';
import SearchBar from '../Servicies/Searchbar';



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

  // Filtres réellement appliqués
  const [appliedFilters, setAppliedFilters] = useState({
    searchTerm: "",
    mainFilter: "all",
    subFilter: "all",
    minPrice: "",
    maxPrice: "",
    sortOrder: "default"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [prodRes, charRes] = await Promise.all([
          axios.get(`${API_ROOT}/api/products`),
          axios.get(`${API_ROOT}/api/characteristics`)
        ]);

        const productsData = prodRes.data.member || prodRes.data['hydra:member'] || prodRes.data || [];
        const activeProducts = productsData.filter(p => Number(p.is_active ?? p.isActive ?? 1) !== 0);
        const charsData = charRes.data.member || charRes.data['hydra:member'] || charRes.data || [];

        setAllProducts(activeProducts);
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
    const { searchTerm: s, mainFilter: m, subFilter: sub, minPrice: min, maxPrice: max, sortOrder: so } = appliedFilters;
    
    let result = allProducts.filter(product => {
      
      // Filtre Recherche textuelle
      if (s.trim() !== "") {
        const term = s.toLowerCase();
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
      if (m !== "all") {
        const hasMainType = product.characteristics?.some(char => char.type === m);
        if (!hasMainType) return false;
      }

      // Filtre Sous-Catégorie
      if (sub !== "all") {
        const hasSub = product.characteristics?.some(char => char.value === sub);
        if (!hasSub) return false;
      }

      // Filtre Prix Minimum (Attention : prix stocké en centimes)
      if (min !== "" && product.price < parseFloat(min) * 100) {
        return false;
      }

      // Filtre Prix Maximum (Attention : prix stocké en centimes)
      if (max !== "" && product.price > parseFloat(max) * 100) {
        return false;
      }

      return true;
    });

    // Tri
    if (so === "asc") {
      result.sort((a, b) => a.price - b.price);
    } else if (so === "desc") {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [allProducts, appliedFilters]);

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
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      applyFilters();
    }
  };

  const applyFilters = () => {
    setAppliedFilters({
      searchTerm,
      mainFilter,
      subFilter,
      minPrice,
      maxPrice,
      sortOrder
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    const defaultFilters = {
      searchTerm: "",
      mainFilter: "all",
      subFilter: "all",
      minPrice: "",
      maxPrice: "",
      sortOrder: "default"
    };
    setSearchTerm("");
    setMainFilter("all");
    setSubFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setSortOrder("default");
    setAppliedFilters(defaultFilters);
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
                onKeyDown={handleKeyDown}
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
                onKeyDown={handleKeyDown}
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

          {/* Boutons d'action */}
          <div className="flex gap-3 grow min-w-full lg:min-w-0 lg:grow-0">
            <button 
                onClick={applyFilters}
                className="flex-1 lg:flex-none bg-orange hover:bg-orange/80 text-black px-8 py-2.5 rounded-xl transition-all text-sm font-black h-11.5 flex items-center justify-center gap-2 shadow-lg shadow-orange/20 group"
              >
                <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Rechercher
            </button>
            <button 
                onClick={resetFilters}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-4 py-2.5 rounded-xl border border-gray-700 hover:border-gray-500 transition-all text-sm font-medium h-11.5 flex items-center gap-2"
                title="Réinitialiser tous les filtres"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Réinitialiser</span>
            </button>
          </div>
        </div>

        {/* RÉSUMÉ DES FILTRES ACTIFS */}
        {(appliedFilters.mainFilter !== 'all' || appliedFilters.searchTerm !== '' || appliedFilters.minPrice !== '' || appliedFilters.maxPrice !== '') && (
          <div className="flex flex-wrap items-center gap-3 mb-8 animate-fade-in">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest mr-2">Filtres actifs :</span>
            {appliedFilters.searchTerm && (
              <span className="bg-orange/10 text-orange border border-orange/20 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                "{appliedFilters.searchTerm}"
              </span>
            )}
            {appliedFilters.mainFilter !== 'all' && (
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold">
                {appliedFilters.mainFilter === 'Catégorie vélo' ? 'Vélos' : 'Pièces Détachées'}
                {appliedFilters.subFilter !== 'all' && ` > ${appliedFilters.subFilter}`}
              </span>
            )}
            {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-full text-xs font-bold">
                {appliedFilters.minPrice ? `${appliedFilters.minPrice}€` : '0€'} - {appliedFilters.maxPrice ? `${appliedFilters.maxPrice}€` : '∞'}
              </span>
            )}
            <button onClick={resetFilters} className="text-xs text-gray-400 hover:text-orange transition-colors underline decoration-dotted underline-offset-4">
              Tout effacer
            </button>
          </div>
        )}
        
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
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