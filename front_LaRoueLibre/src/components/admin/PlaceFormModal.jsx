import React, { useState, useContext } from 'react';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../Loader/ButtonLoader';
import { FaEdit, FaPlus, FaTimes } from 'react-icons/fa';

const PlaceFormModal = ({ initialPlace, onClose, onSuccess }) => {
    const { user } = useContext(AuthContext);
    const [editingPlace, setEditingPlace] = useState(initialPlace);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    React.useEffect(() => {
        if (!imageFile) return;
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let parsedValue = value;
        if (name === 'distance' || name === 'elevation') {
            parsedValue = value === '' ? '' : parseFloat(value);
        }
        setEditingPlace(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateError(null);

        try {
            const payload = {
                name: editingPlace.name,
                description: editingPlace.description,
                coordinates: editingPlace.coordinates,
                elevation: parseInt(editingPlace.elevation, 10) || 0,
                distance: parseFloat(editingPlace.distance) || 0,
                difficulty: editingPlace.difficulty || 'Facile',
                floor: editingPlace.floor,
                path: editingPlace.path
            };

            let placeId = editingPlace.id;

            if (placeId) {
                await axios.put(`${API_ROOT}/api/places/${placeId}`, payload, {
                    headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/ld+json' }
                });
            } else {
                const res = await axios.post(`${API_ROOT}/api/places`, payload, {
                    headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/ld+json' }
                });
                placeId = res.data.id;
            }

            if (imageFile && placeId) {
                const imgData = new FormData();
                imgData.append('file', imageFile);
                await axios.post(`${API_ROOT}/api/places/${placeId}/image`, imgData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }

            onSuccess();
        } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            setUpdateError((editingPlace.id ? "Erreur lors de la mise à jour du lieu. " : "Erreur lors de la création du lieu. ") + (err.response?.data?.['hydra:description'] || err.message));
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteImage = async () => {
        if (!editingPlace.id || !editingPlace.path) return;
        if (!window.confirm("Supprimer l'image définitivement ?")) return;

        try {
            await axios.delete(`${API_ROOT}/api/places/${editingPlace.id}/image`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setEditingPlace(prev => ({ ...prev, path: "" }));
            setImageFile(null);
            setPreviewUrl(null);
        } catch (err) {
            console.error("Erreur suppression image:", err);
            setUpdateError("Impossible de supprimer l'image.");
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-nigth-blue border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideup">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        {editingPlace.id ? <FaEdit className="text-orange" /> : <FaPlus className="text-orange" />}
                        {editingPlace.id ? 'Modifier le lieu' : 'Créer un lieu'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nom du lieu</label>
                            <input
                                type="text" name="name" value={editingPlace.name || ''} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Coordonnées</label>
                            <input
                                type="text" name="coordinates" value={editingPlace.coordinates || ''} onChange={handleInputChange}
                                placeholder="ex: 43.1833° N, 3.0041° E"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Distance (km)</label>
                            <input
                                type="number" step="0.1" name="distance" value={editingPlace.distance !== undefined ? editingPlace.distance : ''} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Dénivelé positif (m)</label>
                            <input
                                type="number" name="elevation" value={editingPlace.elevation !== undefined ? editingPlace.elevation : ''} onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Difficulté</label>
                            <select
                                name="difficulty" value={editingPlace.difficulty || 'Facile'} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all appearance-none"
                            >
                                <option value="Très facile" className="bg-dark-nigth-blue">Très facile</option>
                                <option value="Facile" className="bg-dark-nigth-blue">Facile</option>
                                <option value="Moyen" className="bg-dark-nigth-blue">Moyen</option>
                                <option value="Difficile" className="bg-dark-nigth-blue">Difficile</option>
                                <option value="Très difficile" className="bg-dark-nigth-blue">Très difficile</option>
                            </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Type de sol / Revêtement</label>
                            <input
                                type="text" name="floor" value={editingPlace.floor || ''} onChange={handleInputChange}
                                placeholder="ex: Bitume, Gravier..."
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Image du lieu</label>
                            <div className="flex gap-6 items-center bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="relative text-center">
                                    <p className="text-[10px] text-gray-400 uppercase mb-2">Actuelle</p>
                                    <img
                                        src={editingPlace.path ? (editingPlace.path.startsWith('/') ? `${API_ROOT}${editingPlace.path}` : `${API_ROOT}/images/places/${editingPlace.path}`) : `${IMAGE_URL}/default/default_location.png`}
                                        alt="Aperçu actuel"
                                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                                        onError={(e) => { e.target.onerror = null; e.target.src = `${IMAGE_URL}/default/default_location.png`; }}
                                    />
                                    {editingPlace.path && (
                                        <button 
                                            type="button" onClick={handleDeleteImage}
                                            className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                                            title="Supprimer l'image"
                                        >
                                            <FaTimes size={10} />
                                        </button>
                                    )}
                                </div>
                                {previewUrl && (
                                    <div className="text-center">
                                        <p className="text-[10px] text-orange uppercase mb-2">Nouvelle</p>
                                        <img 
                                            src={previewUrl} 
                                            className="w-16 h-16 rounded-xl object-cover border border-orange shrink-0" 
                                            alt="Nouvel aperçu"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 ml-4">
                                    <input
                                        type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
                                        className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange/20 file:text-orange hover:file:bg-orange hover:file:text-white transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</label>
                            <textarea
                                name="description" value={editingPlace.description || ''} onChange={handleInputChange} rows={4}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                    </div>

                    {updateError && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">{updateError}</div>}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit" disabled={isUpdating}
                            className="flex-1 bg-orange hover:bg-orange/80 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange/20 flex justify-center items-center gap-2"
                        >
                            {isUpdating ? <ButtonLoader size={20} /> : (editingPlace.id ? 'Sauvegarder les modifications' : 'Créer le lieu')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PlaceFormModal;
