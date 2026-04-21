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

    // 2. LOGIQUE DE DÉTERMINATION DE L'ÉTAPE ACTIVE (1 à 6)
    const status = currentLabel.toLowerCase();
    let activeStep = 1;

    if (status.includes('payé')) activeStep = 1;
    if (status.includes('attente de validation')) activeStep = 2;
    if (status.includes('validée') && !status.includes('attente')) activeStep = 3;
    if (status.includes('prépar')) activeStep = 4;
    if (status.includes('livraison') || status.includes('cours')) activeStep = 5;
    if (status.includes('livrée')) activeStep = 6;

    // 3. DÉFINITION DES 6 ÉTAPES
    const steps = [
        { id: 1, label: "Payées", icon: <FaCreditCard size={16} /> },
        { id: 2, label: "Validation", icon: <FaClock size={16} /> },
        { id: 3, label: "Validées", icon: <FaCheckCircle size={16} /> },
        { id: 4, label: "Préparation", icon: <FaBoxOpen size={16} /> },
        { id: 5, label: "Livraison", icon: <FaShippingFast size={16} /> },
        { id: 6, label: "Livrées", icon: <FaHome size={16} /> },
    ];

    // Calcul de la largeur de la barre (sur 6 étapes, il y a 5 intervalles de 20%)
    const progressWidth = `${((activeStep - 1) / (steps.length - 1)) * 100}%`;

    return (
        <div className="w-full mt-2 pt-2 pb-10 px-2">
            
            {/* AFFICHAGE DU STATUT ACTUEL EN GRAND */}
            <div className="mb-14 text-center">
                <p className="text-white_05 text-[10px] uppercase tracking-[0.2em] font-black mb-2 animate-pulse">
                    Statut de la commande
                </p>
                <h3 className="text-2xl sm:text-4xl font-bold text-orange">
                    {currentLabel}
                </h3>
            </div>

            {/* LA BARRE DE PROGRESSION À 6 ÉTAPES */}
            <div className="relative flex items-center justify-between w-full mt-4">
                
                {/* Ligne de fond (Grise) */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-slate-grey_06 rounded-full z-0"></div>
                
                {/* Ligne de progression (Orange) */}
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 bg-orange rounded-full transition-all duration-1000 ease-in-out z-0 shadow-[0_0_10px_rgba(242,140,51,0.5)]"
                    style={{ width: progressWidth }}
                ></div>

                {steps.map((step) => {
                    const isCompleted = activeStep >= step.id;
                    const isCurrent = activeStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            {/* Le Cercle */}
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                ${isCompleted 
                                    ? 'bg-orange border-nigth-blue text-black shadow-[0_0_20px_rgba(242,140,51,0.4)] scale-110' 
                                    : 'bg-dark-nigth-blue border-slate-grey_06 text-white_05'}`}
                            >
                                {step.icon}
                            </div>
                            
                            {/* Le Label sous le cercle */}
                            <span className={`mt-4 text-[9px] sm:text-[10px] uppercase tracking-tighter sm:tracking-widest font-black absolute top-10 sm:top-12 whitespace-nowrap transition-colors duration-300
                                ${isCurrent ? 'text-orange' : isCompleted ? 'text-white' : 'text-white_05'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DeliveryTracker;