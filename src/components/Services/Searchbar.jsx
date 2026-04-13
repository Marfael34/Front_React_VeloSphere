import React from 'react';

const SearchBar = ({ searchTerm, onSearchChange, placeholder = "Rechercher un produit..." }) => {
  return (
    <div className="relative w-full md:max-w-md">
      {/* Icône de recherche (Loupe) */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-500" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Champ de saisie */}
      <input
        type="text"
        className="bg-gray-900 text-white w-full pl-10 pr-10 py-2.5 rounded-xl border border-gray-700 focus:border-blue-500 outline-none placeholder-gray-600 shadow-sm transition-colors duration-300"
        placeholder={placeholder}
        value={searchTerm}
        onChange={onSearchChange}
      />

      {/* Bouton pour effacer la recherche (Croix) - N'apparaît que s'il y a du texte */}
      {searchTerm && (
        <button
          onClick={() => onSearchChange({ target: { value: '' } })}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-white transition-colors"
        >
          <svg 
            className="h-5 w-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default SearchBar;