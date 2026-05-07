import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { API_ROOT, IMAGE_URL } from '../constants/apiConstant';
import PageLoader from '../components/Loader/PageLoader';
import MapComponent from '../components/MapComponent';
import { 
    FaArrowLeft, FaMapMarkerAlt, FaMountain, FaWalking, 
    FaRulerHorizontal, FaLayerGroup, FaCalendarAlt, FaInfoCircle,
    FaHeart, FaRegHeart, FaCheckCircle, FaTimesCircle, FaEdit, FaMapMarkedAlt
} from 'react-icons/fa';
import PlaceFormModal from '../components/admin/PlaceFormModal';
import FormattedDescription from '../components/UI/FormattedDescription';

const LocationDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    
    const [place, setPlace] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [loading, setLoading] = useState(true);
    const [etatFavorisId, setEtatFavorisId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const config = user?.token ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
                
                // 1. Récupérer les détails du lieu
                const res = await axios.get(`${API_ROOT}/api/places/${id}`, config);
                setPlace(res.data);

                // 2. Récupérer l'ID de l'état 'Favoris' dynamiquement (pour la logique wishlist)
                const etatsRes = await axios.get(`${API_ROOT}/api/etats`, config);
                const etatsData = etatsRes.data['hydra:member'] || etatsRes.data.member || [];
                const favStatus = etatsData.find(e => e.label === 'Favoris');
                if (favStatus) setEtatFavorisId(favStatus.id);

                // 3. Vérifier si le lieu est déjà en favoris
                if (user?.token) {
                    const wishRes = await axios.get(`${API_ROOT}/api/wishlist/me`, config);
                    const isFav = wishRes.data.some(item => Number(item.placeId) === Number(id));
                    setIsFavorite(isFav);
                }
            } catch (err) {
                console.error("Erreur de chargement détaillés:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user]);

    const handleToggleWishlist = async () => {
        if (!user?.token) return navigate('/login');

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Utilisation de l'ID d'état récupéré dynamiquement
            const response = await axios.post(
                `${API_ROOT}/api/wishlist/toggle/${id}`, 
                { etatId: etatFavorisId }, 
                config
            );
            setIsFavorite(response.data.isFavorite);
        } catch (err) {
            console.error("Erreur lors du toggle wishlist:", err);
        }
    };

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
        } catch (error) { return []; }
    };

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

    if (loading) return <PageLoader />;
    if (!place) return <div className="text-white text-center py-20">Lieu introuvable.</div>;

    const userRoles = getRolesFromToken(user?.token);
    const isAdmin = userRoles.includes("ROLE_ADMIN");
    const isOwner = user && (place.user === `/api/users/${user.id}` || place.user?.id === user.id);
    const canEdit = isAdmin || isOwner;

    // Logique de vérification ultra-robuste (bool, int ou string) incluant is_active
    const isPlaceActive = place.is_active === true || place.is_active === 1 || place.is_active === "1" || place.isActive === true || place.isActive === 1 || place.active === true || place.active === 1;

    // Préparation du point pour la carte
    const coords = parseCoordinates(place.coordinates);
    const mapPoint = coords ? [{
        ...coords,
        id: place.id,
        title: place.name,
        type: 'place'
    }] : [];

    return (
        <div className="bg-dark-nigth-blue min-h-screen text-white">
            {/* Header Image */}
            <div className="relative h-80 md:h-112.5 w-full">
                <img 
                    src={place.path ? (place.path.startsWith('/') ? `${API_ROOT}${place.path}` : `${API_ROOT}/images/places/${place.path}`) : `${IMAGE_URL}/default/default_location.png`} 
                    className="w-full h-full object-cover"
                    alt={place.name}
                />
                <div className="absolute inset-0 bg-linear-to-t from-dark-nigth-blue via-transparent to-black/30"></div>
                
                <div className="absolute top-6 left-6 flex gap-4 z-20">
                    <button onClick={() => navigate("/location")} className="p-3 bg-black/60 rounded-full hover:bg-orange transition-all">
                        <FaArrowLeft />
                    </button>
                </div>

                {/* Bouton Wishlist flottant */}
                <button 
                    onClick={handleToggleWishlist}
                    className="absolute top-6 right-6 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-full hover:scale-110 transition-all z-20"
                >
                    {isFavorite ? <FaHeart className="text-red-500 text-2xl" /> : <FaRegHeart className="text-white text-2xl" />}
                </button>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-20 md:-mt-32 relative z-10 pb-20">
                <div className="bg-black/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                    
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-4xl font-black text-white">{place.name}</h1>
                                
                                {isPlaceActive ? (
                                    <span className="flex items-center gap-1 text-green-500 text-sm font-bold bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                                        <FaCheckCircle /> Actif
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-red-500 text-sm font-bold bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                                        <FaTimesCircle /> Inactif
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-orange">
                                <FaMapMarkerAlt />
                                <span className="text-sm font-medium">{place.coordinates || 'Coordonnées GPS'}</span>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 items-center w-full md:w-auto">
                            <div className="w-full sm:w-auto px-6 py-2 bg-orange text-black font-black rounded-full uppercase text-sm text-center">
                                {place.difficulty}
                            </div>
                            {canEdit && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="p-3 bg-white/10 hover:bg-orange hover:text-black rounded-full transition-all border border-white/20"
                                    title="Modifier le lieu"
                                >
                                    <FaEdit size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Caractéristiques */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-white/10 transition-colors">
                            <FaRulerHorizontal className="text-orange text-xl mb-2" />
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">Distance</span>
                            <span className="text-lg md:text-xl font-bold">{place.distance} km</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-white/10 transition-colors">
                            <FaMountain className="text-orange text-xl mb-2" />
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">Dénivelé</span>
                            <span className="text-lg md:text-xl font-bold">{place.elevation} m</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-white/10 transition-colors">
                            <FaLayerGroup className="text-orange text-xl mb-2" />
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">Sol</span>
                            <span className="text-lg md:text-xl font-bold">{place.floor || 'N/A'}</span>
                        </div>
                        <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col items-center hover:bg-white/10 transition-colors">
                            <FaInfoCircle className="text-orange text-xl mb-2" />
                            <span className="text-gray-400 text-[10px] uppercase tracking-wider">Réf</span>
                            <span className="text-lg md:text-xl font-bold">#{place.id}</span>
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaInfoCircle className="text-orange" /> Description
                        </h3>
                        <div className="text-gray-300 leading-relaxed text-base md:text-lg bg-white/5 p-4 md:p-6 rounded-2xl border border-white/5">
                            <FormattedDescription text={place.description} />
                        </div>
                    </div>

                    {/* Carte Interactive */}
                    <div className="mt-10">
                        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <FaMapMarkedAlt className="text-orange" /> Localisation
                        </h3>
                        <div className="h-64 md:h-96 w-full rounded-2xl overflow-hidden border border-white/10 shadow-xl">
                            {coords ? (
                                <MapComponent 
                                    points={mapPoint} 
                                    center={[coords.lat, coords.lng]} 
                                    zoom={14} 
                                />
                            ) : (
                                <div className="h-full w-full bg-white/5 flex items-center justify-center text-gray-500 italic">
                                    Coordonnées non disponibles
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {/* MODAL D'ÉDITION */}
            {isEditing && (
                <PlaceFormModal 
                    initialPlace={place} 
                    onClose={() => setIsEditing(false)} 
                    onSuccess={() => { setIsEditing(false); window.location.reload(); }} 
                    />
            )}
        </div>
    );
};

export default LocationDetail;