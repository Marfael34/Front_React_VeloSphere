import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaSearch, FaMapMarkerAlt } from 'react-icons/fa';

const AddressAutocomplete = ({ onAddressSelect }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const wrapperRef = useRef(null);

    // Fermer les suggestions si on clique ailleurs
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    useEffect(() => {
        const searchAddress = async () => {
            if (query.length < 3) {
                setSuggestions([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=5`);
                setSuggestions(response.data.features);
            } catch (error) {
                console.error("Erreur API Adresse:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const timeoutId = setTimeout(searchAddress, 300);
        return () => clearTimeout(timeoutId);
    }, [query]);

    const handleSelect = (feature) => {
        const { properties } = feature;
        
        // On essaie de séparer le type de voie du nom de la voie
        // L'API ne le donne pas explicitement, on fait une analyse simple
        const fullStreet = properties.street || '';
        const streetParts = fullStreet.split(' ');
        const typeVoie = streetParts[0] || '';
        const labelVoie = streetParts.slice(1).join(' ') || fullStreet;

        onAddressSelect({
            number: properties.housenumber || '',
            type: typeVoie,
            label: labelVoie,
            city: properties.city,
            cp: properties.postcode,
            fullLabel: properties.label
        });
        
        setQuery(properties.label);
        setShowSuggestions(false);
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                Rechercher votre adresse
            </label>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FaSearch className="text-gray-500" />
                </div>
                <input
                    type="text"
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-orange/50 transition-all placeholder:text-gray-600"
                    placeholder="Ex: 8 rue de la paix, Paris..."
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-orange border-t-transparent rounded-full"></div>
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full mt-2 bg-[#1a1d21] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-slideup">
                    {suggestions.map((feature, index) => (
                        <li 
                            key={index}
                            onClick={() => handleSelect(feature)}
                            className="px-4 py-3 hover:bg-white/5 cursor-pointer flex items-start gap-3 transition-colors border-b border-white/5 last:border-0"
                        >
                            <FaMapMarkerAlt className="mt-1 text-orange/50 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-white">{feature.properties.label}</p>
                                <p className="text-xs text-gray-500 capitalize">{feature.properties.city} ({feature.properties.postcode})</p>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AddressAutocomplete;
