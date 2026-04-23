import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import { FaEdit, FaTrashAlt, FaPlus, FaMapMarkerAlt } from 'react-icons/fa';
import PlaceFormModal from '../../components/admin/PlaceFormModal';

const PlacesManagement = () => {
    const { user } = useContext(AuthContext);
    const [places, setPlaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingPlace, setEditingPlace] = useState(null);

    const fetchPlaces = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_ROOT}/api/places`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = response.data['hydra:member'] || response.data['member'] || response.data || [];
            setPlaces(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur fetching places:", err);
            setError("Impossible de charger les lieux.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlaces();
    }, [user.token]);

    const handleEditClick = (place) => {
        setEditingPlace({ ...place });
    };

    const handleAddClick = () => {
        setEditingPlace({
            name: '',
            description: '',
            coordinates: '',
            elevation: 0,
            distance: 0,
            difficulty: 'Facile',
            floor: '',
            path: ''
        });
    };

    if (isLoading) return <div className="flex justify-center py-20"><ButtonLoader size={60} /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <h1 className="title-h2">Gestion des Itinéraires / Lieux</h1>
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-orange hover:bg-orange/80 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-lg shadow-orange/20"
                >
                    <FaPlus /> Ajouter un lieu
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 font-bold text-gray-300">Lieu</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Coordonnées</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Catégorie</th>
                            <th className="px-6 py-4 font-bold text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {places.map((p) => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/10 border border-white/5 shrink-0">
                                            <img
                                                src={p.path ? (p.path.startsWith('/') ? `${API_ROOT}${p.path}` : `${IMAGE_URL}/places/${p.path}`) : `${IMAGE_URL}/default/default_location.png`}
                                                alt={p.name}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex items-center gap-2 text-white group-hover:text-orange transition-colors">
                                            <FaMapMarkerAlt className="text-gray-500 group-hover:text-orange" />
                                            <span className="font-semibold">{p.name}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400">{p.coordinates || "N/A"}</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold">
                                        {p.category || "Découverte"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button 
                                            onClick={() => handleEditClick(p)}
                                            className="p-2 hover:bg-orange/20 text-orange rounded-lg transition-all" title="Modifier"
                                        >
                                            <FaEdit size={18} />
                                        </button>
                                        <button className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all" title="Supprimer">
                                            <FaTrashAlt size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL D'ÉDITION / CRÉATION */}
            {editingPlace && (
                <PlaceFormModal 
                    initialPlace={editingPlace} 
                    onClose={() => setEditingPlace(null)} 
                    onSuccess={() => { setEditingPlace(null); fetchPlaces(); }} 
                />
            )}
        </div>
    );
};

export default PlacesManagement;
