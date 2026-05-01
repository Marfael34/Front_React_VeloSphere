import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaTrophy, FaCheckCircle, FaSpinner, FaTimes, FaIdCard, FaBuilding, FaLayerGroup } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Competitions = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [competitions, setCompetitions] = useState([]);
    const [userRegistrations, setUserRegistrations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(null); // ID de la compé en cours d'inscription
    const [showForm, setShowForm] = useState(null); // Objet compétition pour laquelle on montre le formulaire
    const [error, setError] = useState(null);

    // Champs du formulaire
    const [formData, setFormData] = useState({
        category: '',
        club: '',
        plateNumber: ''
    });

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_ROOT}/api/competitions`);
            const data = response.data['hydra:member'] || response.data.member || response.data;
            setCompetitions(data);

            if (user) {
                const regResponse = await axios.get(`${API_ROOT}/api/competition_registrations?user=/api/users/${user.id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const regData = regResponse.data['hydra:member'] || regResponse.data.member || [];
                setUserRegistrations(regData.map(r => r.competition));
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

    const handleOpenForm = (comp) => {
        if (!user) {
            navigate('/login');
            return;
        }
        setShowForm(comp);
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!showForm) return;

        setIsRegistering(showForm.id);
        try {
            await axios.post(`${API_ROOT}/api/competition_registrations`, {
                user: `/api/users/${user.id}`,
                competition: `/api/competitions/${showForm.id}`,
                category: formData.category,
                club: formData.club,
                plateNumber: formData.plateNumber
            }, {
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/ld+json'
                }
            });
            
            await fetchData();
            setShowForm(null);
            setFormData({ category: '', club: '', plateNumber: '' });
            alert("Inscription réussie !");
        } catch (err) {
            console.error("Erreur lors de l'inscription:", err);
            alert("Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsRegistering(null);
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('fr-FR', options);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue">
                <ButtonLoader size={60} />
            </div>
        );
    }

    return (
        <div className="bg-dark-nigth-blue min-h-screen py-16 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center">
                    <h1 className="title-h1 flex items-center justify-center gap-4">
                        <FaTrophy className="text-orange" /> Compétitions <span className="text-orange">BMX</span>
                    </h1>
                    <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                        Découvrez les prochains événements et compétitions de BMX. Rejoignez la communauté et relevez le défi !
                    </p>
                </div>

                {error ? (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl text-center">
                        {error}
                    </div>
                ) : competitions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {competitions.map((comp) => {
                            const isAlreadyRegistered = userRegistrations.includes(`/api/competitions/${comp.id}`);
                            
                            return (
                                <div key={comp.id} className="bg-black/40 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden hover:border-orange/50 transition-all group flex flex-col">
                                    <div className="h-48 bg-orange/10 flex items-center justify-center relative overflow-hidden">
                                        {comp.path ? (
                                            <img 
                                                src={`${API_ROOT}${comp.path}`} 
                                                alt={comp.title} 
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <FaTrophy className="text-6xl text-orange opacity-20" />
                                        )}
                                        <div className="absolute top-4 right-4 bg-orange text-white px-3 py-1 rounded-full text-xs font-black uppercase italic shadow-lg">
                                            {isAlreadyRegistered ? "Inscrit" : "Ouvert"}
                                        </div>
                                    </div>
                                    
                                    <div className="p-6 flex-1 flex flex-col">
                                        <h2 className="text-2xl font-black italic uppercase text-white mb-3 tracking-tighter group-hover:text-orange transition-colors">
                                            {comp.title}
                                        </h2>
                                        
                                        <p className="text-gray-400 text-sm mb-6 line-clamp-3">
                                            {comp.description}
                                        </p>

                                        <div className="space-y-3 mt-auto border-t border-white/5 pt-6">
                                            <div className="flex items-center gap-3 text-sm">
                                                <FaCalendarAlt className="text-orange" />
                                                <span className="text-white font-medium">{formatDate(comp.startAt)}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <FaMapMarkerAlt className="text-orange" />
                                                <span className="text-white font-medium">{comp.location || "Lieu à confirmer"}</span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm">
                                                <FaUsers className="text-orange" />
                                                <span className="text-white font-medium">{comp.maxPeople} pilotes max.</span>
                                            </div>
                                        </div>

                                        {isAlreadyRegistered ? (
                                            <div className="w-full mt-8 bg-green-500/20 text-green-500 py-3 rounded-xl font-bold uppercase italic text-sm border border-green-500/30 flex items-center justify-center gap-2">
                                                <FaCheckCircle /> Inscription validée
                                            </div>
                                        ) : (
                                            <button 
                                                onClick={() => handleOpenForm(comp)}
                                                className="w-full mt-8 bg-white/5 hover:bg-orange text-white hover:text-black py-3 rounded-xl font-bold uppercase italic text-sm transition-all border border-white/10 hover:border-orange shadow-lg flex items-center justify-center gap-2"
                                            >
                                                <FaTrophy /> S'inscrire maintenant
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/10">
                        <p className="text-gray-500 italic">Aucune compétition n'est prévue pour le moment. Revenez bientôt !</p>
                    </div>
                )}
            </div>

            {/* MODAL DE FORMULAIRE D'INSCRIPTION */}
            {showForm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-lg bg-dark-nigth-blue rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/20">
                            <div>
                                <h3 className="text-xl font-black italic uppercase text-orange tracking-tighter">Inscription</h3>
                                <p className="text-gray-400 text-xs uppercase font-bold tracking-widest">{showForm.title}</p>
                            </div>
                            <button onClick={() => setShowForm(null)} className="text-gray-400 hover:text-white transition-colors">
                                <FaTimes size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleRegister} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest ml-1">Catégorie de course</label>
                                    <div className="relative">
                                        <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                        <select 
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange outline-none transition-all appearance-none"
                                        >
                                            <option value="" disabled className="bg-dark-nigth-blue">Sélectionnez votre catégorie</option>
                                            <option value="Cruiser" className="bg-dark-nigth-blue">Cruiser</option>
                                            <option value="Open" className="bg-dark-nigth-blue">Open</option>
                                            <option value="Championnat" className="bg-dark-nigth-blue">Championnat</option>
                                            <option value="Loisir" className="bg-dark-nigth-blue">Loisir</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest ml-1">Club actuel</label>
                                    <div className="relative">
                                        <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Ex: La Roue Libre"
                                            value={formData.club}
                                            onChange={(e) => setFormData({...formData, club: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-gray-500 text-[10px] font-black uppercase mb-1 tracking-widest ml-1">Numéro de plaque</label>
                                    <div className="relative">
                                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                        <input 
                                            type="text"
                                            required
                                            placeholder="Ex: 34B"
                                            value={formData.plateNumber}
                                            onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:border-orange outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit"
                                disabled={isRegistering}
                                className="w-full bg-orange text-white py-4 rounded-xl font-black uppercase italic tracking-tighter shadow-lg shadow-orange/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                            >
                                {isRegistering ? <FaSpinner className="animate-spin" /> : <FaTrophy />}
                                {isRegistering ? "Inscription en cours..." : "Confirmer mon inscription"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Competitions;
