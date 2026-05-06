import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { 
    FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTrophy, FaCheckCircle, 
    FaSpinner, FaTimes, FaBolt
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import CompetitionRegistrationModal from '../components/CompetitionRegistrationModal';

const Competitions = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [competitions, setCompetitions] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showForm, setShowForm] = useState(null);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [userLicences, setUserLicences] = useState([]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_ROOT}/api/competitions`);
            const data = response.data['hydra:member'] || response.data.member || response.data;
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            
            const activeCompetitions = data.filter(comp => {
                const isActive = Number(comp.is_active ?? comp.isActive ?? 1) !== 0;
                const isRecent = !comp.endAt || new Date(comp.endAt) > oneWeekAgo;
                return isActive && isRecent;
            });
            setCompetitions(activeCompetitions);

            if (user) {
                try {
                    const regResponse = await axios.get(`${API_ROOT}/api/competition_registrations?user=/api/users/${user.id}`);
                    const regData = regResponse.data['hydra:member'] || regResponse.data.member || [];
                    setUserRegistrations(regData.map(r => ({
                        compId: typeof r.competition === 'string' ? r.competition : (r.competition?.['@id'] || `/api/competitions/${r.competition?.id}`),
                        status: r.status,
                        id: r.id
                    })));
                } catch (regErr) {
                    console.error("Erreur lors de la récupération des inscriptions:", regErr);
                }
            }
        } catch (err) {
            console.error("Erreur lors du chargement des données:", err);
            setError("Impossible de charger les compétitions.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleOpenForm = async (comp) => {
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            const res = await axios.get(`${API_ROOT}/api/licences?user=/api/users/${user.id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const licences = res.data['hydra:member'] || res.data.member || [];
            setUserLicences(licences);
            setShowForm(comp);
        } catch (err) {
            console.error("Erreur chargement licences:", err);
            if (err.response?.status === 401) {
                navigate('/login');
                return;
            }
            setError("Erreur lors de la vérification de vos permis.");
        }
    };

    const handleSuccess = async () => {
        await fetchData();
        setShowForm(null);
        setSuccessMessage("Inscription réussie ! Votre demande est en cours de validation.");
        setTimeout(() => setSuccessMessage(null), 5000);
    };
    const formatDate = (dateString) => {
        if (!dateString) return "Date à confirmer";
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <div className="min-h-screen bg-[#050810] text-white overflow-x-hidden">
            {/* HERO SECTION */}
            <div className="relative pt-32 pb-20 px-4 md:px-8 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-orange/10 blur-[120px] rounded-full opacity-30 -z-10"></div>
                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center animate-fade-in">
                        <div className="inline-flex items-center gap-2 bg-orange/10 border border-orange/20 px-4 py-2 rounded-full text-orange text-xs font-black uppercase tracking-[0.2em] mb-6">
                            <FaBolt className="animate-pulse" /> Événements Officiels
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black italic uppercase text-white tracking-tighter leading-none mb-6">
                            Compétitions <br />
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange to-red-500">PRO SERIES</span>
                        </h1>
                        <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
                            Rejoignez l'élite du BMX. Inscrivez-vous aux prochaines compétitions et montrez votre talent sur la piste.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pb-32 px-4 md:px-8">
                {successMessage && (
                    <div className="mb-12 bg-green-500/10 border border-green-500/20 text-green-500 p-6 rounded-4xl text-center flex items-center justify-center gap-3 animate-bounce shadow-2xl shadow-green-500/10">
                        <FaCheckCircle className="text-2xl" /> 
                        <span className="font-black uppercase italic tracking-tight">{successMessage}</span>
                    </div>
                )}

                {error && !showForm && (
                    <div className="mb-12 bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-4xl text-center">
                        <p className="font-bold mb-4">{error}</p>
                        <button onClick={fetchData} className="bg-red-500 text-white px-6 py-2 rounded-xl font-black uppercase italic text-xs hover:bg-red-600 transition-colors">Réessayer</button>
                    </div>
                )}

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-6">
                        <div className="relative">
                            <FaSpinner className="text-orange text-6xl animate-spin" />
                            <div className="absolute inset-0 bg-orange blur-2xl opacity-20 animate-pulse"></div>
                        </div>
                        <p className="text-gray-500 font-black uppercase tracking-[0.3em] animate-pulse">Synchronisation des données...</p>
                    </div>
                ) : competitions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {competitions.map((comp) => {
                            const registration = userRegistrations.find(r => r.compId === `/api/competitions/${comp.id}`);
                            return (
                                <div key={comp.id} className="group relative bg-[#0D111C] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-orange/30 transition-all duration-700 shadow-2xl flex flex-col hover:-translate-y-2">
                                    {/* Image Container */}
                                    <div className="relative h-64 overflow-hidden bg-orange/5">
                                        {comp.path ? (
                                            <img 
                                                src={`${API_ROOT}${comp.path}`} 
                                                alt={comp.title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-10">
                                                <FaTrophy className="text-8xl text-orange" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-linear-to-t from-[#0D111C] via-transparent to-transparent"></div>
                                        
                                        {/* Date Badge */}
                                        <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md border border-white/10 text-white px-5 py-2.5 rounded-2xl font-black italic uppercase text-xs shadow-xl">
                                            <FaCalendarAlt className="inline mr-2 text-orange" />
                                            {formatDate(comp.startAt)}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex-1 flex flex-col">
                                        <h2 className="text-2xl font-black italic uppercase text-white mb-4 leading-tight group-hover:text-orange transition-colors">
                                            {comp.title}
                                        </h2>
                                        <p className="text-gray-400 text-sm mb-8 line-clamp-2 font-medium leading-relaxed">
                                            {comp.description || "Une compétition majeure de la saison sur un tracé technique et rapide. Préparez-vous à l'affrontement."}
                                        </p>

                                        <div className="mt-auto grid grid-cols-2 gap-4 pb-8 mb-8 border-b border-white/5">
                                            <div className="flex items-center gap-3 bg-white/2 p-3 rounded-2xl border border-white/5">
                                                <FaMapMarkerAlt className="text-orange shrink-0" />
                                                <span className="text-white text-xs font-bold truncate">{comp.location || "Piste BMX"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 bg-white/2 p-3 rounded-2xl border border-white/5">
                                                <FaUsers className="text-orange shrink-0" />
                                                <span className="text-white text-xs font-bold">{comp.maxPeople} pilotes</span>
                                            </div>
                                        </div>

                                        {(() => {
                                            if (registration) {
                                                if (registration.status === 'Confirmé') {
                                                    return (
                                                        <div className="w-full bg-green-500/10 border border-green-500/20 text-green-500 py-4 rounded-2xl font-black uppercase italic text-sm flex items-center justify-center gap-2">
                                                            <FaCheckCircle /> Inscription Confirmée
                                                        </div>
                                                    );
                                                } else if (registration.status === 'Annulé' || registration.status === 'Refusé') {
                                                    return (
                                                        <button 
                                                            onClick={() => handleOpenForm(comp)}
                                                            className="w-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-orange hover:text-black py-4 rounded-2xl font-black uppercase italic text-sm transition-all flex items-center justify-center gap-2"
                                                        >
                                                            <FaTimes /> Refusé - Re-soumettre
                                                        </button>
                                                    );
                                                } else {
                                                    return (
                                                        <div className="w-full bg-orange/10 border border-orange/20 text-orange py-4 rounded-2xl font-black uppercase italic text-sm flex items-center justify-center gap-2 animate-pulse">
                                                            <FaSpinner className="animate-spin" /> En attente
                                                        </div>
                                                    );
                                                }
                                            }
                                            return (
                                                <button 
                                                    onClick={() => handleOpenForm(comp)}
                                                    className="w-full group/btn relative bg-orange hover:bg-white text-white hover:text-black py-4 rounded-2xl font-black uppercase italic text-sm transition-all duration-500 shadow-xl shadow-orange/20 flex items-center justify-center gap-2 overflow-hidden"
                                                >
                                                    <div className="absolute inset-0 bg-linear-to-r from-orange to-red-500 opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                                    <span className="relative z-10 flex items-center gap-2">
                                                        <FaTrophy /> S'inscrire à la course
                                                    </span>
                                                </button>
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-[#0D111C] rounded-[3rem] border border-white/5 shadow-2xl">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <FaCalendarAlt className="text-gray-600 text-3xl" />
                        </div>
                        <h3 className="text-2xl font-black italic uppercase text-white mb-2">Aucune course prévue</h3>
                        <p className="text-gray-500">Le calendrier est en cours de finalisation. Revenez bientôt !</p>
                    </div>
                )}
            </div>

            {/* MODERN MULTI-STEP REGISTRATION MODAL */}
            {showForm && (
                <CompetitionRegistrationModal 
                    competition={showForm} 
                    user={user} 
                    userLicences={userLicences} 
                    onClose={() => setShowForm(null)} 
                    onSuccess={handleSuccess} 
                />
            )}
        </div>
    );
};

export default Competitions;
