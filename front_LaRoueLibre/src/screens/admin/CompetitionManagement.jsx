import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import {
    FaCheck, FaTimes, FaTrophy, FaUser, FaBuilding,
    FaIdCard, FaCalendarAlt, FaPlus, FaEdit, FaTrash,
    FaListUl, FaTools, FaMapMarkerAlt, FaUsers
} from 'react-icons/fa';
import CompetitionFormModal from '../../components/admin/CompetitionFormModal';

const CompetitionManagement = () => {
    const { user } = useContext(AuthContext);
    const [registrations, setRegistrations] = useState([]);
    const [competitions, setCompetitions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [previewFile, setPreviewFile] = useState(null);

    const [activeTab, setActiveTab] = useState('registrations'); // 'registrations' or 'events'
    const [showFormModal, setShowFormModal] = useState(false);
    const [selectedCompetition, setSelectedCompetition] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            // Fetch Registrations
            const regRes = await axios.get(`${API_ROOT}/api/competition_registrations`, config);
            const regData = regRes.data['hydra:member'] || regRes.data.member || (Array.isArray(regRes.data) ? regRes.data : []);
            setRegistrations([...regData].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

            // Fetch Competitions
            const compRes = await axios.get(`${API_ROOT}/api/competitions`, config);
            const compData = compRes.data['hydra:member'] || compRes.data.member || (Array.isArray(compRes.data) ? compRes.data : []);
            setCompetitions([...compData].sort((a, b) => new Date(b.startAt) - new Date(a.startAt)));

        } catch (err) {
            console.error("Erreur fetching data:", err);
            setError("Impossible de charger les données.");
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

    const handleToggleStatus = async (comp) => {
        const isCurrentlyActive = Number(comp.is_active ?? comp.isActive) === 1;
        const newStatus = !isCurrentlyActive;
        const action = newStatus ? "activer" : "désactiver";

        if (!window.confirm(`Êtes-vous sûr de vouloir ${action} cette compétition ?`)) return;

        try {
            await axios.patch(`${API_ROOT}/api/competitions/${comp.id}`,
                { isActive: newStatus, is_active: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/merge-patch+json'
                    }
                }
            );
            fetchData();
        } catch (err) {
            console.error(`Erreur lors de l'action ${action}:`, err);
            alert(`Impossible de ${action} la compétition.`);
        }
    };

    const handleDeleteCompetition = async (id) => {
        if (!window.confirm("ATTENTION : Cette action est IRREVERSIBLE. Êtes-vous sûr de vouloir supprimer définitivement cette compétition et TOUTES les inscriptions liées ?")) return;

        try {
            await axios.delete(`${API_ROOT}/api/competitions/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            fetchData();
        } catch (err) {
            console.error("Erreur suppression compétition:", err);
            alert("Erreur lors de la suppression définitive.");
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
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
        <div className="animate-fade-in text-white pb-20">
            <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter">Gestion des <span className="text-orange">Compétitions</span></h1>
                    <p className="text-gray-400">Gérez les événements et validez les inscriptions des pilotes.</p>
                </div>

                {activeTab === 'events' && (
                    <button
                        onClick={() => { setSelectedCompetition(null); setShowFormModal(true); }}
                        className="bg-linear-to-r from-orange to-red-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-sm shadow-xl shadow-orange/20 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <FaPlus /> Créer un événement
                    </button>
                )}
            </div>

            {/* TABS NAVIGATION */}
            <div className="flex gap-2 mb-10 p-1.5 bg-black/20 rounded-3xl border border-white/5 w-fit">
                <button
                    onClick={() => setActiveTab('registrations')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase italic text-xs transition-all ${activeTab === 'registrations' ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    <FaListUl /> Demandes d'inscription ({registrations.length})
                </button>
                <button
                    onClick={() => setActiveTab('events')}
                    className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-black uppercase italic text-xs transition-all ${activeTab === 'events' ? 'bg-orange text-white shadow-lg shadow-orange/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                >
                    <FaTools /> Événements ({competitions.length})
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

            {/* TAB CONTENT: REGISTRATIONS */}
            {activeTab === 'registrations' && (
                <div className="grid grid-cols-1 gap-6">
                    {registrations.length > 0 ? registrations.map((reg) => (
                        <div key={reg.id} className="group bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl p-8 hover:border-orange/50 transition-all flex flex-col md:flex-row justify-between items-center gap-8">

                            <div className="flex-1 space-y-6 w-full">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                    <div className="w-14 h-14 bg-orange/20 rounded-2xl flex items-center justify-center text-orange shrink-0">
                                        <FaTrophy size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-1">
                                            <h2 className="text-2xl font-black italic uppercase text-white leading-tight">{reg.competition?.title || 'Compétition inconnue'}</h2>
                                            {Number(reg.competition?.is_active ?? reg.competition?.isActive ?? 1) === 0 && (
                                                <span className="bg-red-600/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest italic">Inactif</span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                            <FaCalendarAlt className="text-orange" /> Inscrit le {formatDate(reg.createdAt)}
                                        </p>
                                    </div>
                                    <div className={`w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase border ${reg.status === 'Confirmé' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                                            reg.status === 'Annulé' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                                'bg-orange/10 border-orange/20 text-orange animate-pulse'
                                        }`}>
                                        {reg.status}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 py-6 border-y border-white/5">
                                    <div>
                                        <span className="block text-gray-500 uppercase text-[9px] font-black tracking-widest mb-2 italic">Pilote</span>
                                        <span className="flex items-center gap-3 font-bold text-sm text-white">
                                            <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center"><FaUser className="text-orange text-[10px]" /></div>
                                            {reg.firstName} {reg.lastName}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 uppercase text-[9px] font-black tracking-widest mb-2 italic">Club</span>
                                        <span className="flex items-center gap-3 font-bold text-sm text-white">
                                            <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center"><FaBuilding className="text-orange text-[10px]" /></div>
                                            {reg.club}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 uppercase text-[9px] font-black tracking-widest mb-2 italic">Plaque / Cat</span>
                                        <span className="flex items-center gap-3 font-bold text-sm text-white">
                                            <div className="w-6 h-6 bg-white/5 rounded flex items-center justify-center"><FaIdCard className="text-orange text-[10px]" /></div>
                                            #{reg.plateNumber} <span className="text-[10px] text-gray-500 ml-1">({reg.category})</span>
                                        </span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500 uppercase text-[9px] font-black tracking-widest mb-2 italic">Document</span>
                                        {reg.licence ? (
                                            <span className="bg-white/5 px-3 py-1 rounded-lg text-xs font-bold text-blue-400 border border-white/10 italic">Licence #{typeof reg.licence === 'object' ? reg.licence.id : reg.licence.split('/').pop()}</span>
                                        ) : reg.licencePath ? (
                                            <button onClick={() => setPreviewFile(`${API_ROOT}${reg.licencePath}`)} className="bg-orange/10 border border-orange/20 text-orange px-4 py-1.5 rounded-lg text-[10px] font-black uppercase italic hover:bg-orange hover:text-white transition-all cursor-pointer">Vérifier</button>
                                        ) : (
                                            <span className="text-gray-600 text-xs italic">Non fourni</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions Registrations */}
                            <div className="flex flex-row md:flex-col gap-3 w-full md:w-auto">
                                {reg.status === 'En attente' && (
                                    <>
                                        <button
                                            onClick={() => handleStatusUpdate(reg.id, 'Confirmé')}
                                            className="flex-1 bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-900/20"
                                        >
                                            <FaCheck /> Valider
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(reg.id, 'Annulé')}
                                            className="flex-1 bg-white/5 hover:bg-red-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs border border-white/10 hover:border-red-600 transition-all flex items-center justify-center gap-2"
                                        >
                                            <FaTimes /> Refuser
                                        </button>
                                    </>
                                )}
                                {reg.status === 'Confirmé' && (
                                    <button
                                        onClick={() => handleStatusUpdate(reg.id, 'Annulé')}
                                        className="w-full bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs border border-red-600/20 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaTimes /> Annuler
                                    </button>
                                )}
                                {reg.status === 'Annulé' && (
                                    <button
                                        onClick={() => handleStatusUpdate(reg.id, 'Confirmé')}
                                        className="w-full bg-white/5 hover:bg-green-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-xs border border-white/10 transition-all flex items-center justify-center gap-2"
                                    >
                                        <FaCheck /> Ré-activer
                                    </button>
                                )}
                            </div>
                        </div>
                    )) : (
                        <div className="text-center py-20 bg-black/20 rounded-[3rem] border border-dashed border-white/10 italic text-gray-500">
                            Aucune inscription en attente.
                        </div>
                    )}
                </div>
            )}

            {/* TAB CONTENT: EVENTS */}
            {activeTab === 'events' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {competitions.length > 0 ? competitions.map((comp) => (
                        <div key={comp.id} className={`bg-black/40 backdrop-blur-md border ${Number(comp.is_active ?? comp.isActive ?? 1) === 0 ? 'border-red-500/30' : 'border-white/10'} rounded-3xl p-8 hover:border-orange/50 transition-all relative overflow-hidden group`}>
                            {/* Status Badge */}
                            <div className="absolute top-0 right-0 overflow-hidden rounded-bl-2xl z-20">
                                {Number(comp.is_active ?? comp.isActive ?? 1) === 0 ? (
                                    <div className="bg-red-600 text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        Inactif
                                    </div>
                                ) : (
                                    <div className="bg-green-600 text-white px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2">
                                        <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                        Actif
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-between items-start mb-8 pr-20">
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-orange overflow-hidden border border-white/5">
                                        {comp.path ? (
                                            <img src={`${API_ROOT}${comp.path}`} alt="" className="w-full h-full object-cover" />
                                        ) : <FaTrophy size={28} />}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black italic uppercase text-white leading-tight">{comp.title}</h2>
                                        <p className="text-orange text-[10px] font-black uppercase tracking-widest mt-1">ID : #{comp.id}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => { setSelectedCompetition(comp); setShowFormModal(true); }}
                                        className="w-10 h-10 bg-white/5 hover:bg-orange hover:text-white text-orange rounded-xl transition-all flex items-center justify-center"
                                        title="Modifier"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button 
                                        onClick={() => handleToggleStatus(comp)}
                                        className={`w-10 h-10 ${Number(comp.is_active ?? comp.isActive ?? 1) === 0 ? 'bg-green-600/20 text-green-500 hover:bg-green-600' : 'bg-red-600/20 text-red-500 hover:bg-red-600'} hover:text-white rounded-xl transition-all flex items-center justify-center shadow-lg`}
                                        title={Number(comp.is_active ?? comp.isActive ?? 1) === 0 ? "Activer" : "Désactiver"}
                                    >
                                        <FaTools />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteCompetition(comp.id)}
                                        className="w-10 h-10 bg-white/5 hover:bg-red-600 text-red-500 hover:text-white rounded-xl transition-all flex items-center justify-center"
                                        title="Supprimer définitivement"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-500 flex items-center gap-2 uppercase tracking-widest italic text-[9px]"><FaCalendarAlt className="text-orange" /> Début</span>
                                    <span className="text-white">{formatDate(comp.startAt)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-500 flex items-center gap-2 uppercase tracking-widest italic text-[9px]"><FaCalendarAlt className="text-orange" /> Fin</span>
                                    <span className="text-white">{formatDate(comp.endAt)}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-500 flex items-center gap-2 uppercase tracking-widest italic text-[9px]"><FaMapMarkerAlt className="text-orange" /> Lieu</span>
                                    <span className="text-white truncate max-w-[150px]">{comp.location}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-gray-500 flex items-center gap-2 uppercase tracking-widest italic text-[9px]"><FaUsers className="text-orange" /> Capacité</span>
                                    <span className="text-white">{comp.maxPeople} pilotes max</span>
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="col-span-2 text-center py-20 bg-black/20 rounded-[3rem] border border-dashed border-white/10 italic text-gray-500">
                            Aucune compétition créée.
                        </div>
                    )}
                </div>
            )}

            {/* Modal for registration file preview */}
            {previewFile && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in" onClick={() => setPreviewFile(null)}>
                    <div className="relative bg-[#0D111C] rounded-[2.5rem] border border-white/10 p-4 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b border-white/5">
                            <h3 className="text-xl font-black italic uppercase text-white">Vérification de la Licence</h3>
                            <button onClick={() => setPreviewFile(null)} className="text-gray-500 hover:text-white transition-colors">
                                <FaTimes size={24} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto bg-black/30 rounded-3xl m-4 flex items-center justify-center min-h-[50vh]">
                            {previewFile.toLowerCase().endsWith('.pdf') ? (
                                <iframe src={previewFile} className="w-full h-[70vh] rounded-3xl" title="Aperçu Permis" />
                            ) : (
                                <img src={previewFile} alt="Permis" className="max-w-full max-h-[70vh] object-contain rounded-3xl shadow-lg" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal for competition Form */}
            {showFormModal && (
                <CompetitionFormModal
                    competition={selectedCompetition}
                    token={user.token}
                    onClose={() => { setShowFormModal(false); setSelectedCompetition(null); }}
                    onSuccess={() => {
                        setShowFormModal(false);
                        setSelectedCompetition(null);
                        fetchData();
                    }}
                />
            )}
        </div>
    );
};

export default CompetitionManagement;
