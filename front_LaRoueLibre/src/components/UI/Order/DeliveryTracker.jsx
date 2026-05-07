import React from 'react';
import { FaCheckCircle, FaBoxOpen, FaShippingFast, FaHome, FaClock, FaCreditCard } from 'react-icons/fa';

const DeliveryTracker = ({ order }) => {
    // 1. SÉCURISATION ET RÉCUPÉRATION DE L'ÉTAT
    let currentLabel = "Payées";

    if (order && Array.isArray(order.etats) && order.etats.length > 0) {
        // On prend le dernier état ajouté (le plus récent)
        const lastEtat = order.etats[order.etats.length - 1];
        currentLabel = (typeof lastEtat === 'object' ? lastEtat?.label : lastEtat) || "Payées";
    }

    // 2. LOGIQUE DE DÉTERMINATION DE L'ÉTAPE ACTIVE (1 à 7)
    const status = currentLabel.toLowerCase();
    let activeStep = 1;

    if (status.includes('attentes de paiement')) activeStep = 1;
    else if (status.includes('payé')) activeStep = 2;
    else if (status.includes('attente de validation')) activeStep = 3;
    else if (status.includes('validé')) activeStep = 4;
    else if (status.includes('préparation')) activeStep = 5;
    else if (status.includes('livraison')) activeStep = 6;
    else if (status.includes('livrée')) activeStep = 7;
    else if (status.includes('annulé')) activeStep = 0;

    // 3. DÉFINITION DES 7 ÉTAPES
    const steps = [
        { id: 1, label: "En attente de paiement", icon: <FaCreditCard size={14} /> },
        { id: 2, label: "Payées", icon: <FaCheckCircle size={14} /> },
        { id: 3, label: "En attente de validation", icon: <FaClock size={14} /> },
        { id: 4, label: "Validées", icon: <FaCheckCircle size={14} /> },
        { id: 5, label: "En préparation", icon: <FaBoxOpen size={14} /> },
        { id: 6, label: "En cours de livraison", icon: <FaShippingFast size={14} /> },
        { id: 7, label: "Livrées", icon: <FaHome size={14} /> },
    ];

    // Calcul de la largeur de la barre
    const progressWidth = activeStep > 0
        ? `${((activeStep - 1) / (steps.length - 1)) * 100}%`
        : "0%";

    return (
        <div className="w-full mt-2 pt-2 pb-10 px-2 sm:px-6">

            {/* AFFICHAGE DU STATUT ACTUEL EN GRAND */}
            <div className="mb-14 text-center">
                <p className="text-white_05 text-[10px] uppercase tracking-[0.2em] font-black mb-2 animate-pulse">
                    Statut de la commande
                </p>
                <h3 className={`text-2xl sm:text-4xl font-bold ${status.includes('annulé') ? 'text-red-500' : 'text-orange'}`}>
                    {currentLabel}
                </h3>
                {status.includes('en attente de validation') && (
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange/10 border border-orange/20 text-orange text-[10px] font-black uppercase tracking-widest animate-bounce">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange animate-ping"></span>
                        Traitement en cours
                    </div>
                )}
            </div>

            {/* VERSION DESKTOP : BARRE HORIZONTALE (cachée sur mobile) */}
            <div className="hidden sm:flex relative items-center justify-between w-full mt-4">
                {/* Ligne de fond (Grise) */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-slate-grey_06 rounded-full z-0"></div>

                {/* Ligne de progression (Orange ou Rouge) */}
                <div
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 rounded-full transition-all duration-1000 ease-in-out z-0 shadow-[0_0_10px_rgba(242,140,51,0.5)]
                        ${status.includes('annulé') ? 'bg-red-500 shadow-red-500/50' : 'bg-orange'}`}
                    style={{ width: progressWidth }}
                ></div>

                {steps.map((step) => {
                    const isCompleted = activeStep >= step.id;
                    const isCurrent = activeStep === step.id;
                    const isAnnule = status.includes('annulé');

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-11 h-11 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                ${isCompleted
                                    ? (isAnnule ? 'bg-red-500 border-nigth-blue text-white' : 'bg-orange border-nigth-blue text-black shadow-[0_0_20px_rgba(242,140,51,0.4)] scale-110')
                                    : 'bg-dark-nigth-blue border-slate-grey_06 text-white_05'}`}
                            >
                                {step.icon}
                            </div>
                            <span className={`mt-4 text-[9px] uppercase font-black absolute top-11 whitespace-nowrap transition-colors duration-300
                                ${isCurrent ? (isAnnule ? 'text-red-500' : 'text-orange') : isCompleted ? 'text-white' : 'text-white_05'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* VERSION MOBILE : LISTE VERTICALE (cachée sur desktop) */}
            <div className="sm:hidden flex flex-col space-y-8 relative">
                {/* Ligne verticale de fond */}
                <div className="absolute left-[18px] top-4 bottom-4 w-1 bg-slate-grey_06 rounded-full"></div>
                
                {/* Ligne verticale de progression */}
                <div 
                    className={`absolute left-[18px] top-4 w-1 rounded-full transition-all duration-1000 ease-in-out
                        ${status.includes('annulé') ? 'bg-red-500' : 'bg-orange'}`}
                    style={{ 
                        height: activeStep > 0 
                            ? `${((activeStep - 1) / (steps.length - 1)) * 100}%` 
                            : "0%" 
                    }}
                ></div>

                {steps.map((step) => {
                    const isCompleted = activeStep >= step.id;
                    const isCurrent = activeStep === step.id;
                    const isAnnule = status.includes('annulé');

                    return (
                        <div key={step.id} className="relative z-10 flex items-center gap-4">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center border-4 transition-all duration-500 shrink-0
                                ${isCompleted
                                    ? (isAnnule ? 'bg-red-500 border-nigth-blue text-white' : 'bg-orange border-nigth-blue text-black shadow-[0_0_10px_rgba(242,140,51,0.3)]')
                                    : 'bg-dark-nigth-blue border-slate-grey_06 text-white_05'}`}
                            >
                                {step.icon}
                            </div>
                            <div className="flex flex-col">
                                <span className={`text-[10px] uppercase font-black tracking-widest
                                    ${isCurrent ? (isAnnule ? 'text-red-500' : 'text-orange') : isCompleted ? 'text-white' : 'text-white_05'}`}>
                                    {step.label}
                                </span>
                                {isCurrent && (
                                    <span className="text-[8px] text-white_05 font-medium mt-0.5">Étape actuelle</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliveryTracker;