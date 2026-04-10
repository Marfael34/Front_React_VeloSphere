import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';
import ButtonLoader from '../Loader/ButtonLoader';
import { FaEdit, FaMapMarkerAlt, FaRoute } from 'react-icons/fa';
import { Link } from 'react-router-dom';


const LocationCard = () => {
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const { user } = useContext(AuthContext);

    // 1. Fonction magique pour décoder le JWT et extraire les rôles
    const getRolesFromToken = (token) => {
        if (!token) return [];
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            // Décodage du base64 pour récupérer le JSON
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            
            const decoded = JSON.parse(jsonPayload);
            return decoded.roles || [];
        } catch (error) {
            console.error("Erreur de décodage du token", error);
            return [];
        }
    };

    // 2. On récupère les rôles depuis le token de l'utilisateur
    const userRoles = getRolesFromToken(user?.token);
    
    // 3. On vérifie si l'utilisateur possède le rôle administrateur
    const isAdmin = userRoles.includes("ROLE_ADMIN");

    useEffect(() => {
        const fetchPlaces = async () => {
            try {
                const config = user?.token ? {
                    headers: { Authorization: `Bearer ${user.token}` }
                } : {};

                const response = await axios.get(`${API_ROOT}/api/places`, config);
                const data = response.data['hydra:member'] || response.data.member || [];
                setPlaces(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Erreur lors de la récupération des lieux:", err);
                setError("Impossible de charger les itinéraires.");
                setPlaces([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlaces();
    }, [user]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue">
                <ButtonLoader size={60} />
            </div>
        );
    }

    return (
        
            <div className="max-w-7xl mx-auto px-4 py-10 text-white">
                <h1 className="title-h1 mb-10 flex items-center gap-4">
                    <FaRoute className="text-orange" />
                    Itinéraires & Lieux
                </h1>

                {places && places.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {places.map((place) => (
                            <div 
                                key={place.id} 
                                className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-orange/50 transition-all duration-300 shadow-xl flex flex-col"
                            >
                                {/* Image du lieu */}
                                <div className="relative h-48 w-full overflow-hidden">
                                    <img 
                                        src={
                                            place.path_img
                                                ? `${API_ROOT}${place.path_img.startsWith('/') ? '' : '/'}${place.path_img}` 
                                                : `${IMAGE_URL}/default/default_location.png`
                                        } 
                                        alt={place.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                        onError={(e) => { 
                                            e.target.onerror = null; 
                                            e.target.src = `${IMAGE_URL}/default/default_location.png`; 
                                        }}
                                    />
                                    
                                    {/* Bouton Modifier (uniquement pour Admin) */}
                                    {isAdmin && (
                                        <Link 
                                            to={`/admin/edit-location/${place.id}`}
                                            className="absolute top-4 right-4 bg-orange hover:bg-white text-black p-3 rounded-full shadow-lg transition-colors duration-300 z-10"
                                            title="Modifier ce lieu"
                                        >
                                            <FaEdit size={18} />
                                        </Link>
                                    )}
                                </div>

                                <div className="p-6 flex-1">
                                    <h2 className="text-xl font-bold mb-2 text-white">
                                        {place.name}
                                    </h2>
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                                        {place.description}
                                    </p>
                                    <div className="flex items-center gap-2 text-orange text-sm mb-4">
                                        <FaMapMarkerAlt />
                                        <span>{place.coordinates}</span>
                                    </div>

                                    <div className="pt-4 border-t border-white/10">
                                        <h3 className="text-lg font-bold mb-2 text-white">Caractéristiques</h3>
                                        <ul className='space-y-1 text-sm text-gray-300'>
                                            <li><span className='font-bold text-orange'>Type de sol</span> : {place.floor}</li>
                                            <li><span className='font-bold text-orange'>Distance</span> : {place.distance} m</li>
                                            <li><span className='font-bold text-orange'>Dénivelé</span> : {place.elevation} m</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/10">
                        <p className="text-gray-400 italic">Aucun lieu disponible.</p>
                    </div>
                )}
            </div>
    );
};

export default LocationCard;