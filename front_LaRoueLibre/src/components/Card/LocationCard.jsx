import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';
import ButtonLoader from '../Loader/ButtonLoader';
import { FaEdit, FaMapMarkerAlt, FaRoute, FaHeart, FaRegHeart, FaEye, FaPlus } from 'react-icons/fa'; // Ajout de FaPlus
import { Link, useNavigate } from 'react-router-dom';
import PlaceFormModal from '../admin/PlaceFormModal';
import FormattedDescription from '../UI/FormattedDescription';

const LocationCard = ({ data = null }) => { // Ajout de la prop "data" pour le mode profil
    const [places, setPlaces] = useState([]);
    const [wishlist, setWishlist] = useState([]);

    const [etatFavorisId, setEtatFavorisId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingPlace, setEditingPlace] = useState(null);
    
    const navigate = useNavigate(); // Initialisation du hook de navigation
    const { user, setUser } = useContext(AuthContext);

    const getRolesFromToken = (token) => {
        if (!token) return [];
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
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

    const userRoles = getRolesFromToken(user?.token);
    const isAdmin = userRoles.includes("ROLE_ADMIN");

    const handleToggleWishlist = async (e, placeId) => {
        e.stopPropagation(); // Empêche la redirection vers le détail lors du clic sur le cœur
        if (!user?.token) return;

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const response = await axios.post(
                `${API_ROOT}/api/wishlist/toggle/${placeId}`, 
                { etatId: etatFavorisId }, 
                config
            );
            
            if (response.data.isFavorite) {
                setWishlist([...wishlist, placeId]);
            } else {
                setWishlist(wishlist.filter(id => id !== placeId));
            }
        } catch (err) {
            console.error("Erreur lors du toggle wishlist:", err);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Mode Profil : si "data" est passé, on ne charge pas tout
                if (data) {
                    setPlaces([data]);
                    setIsLoading(false);
                    return;
                }

                const config = user?.token ? {
                    headers: { Authorization: `Bearer ${user.token}` }
                } : {};

                const placesRes = await axios.get(`${API_ROOT}/api/places`, config);
                const placesData = placesRes.data['hydra:member'] || placesRes.data.member || [];
                setPlaces(Array.isArray(placesData) ? placesData : []);

                const etatsRes = await axios.get(`${API_ROOT}/api/etats`, config);
                const etatsData = etatsRes.data['hydra:member'] || etatsRes.data.member || [];
                const favStatus = etatsData.find(e => e.label === 'Favoris');
                if (favStatus) setEtatFavorisId(favStatus.id);

                if (user?.token) {
                    const wishRes = await axios.get(`${API_ROOT}/api/wishlist/me`, config);
                    const favIds = wishRes.data.map(item => item.placeId);
                    setWishlist(favIds);
                }

            } catch (err) {
                console.error("Erreur de chargement:", err);
                if (err.response?.status === 401) {
                    setError("Session expirée. Veuillez vous reconnecter.");
                    // Si on a un token mais qu'il est invalide/expiré, on déconnecte l'user
                    if (user?.token) {
                        setUser(null);
                    }
                } else {
                    setError("Impossible de charger les données.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user, data]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-10 bg-dark-nigth-blue">
                <ButtonLoader size={60} />
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10 text-white">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-6">
                <h1 className="title-h1 flex items-center gap-4 m-0!">
                    <FaRoute className="text-orange" />
                    Itinéraires & Lieux
                </h1>
                {user && (
                    <button 
                        onClick={() => setEditingPlace({
                            name: '',
                            description: '',
                            coordinates: '',
                            elevation: 0,
                            distance: 0,
                            difficulty: 'Facile',
                            floor: '',
                            path: ''
                        })}
                        className="w-full sm:w-auto bg-orange hover:bg-orange/80 text-black px-6 py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-all shadow-lg shadow-orange/20"
                    >
                        <FaPlus /> Ajouter un lieu
                    </button>
                )}
            </div>

            {places && places.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {places.map((place) => {
                        const isFav = wishlist.includes(place.id) || !!data; // Forcer si mode profil

                        return (
                            <div 
                                key={place.id} 
                                onClick={() => navigate(`/location/${place.id}`)} // Redirection vers le détail
                                className="cursor-pointer group bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden hover:border-orange/50 transition-all duration-300 shadow-xl flex flex-col relative"
                            >

                                <div className="relative h-48 w-full overflow-hidden">
                                    <img 
                                        src={place.path ? (place.path.startsWith('/') ? `${API_ROOT}${place.path}` : `${API_ROOT}/images/places/${place.path}`) : `${IMAGE_URL}/default/default_location.png`} 
                                        alt={place.name} 
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    
                                    {(isAdmin || (user && place.user === `/api/users/${user.id}`)) && (
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setEditingPlace(place); }}
                                            className="absolute top-4 right-4 bg-orange hover:bg-white text-black p-3 rounded-full shadow-lg transition-colors duration-300 z-20"
                                        >
                                            <FaEdit size={18} />
                                        </button>
                                    )}
                                </div>

                                <div className="p-6 flex-1">
                                    <h2 className="text-xl font-bold mb-2 text-white group-hover:text-orange transition-colors">{place.name}</h2>
                                    <div className="text-gray-400 text-sm mb-4 line-clamp-3">
                                        <FormattedDescription text={place.description} />
                                    </div>
                                    <div className="flex items-center gap-2 text-orange text-sm mb-4 ">
                                        <Link
                                            to={`/location/${place.id}`}
                                            className="group-hover:animate-slideup2 bg-orange hover:bg-orange/80 text-black px-4 py-2 w-full text-center font-bold rounded-full shadow-lg transition-colors duration-200"
                                        >
                                            Voir
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-20 bg-black/20 rounded-2xl border border-white/10">
                    <p className="text-gray-400 italic">Aucun lieu disponible.</p>
                </div>
            )}
            {/* MODAL D'ÉDITION */}
            {editingPlace && (
                <PlaceFormModal 
                    initialPlace={editingPlace} 
                    onClose={() => setEditingPlace(null)} 
                    onSuccess={() => { setEditingPlace(null); window.location.reload(); }} 
                />
            )}
        </div>
    );
};

export default LocationCard;