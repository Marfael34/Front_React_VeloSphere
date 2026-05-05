import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_ROOT } from '../constants/apiConstant';
import MapComponent from '../components/MapComponent';
import PageLoader from '../components/Loader/PageLoader';
import { FaMapMarkedAlt, FaMapMarkerAlt, FaChevronRight, FaSearch, FaInfoCircle } from 'react-icons/fa';

const Location = () => {
    const navigate = useNavigate();
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPlaceId, setSelectedPlaceId] = useState(null);
    const [mapCenter, setMapCenter] = useState([46.603354, 1.888334]);
    const [mapZoom, setMapZoom] = useState(6);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${API_ROOT}/api/places`);
                const data = response.data['hydra:member'] || response.data.member || response.data || [];
                setPlaces(data);
            } catch (err) {
                console.error("Erreur de chargement des lieux:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const parseCoordinates = (coordString) => {
        if (!coordString) return null;
        const parts = coordString.split(',').map(s => s.trim());
        if (parts.length === 2) {
            const lat = parseFloat(parts[0]);
            const lng = parseFloat(parts[1]);
            if (!isNaN(lat) && !isNaN(lng)) {
                return { lat, lng };
            }
        }
        return null;
    };

    const mapPoints = places.map(p => {
        const coords = parseCoordinates(p.coordinates);
        return coords ? {
            ...coords,
            id: p.id,
            title: p.name,
            description: p.description,
            type: 'place',
            link: `/location/${p.id}`
        } : null;
    }).filter(p => p !== null);

    const filteredPlaces = mapPoints.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectPlace = (place) => {
        setSelectedPlaceId(place.id);
        setMapCenter([place.lat, place.lng]);
        setMapZoom(13);
    };

    const handleViewDetail = (id) => {
        navigate(`/location/${id}`);
    };

    if (loading) return <PageLoader />;

    return (
        <div className="bg-dark-nigth-blue min-h-screen pt-24 pb-12 px-4 md:px-8">
            <div className="max-w-7xl mx-auto h-[calc(100vh-180px)] flex flex-col">
                <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-4xl font-black italic uppercase text-white flex items-center gap-4 tracking-tighter">
                            <FaMapMarkedAlt className="text-orange" /> Itinéraires <span className="text-orange">& Lieux</span>
                        </h1>
                        <p className="text-gray-400 mt-2 font-medium">
                            Découvrez tous les spots de pratique référencés par la communauté.
                        </p>
                    </div>
                </div>

                <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden">
                    {/* LISTE DES LIEUX (SIDEBAR) */}
                    <div className="w-full lg:w-96 flex flex-col gap-4">
                        <div className="relative">
                            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input 
                                type="text"
                                placeholder="Rechercher un lieu..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:border-orange outline-none transition-all text-sm"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                            {filteredPlaces.length > 0 ? (
                                filteredPlaces.map((place) => (
                                    <div 
                                        key={place.id}
                                        className={`group relative rounded-2xl border transition-all overflow-hidden ${
                                            selectedPlaceId === place.id 
                                            ? 'bg-orange/10 border-orange' 
                                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                        }`}
                                    >
                                        <div 
                                            className="p-4 flex items-center gap-4 cursor-pointer"
                                            onClick={() => handleSelectPlace(place)}
                                        >
                                            <div className={`p-3 rounded-xl transition-colors ${selectedPlaceId === place.id ? 'bg-orange text-black' : 'bg-white/10 text-orange group-hover:bg-orange group-hover:text-black'}`}>
                                                <FaMapMarkerAlt />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className={`font-bold text-sm truncate uppercase italic tracking-tight transition-colors ${selectedPlaceId === place.id ? 'text-orange' : 'text-white'}`}>
                                                    {place.title}
                                                </h3>
                                                <p className="text-[10px] uppercase font-black tracking-widest mt-0.5 text-gray-500">
                                                    {place.lat.toFixed(3)}, {place.lng.toFixed(3)}
                                                </p>
                                            </div>
                                            <FaChevronRight className={`text-xs transition-all ${selectedPlaceId === place.id ? 'text-orange translate-x-1' : 'text-gray-600'}`} />
                                        </div>
                                        
                                        {/* Action Button Section - Toujours visible pour le lieu sélectionné ou au hover */}
                                        <div className={`px-4 pb-4 flex gap-2 transition-all duration-300 ${selectedPlaceId === place.id ? 'opacity-100 max-h-20' : 'opacity-0 max-h-0 group-hover:opacity-100 group-hover:max-h-20'}`}>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); handleViewDetail(place.id); }}
                                                className="flex-1 bg-white/10 hover:bg-orange hover:text-black py-2 rounded-xl text-[10px] font-black uppercase italic tracking-widest transition-all border border-white/10 flex items-center justify-center gap-2"
                                            >
                                                <FaInfoCircle /> Voir le détail
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 text-gray-500 italic text-sm">
                                    Aucun lieu trouvé
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CARTE */}
                    <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                        {mapPoints.length > 0 ? (
                            <MapComponent points={mapPoints} center={mapCenter} zoom={mapZoom} />
                        ) : (
                            <div className="h-full w-full bg-black/20 flex flex-col items-center justify-center text-center p-8">
                                <FaMapMarkedAlt className="text-6xl text-gray-700 mb-4" />
                                <h2 className="text-2xl font-bold text-gray-500 italic">Aucun point à afficher</h2>
                                <p className="text-gray-600 mt-2 max-w-md">
                                    Ajoutez des coordonnées GPS (format: "lat, lng") aux lieux pour les voir apparaître sur la carte.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Location;
