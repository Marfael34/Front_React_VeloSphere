import React from 'react';
import { FaCheckCircle, FaBoxOpen, FaShippingFast, FaHome } from 'react-icons/fa';

const DeliveryTracker = ({ statusLabel }) => {
    // Normalisation du texte du statut pour être sûr de le capter
    const status = (statusLabel || '').toLowerCase();
    
    // Détermination de l'étape active (1 à 4)
    // Par défaut, si c'est "Payées", c'est l'étape 1.
    let activeStep = 0;
    if (status.includes('payé') || status.includes('validé')) activeStep = 1;
    if (status.includes('prépar') || status.includes('cours')) activeStep = 2;
    if (status.includes('expédié') || status.includes('transit')) activeStep = 3;
    if (status.includes('livré')) activeStep = 4;

    const steps = [
        { id: 1, label: "Validée", icon: <FaCheckCircle size={18} /> },
        { id: 2, label: "Préparation", icon: <FaBoxOpen size={18} /> },
        { id: 3, label: "Expédiée", icon: <FaShippingFast size={18} /> },
        { id: 4, label: "Livrée", icon: <FaHome size={18} /> },
    ];

    // Sécurité au cas où le statut est inconnu
    if (activeStep === 0) return <span className="text-gray-500 italic text-sm">Statut de livraison inconnu</span>;

    // Calcul de la largeur de la barre de progression (en pourcentage)
    const progressWidth = `${((activeStep - 1) / (steps.length - 1)) * 100}%`;

    return (
        <div className="w-full mt-4 pt-2 pb-6 px-2">
            <div className="relative flex items-center justify-between w-full">
                
                {/* Ligne de fond (grise) */}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1.5 bg-gray-700 rounded-full z-0"></div>
                
                {/* Ligne de progression animée (orange) */}
                <div 
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1.5 bg-orange rounded-full transition-all duration-700 ease-out z-0"
                    style={{ width: progressWidth }}
                ></div>

                {/* Les cercles d'étapes */}
                {steps.map((step) => {
                    const isCompleted = activeStep >= step.id;
                    const isCurrent = activeStep === step.id;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                ${isCompleted 
                                    ? 'bg-orange border-nigth-blue text-black shadow-[0_0_15px_rgba(242,140,51,0.4)] scale-110' 
                                    : 'bg-gray-800 border-gray-700 text-gray-500'}`}
                            >
                                {step.icon}
                            </div>
                            
                            <span className={`mt-2 text-[11px] uppercase tracking-wider font-bold absolute top-10 whitespace-nowrap transition-colors duration-300
                                ${isCurrent ? 'text-orange' : isCompleted ? 'text-white' : 'text-gray-500'}`}>
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