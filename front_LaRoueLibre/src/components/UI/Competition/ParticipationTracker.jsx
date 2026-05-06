import React from 'react';
import { FaCheckCircle, FaClock, FaIdCard, FaTrophy, FaFlagCheckered, FaExclamationTriangle } from 'react-icons/fa';

const ParticipationTracker = ({ registration }) => {
    // 1. RÉCUPÉRATION DE L'ÉTAT ET CALCUL DYNAMIQUE
    const now = new Date();
    const competition = registration?.competition;
    const startDate = (competition?.startAt || competition?.start_at) ? new Date(competition.startAt || competition.start_at) : null;
    const endDate = (competition?.endAt || competition?.end_at) ? new Date(competition.endAt || competition.end_at) : null;

    let currentLabel = registration?.status || "En attente";
    let status = currentLabel.toLowerCase();
    let activeStep = 1;
    let isRefused = status.includes('refusé') || status.includes('rejeté');

    // Priorité à l'état réel de la DB
    if (status.includes('en attente')) activeStep = 1;
    else if (status.includes('vérification')) activeStep = 2;
    else if (status.includes('confirmé') || status.includes('validé')) {
        activeStep = 3;
        
        // Calcul dynamique si la date est atteinte
        if (startDate && now >= startDate) {
            if (endDate && now >= endDate) {
                activeStep = 5;
                currentLabel = "Terminé";
            } else {
                activeStep = 4;
                currentLabel = "En Course";
            }
        }
    }
    else if (status.includes('en course')) activeStep = 4;
    else if (status.includes('terminé')) activeStep = 5;

    // 3. DÉFINITION DES ÉTAPES
    const steps = [
        { id: 1, label: "Dossier Déposé", icon: <FaClock size={14} /> },
        { id: 2, label: "Vérification", icon: <FaIdCard size={14} /> },
        { id: 3, label: "Confirmé", icon: <FaCheckCircle size={14} /> },
        { id: 4, label: "En Course", icon: <FaTrophy size={14} /> },
        { id: 5, label: "Terminé", icon: <FaFlagCheckered size={14} /> },
    ];

    // Calcul de la largeur de la barre
    const progressWidth = activeStep > 0 && !isRefused
        ? `${((activeStep - 1) / (steps.length - 1)) * 100}%`
        : "0%";

    return (
        <div className="w-full mt-2 pt-2 pb-10 px-2">

            {/* AFFICHAGE DU STATUT ACTUEL */}
            <div className="mb-14 text-center">
                <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-black mb-2 animate-pulse">
                    Suivi de votre participation
                </p>
                <h3 className={`text-2xl sm:text-4xl font-bold uppercase italic tracking-tight ${isRefused ? 'text-red-500' : 'text-orange'}`}>
                    {currentLabel}
                </h3>
                
                {isRefused && (
                    <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-black uppercase italic">
                        <FaExclamationTriangle className="animate-pulse" />
                        Votre inscription a été refusée. Veuillez contacter le club.
                    </div>
                )}

                {status.includes('en attente') && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-[10px] font-black uppercase tracking-widest animate-bounce">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange animate-ping"></span>
                        Analyse du dossier
                    </div>
                )}
            </div>

            {/* BARRE DE PROGRESSION */}
            {!isRefused ? (
                <div className="relative flex items-center justify-between w-full mt-4">
                    {/* Ligne de fond */}
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-white/5 rounded-full z-0"></div>

                    {/* Ligne de progression */}
                    <div
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 rounded-full transition-all duration-1000 ease-in-out z-0 shadow-[0_0_15px_rgba(255,102,0,0.5)] bg-linear-to-r from-orange to-red-500"
                        style={{ width: progressWidth }}
                    ></div>

                    {steps.map((step) => {
                        const isCompleted = activeStep >= step.id;
                        const isCurrent = activeStep === step.id;

                        return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center">
                                {/* Le Cercle */}
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 rotate-45
                                    ${isCompleted
                                        ? 'bg-orange border-white/20 text-black shadow-[0_0_25px_rgba(255,102,0,0.3)] scale-110'
                                        : 'bg-[#0D111C] border-white/5 text-white/20'}`}
                                >
                                    <div className="-rotate-45">
                                        {step.icon}
                                    </div>
                                </div>

                                {/* Le Label */}
                                <span className={`mt-6 text-[8px] sm:text-[10px] uppercase italic font-black absolute top-12 sm:top-14 whitespace-nowrap transition-colors duration-300 tracking-widest
                                    ${isCurrent ? 'text-orange' : isCompleted ? 'text-white' : 'text-white/20'}`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="h-2 w-full bg-red-500/20 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 w-full animate-pulse"></div>
                </div>
            )}
        </div>
    );
};

export default ParticipationTracker;
