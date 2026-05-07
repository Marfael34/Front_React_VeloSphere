import React, { useRef } from 'react';
import ProductCard from '../Card/ProductCard';

const ProductSuggestion = ({ Product }) => {
  // 1. On crée une référence pour cibler la div du carrousel
  const carouselRef = useRef(null);
    
  if (!Product || !Array.isArray(Product) || Product.length === 0) {
      return null;
  }

  const limitedProducts = Product.slice(0, 10);

  // 2. Fonction pour faire défiler à gauche ou à droite au clic
  const scroll = (direction) => {
    if (carouselRef.current) {
        // La largeur d'une carte est d'environ 260px, on fait défiler de 300px à la fois
        const scrollAmount = direction === 'left' ? -300 : 300;
        carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };
    
  return (
    // On ajoute "relative" ici pour pouvoir positionner nos flèches par dessus
    <div className='w-full px-4 sm:px-6 lg:px-8 pb-10 relative group'>
        
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">
                Nos Suggestions
            </h2>
            
            {/* Boutons visibles uniquement sur ordinateur (md:flex) pour défiler */}
            <div className="hidden md:flex gap-2">
                <button 
                    onClick={() => scroll('left')}
                    className="w-10 h-10 flex items-center justify-center bg-slate-grey_08 hover:bg-orange text-white rounded-full transition-colors duration-300"
                    aria-label="Défiler à gauche"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <button 
                    onClick={() => scroll('right')}
                    className="w-10 h-10 flex items-center justify-center bg-slate-grey_08 hover:bg-orange text-white rounded-full transition-colors duration-300"
                    aria-label="Défiler à droite"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
        </div>

        {/* Conteneur déroulant avec barre de swipe personnalisée */}
        <div 
            ref={carouselRef}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory pb-6 pt-4 scroll-smooth custom-scrollbar"
        >
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #f39c12; /* Couleur orange */
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #e67e22;
                }
                /* Pour Firefox */
                .custom-scrollbar {
                    scrollbar-width: thin;
                    scrollbar-color: #f39c12 rgba(255, 255, 255, 0.05);
                }
            `}</style>

            {limitedProducts.map((product, index) => (
                <div key={product?.id ?? index} className="snap-center shrink-0">
                    <ProductCard product={product} />
                </div>
            ))}
        </div>
        
        {/* Petit texte d'aide pour le mobile */}
        <p className="text-center text-slate-grey_06 text-xs mt-2 md:hidden italic">
          Faites glisser pour voir plus
        </p>
    </div>
  )
}

export default ProductSuggestion;