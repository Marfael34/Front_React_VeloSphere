import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import { FaTimes, FaTrophy, FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaImage, FaCheckCircle, FaSpinner } from 'react-icons/fa';

const CompetitionFormModal = ({ competition, onClose, onSuccess, token }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        maxPeople: 100,
        startAt: '',
        endAt: '',
        location: '',
        isActive: true,
        imageFile: null
    });
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (competition) {
            setFormData({
                title: competition.title || '',
                description: competition.description || '',
                maxPeople: competition.maxPeople || 100,
                startAt: competition.startAt ? new Date(competition.startAt).toISOString().slice(0, 16) : '',
                endAt: competition.endAt ? new Date(competition.endAt).toISOString().slice(0, 16) : '',
                location: competition.location || '',
                isActive: (competition.isActive !== undefined ? !!competition.isActive : (competition.is_active !== undefined ? !!competition.is_active : true)),
                imageFile: null
            });
        }
    }, [competition]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const config = {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/ld+json'
                }
            };

            const payload = {
                title: formData.title,
                description: formData.description,
                maxPeople: parseInt(formData.maxPeople),
                startAt: formData.startAt,
                endAt: formData.endAt,
                location: formData.location,
                isActive: formData.isActive,
                is_active: formData.isActive
            };

            let response;
            if (competition) {
                // UPDATE
                response = await axios.patch(`${API_ROOT}/api/competitions/${competition.id}`, payload, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/merge-patch+json'
                    }
                });
            } else {
                // CREATE
                response = await axios.post(`${API_ROOT}/api/competitions`, payload, config);
            }

            const competitionId = response.data.id;

            // UPLOAD IMAGE if selected
            if (formData.imageFile) {
                const imageData = new FormData();
                imageData.append('file', formData.imageFile);

                await axios.post(`${API_ROOT}/api/competitions/${competitionId}/image`, imageData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            onSuccess();
        } catch (err) {
            console.error("Error saving competition:", err);
            setError(err.response?.data?.['hydra:description'] || "Une erreur est survenue.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-[#0D111C] rounded-[2.5rem] border border-white/10 shadow-2xl my-auto">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h2 className="text-2xl font-black italic uppercase text-white flex items-center gap-3">
                        <FaTrophy className="text-orange" />
                        {competition ? "Modifier" : "Ajouter"} une <span className="text-orange">Compétition</span>
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <FaTimes size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-bold italic">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative group">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2">Titre de la compétition</label>
                            <input 
                                type="text" required placeholder="ex: Open BMX La Roue Libre"
                                value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>

                        <div className="relative group">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1 mb-2">Description</label>
                            <textarea 
                                rows="3" placeholder="Description de l'événement..."
                                value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                                className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-white focus:border-orange outline-none transition-all resize-none"
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Date de début</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                    <input 
                                        type="datetime-local" required
                                        value={formData.startAt} onChange={(e) => setFormData({...formData, startAt: e.target.value})}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Date de fin</label>
                                <div className="relative">
                                    <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                    <input 
                                        type="datetime-local" required
                                        value={formData.endAt} onChange={(e) => setFormData({...formData, endAt: e.target.value})}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Lieu</label>
                                <div className="relative">
                                    <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                    <input 
                                        type="text" required placeholder="Circuit BMX de..."
                                        value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Nombre max de participants</label>
                                <div className="relative">
                                    <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                    <input 
                                        type="number" required
                                        value={formData.maxPeople} onChange={(e) => setFormData({...formData, maxPeople: e.target.value})}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Affiche de la compétition</label>
                            <div className="relative group bg-black/40 border border-dashed border-white/10 p-6 rounded-2xl hover:border-orange transition-all flex flex-col items-center text-center cursor-pointer">
                                <FaImage className="text-gray-600 mb-2" size={30} />
                                <input 
                                    type="file" accept="image/*"
                                    onChange={(e) => setFormData({...formData, imageFile: e.target.files[0]})}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                    {formData.imageFile ? formData.imageFile.name : "Cliquer pour uploader une affiche"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-white/2 rounded-2xl border border-white/5">
                            <input 
                                type="checkbox" id="isActive"
                                checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                className="w-5 h-5 accent-orange bg-black border-white/10 rounded"
                            />
                            <label htmlFor="isActive" className="text-xs font-bold text-gray-400 cursor-pointer">
                                Compétition active (visible par les utilisateurs)
                            </label>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button" onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white py-4 rounded-2xl font-black uppercase italic text-xs transition-all"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" disabled={isSubmitting}
                            className="flex-2 bg-linear-to-r from-orange to-red-500 text-white py-4 rounded-2xl font-black uppercase italic text-xs shadow-lg shadow-orange/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <FaSpinner className="animate-spin" /> : <FaCheckCircle />}
                            {isSubmitting ? "Enregistrement..." : (competition ? "Enregistrer les modifications" : "Créer la compétition")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompetitionFormModal;
