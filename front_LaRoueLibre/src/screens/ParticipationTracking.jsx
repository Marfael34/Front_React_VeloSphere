import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ParticipationTracker from '../components/UI/Competition/ParticipationTracker';
import { API_ROOT } from '../constants/apiConstant';
import { FaArrowLeft, FaCalendarAlt, FaMapMarkerAlt, FaIdBadge, FaShieldAlt } from 'react-icons/fa';

const ParticipationTracking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Récupération sécurisée des données d'inscription
    const registration = location.state?.registration;

    if (!registration) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-[#050810] p-4">
                <div className="bg-[#0D111C] p-12 rounded-[3rem] border border-white/10 shadow-2xl text-center max-w-md w-full animate-slide-in">
                    <h2 className="text-2xl font-black italic uppercase text-white mb-6">Inscription introuvable</h2>
                    <button onClick={() => navigate('/profile')} className="w-full bg-linear-to-r from-orange to-red-500 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest transition-all hover:scale-105">
                        Retourner au profil
                    </button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Date à confirmer";
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) { return "Date invalide"; }
    };

    return (
        <div className="min-h-screen bg-[#050810] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">
                
                <button 
                    onClick={() => navigate('/profile')} 
                    className="group flex items-center text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-orange transition-all mb-12"
                >
                    <FaArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                    Retour à mon profil
                </button>

                <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">
                            Suivi de <span className="text-orange">Participation</span>
                        </h1>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-white/40">Dossier ID : <span className="text-white">#{registration.id || id}</span></span>
                            <span className="text-white/40">•</span>
                            <span className="text-white/40">Inscrit le : <span className="text-white">{formatDate(registration.createdAt)}</span></span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* COLONNE GAUCHE : TRACKER PRINCIPAL */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="bg-[#0D111C] shadow-2xl rounded-[3rem] border border-white/10 overflow-hidden">
                            <div className="p-8 sm:p-12">
                                <ParticipationTracker registration={registration} />
                            </div>
                        </div>

                        {/* DÉTAILS DE LA COMPÉTITION */}
                        <div className="bg-[#0D111C] p-8 sm:p-10 rounded-[3rem] border border-white/10 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 blur-[80px] -mr-32 -mt-32 rounded-full group-hover:bg-orange/10 transition-colors"></div>
                            
                            <h3 className="text-xl font-black italic uppercase text-white mb-8 flex items-center gap-3">
                                <FaCalendarAlt className="text-orange" /> Événement
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Compétition</p>
                                        <p className="text-2xl font-black italic uppercase text-white">{registration.competition?.title || "Nom de la course"}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-orange shrink-0">
                                            <FaMapMarkerAlt />
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40">Lieu</p>
                                            <p className="text-sm font-bold text-white">{registration.competition?.location || "Circuit BMX local"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-2">Période de l'événement</p>
                                        <div className="space-y-2">
                                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                                Début : {formatDate(registration.competition?.startAt || registration.competition?.start_at)}
                                            </p>
                                            <p className="text-sm font-bold text-white flex items-center gap-2">
                                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                                Fin : {formatDate(registration.competition?.endAt || registration.competition?.end_at)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-orange/10 border border-orange/20 rounded-2xl">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-orange mb-1">Rappel</p>
                                        <p className="text-[11px] font-medium text-white/80 leading-relaxed italic">
                                            Présentez-vous au contrôle administratif au moins 1h avant votre premier passage.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* COLONNE DROITE : INFOS ENGAGEMENT */}
                    <div className="space-y-8">
                        <div className="bg-[#0D111C] p-8 rounded-[3rem] border border-white/10">
                            <h3 className="text-lg font-black italic uppercase text-white mb-8 flex items-center gap-3">
                                <FaIdBadge className="text-orange" /> Engagement
                            </h3>
                            
                            <div className="space-y-6">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Pilote</p>
                                    <p className="text-lg font-black italic uppercase text-orange">{registration.firstName} {registration.lastName}</p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Catégorie</p>
                                        <p className="text-sm font-bold text-white">{registration.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Plaque</p>
                                        <p className="text-sm font-black italic text-orange">{registration.plateNumber}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-white/5">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Club</p>
                                    <p className="text-sm font-bold text-white">{registration.club}</p>
                                </div>

                                {registration.licence && (
                                    <div className="pt-6 border-t border-white/5">
                                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Permis utilisé</p>
                                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
                                            <div className="w-8 h-8 bg-orange/20 rounded-lg flex items-center justify-center text-orange text-xs">
                                                <FaIdBadge />
                                            </div>
                                            <span className="text-xs font-bold text-white">Licence #{registration.licence.id || registration.licence.split('/').pop()}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-red-500/5 p-8 rounded-[3rem] border border-red-500/10">
                            <h3 className="text-sm font-black italic uppercase text-red-500 mb-6 flex items-center gap-2">
                                <FaShieldAlt /> Sécurité
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-red-500/60 mb-1">Contact d'urgence</p>
                                    <p className="text-sm font-bold text-white">{registration.emergencyContactName}</p>
                                    <p className="text-xs font-medium text-white/60 mt-1">{registration.emergencyContactPhone}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParticipationTracking;
