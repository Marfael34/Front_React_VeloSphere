import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import { FaCheck, FaTimes, FaTrophy, FaUser, FaBuilding, FaIdCard, FaCalendarAlt } from 'react-icons/fa';

const CompetitionManagement = () => {
    const { user } = useContext(AuthContext);
    const [registrations, setRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const res = await axios.get(`${API_ROOT}/api/competition_registrations`, config);
            const data = res.data['hydra:member'] || res.data.member || (Array.isArray(res.data) ? res.data : []);
            
            // Trier par date de création décroissante
            const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setRegistrations(sortedData);
        } catch (err) {
            console.error("Erreur fetching registrations:", err);
            setError("Impossible de charger les inscriptions.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.token]);

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await axios.patch(`${API_ROOT}/api/competition_registrations/${id}`, 
                { status: newStatus },
                { 
                    headers: { 
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/merge-patch+json'
                    } 
                }
            );
            fetchData();
        } catch (err) {
            console.error("Erreur mise à jour statut:", err);
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) return <div className="flex justify-center py-20"><ButtonLoader size={60} /></div>;

    return (
        <div className="animate-fade-in text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">Gestion des <span className="text-orange">Compétitions</span></h1>
                <p className="text-gray-400">Validez les inscriptions des pilotes aux différents événements.</p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

            <div className="grid grid-cols-1 gap-6">
                {registrations.length > 0 ? registrations.map((reg) => (
                    <div key={reg.id} className="group bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-orange/50 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                        
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange/20 rounded-xl flex items-center justify-center text-orange">
                                    <FaTrophy size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold uppercase italic">{reg.competition?.title || 'Compétition inconnue'}</h2>
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                        <FaCalendarAlt className="text-orange" /> Inscrit le {formatDate(reg.createdAt)}
                                    </p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                    reg.status === 'Confirmé' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                                    reg.status === 'Annulé' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                    'bg-orange/10 border-orange/20 text-orange animate-pulse'
                                }`}>
                                    {reg.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-4 border-t border-white/5">
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-black tracking-widest mb-1">Pilote</span>
                                    <span className="flex items-center gap-2 font-bold"><FaUser className="text-orange text-xs" /> {reg.firstName} {reg.lastName}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-black tracking-widest mb-1">Club</span>
                                    <span className="flex items-center gap-2 font-bold"><FaBuilding className="text-orange text-xs" /> {reg.club}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-black tracking-widest mb-1">Plaque</span>
                                    <span className="flex items-center gap-2 font-bold text-orange"><FaIdCard className="text-orange text-xs" /> #{reg.plateNumber}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-black tracking-widest mb-1">Permis</span>
                                    {reg.licence ? (
                                        <span className="bg-white/5 px-2 py-1 rounded text-xs font-bold text-blue-400">#{typeof reg.licence === 'object' ? reg.licence.id : reg.licence.split('/').pop()}</span>
                                    ) : reg.licencePath ? (
                                        <button onClick={() => setPreviewFile(`${API_ROOT}${reg.licencePath}`)} className="bg-orange/10 border border-orange/20 text-orange px-2 py-1 rounded text-xs font-bold hover:bg-orange hover:text-white transition-colors inline-block cursor-pointer">Voir le fichier</button>
                                    ) : (
                                        <span className="bg-white/5 px-2 py-1 rounded text-xs font-bold text-gray-500">N/A</span>
                                    )}
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-black tracking-widest mb-1">Catégorie</span>
                                    <span className="bg-white/5 px-2 py-1 rounded text-xs font-bold">{reg.category}</span>
                                </div>
                            </div>
                            
                            <div className="text-[10px] text-gray-500 italic">
                                Compte utilisateur : {reg.user?.email}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row md:flex-col gap-2">
                            {reg.status === 'En attente' && (
                                <>
                                    <button 
                                        onClick={() => handleStatusUpdate(reg.id, 'Confirmé')}
                                        className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-black uppercase italic text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                    >
                                        <FaCheck /> Valider
                                    </button>
                                    <button 
                                        onClick={() => handleStatusUpdate(reg.id, 'Annulé')}
                                        className="bg-white/5 hover:bg-red-600 text-white px-6 py-3 rounded-xl font-black uppercase italic text-xs border border-white/10 hover:border-red-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Refuser
                                    </button>
                                </>
                            )}
                            {reg.status === 'Confirmé' && (
                                <button 
                                    onClick={() => handleStatusUpdate(reg.id, 'Annulé')}
                                    className="bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-6 py-3 rounded-xl font-black uppercase italic text-xs border border-red-600/20 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaTimes /> Annuler l'inscription
                                </button>
                            )}
                            {reg.status === 'Annulé' && (
                                <button 
                                    onClick={() => handleStatusUpdate(reg.id, 'Confirmé')}
                                    className="bg-white/5 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-black uppercase italic text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
                                >
                                    <FaCheck /> Ré-activer
                                </button>
                            )}
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/10 italic text-gray-500">
                        Aucune inscription enregistrée pour le moment.
                    </div>
                )}
            </div>

            {/* Modal for file preview */}
            {previewFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setPreviewFile(null)}>
                    <div className="relative bg-[#0D111C] rounded-2xl border border-white/10 p-4 max-w-4xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold italic uppercase">Aperçu du Permis</h3>
                            <button onClick={() => setPreviewFile(null)} className="text-gray-400 hover:text-white transition-colors">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-black/50 rounded-xl flex items-center justify-center min-h-[50vh]">
                            {previewFile.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={previewFile} className="w-full h-[70vh] rounded-xl" title="Aperçu Permis" />
                            ) : (
                                <img src={previewFile} alt="Permis" className="max-w-full max-h-[70vh] object-contain rounded-xl" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompetitionManagement;
