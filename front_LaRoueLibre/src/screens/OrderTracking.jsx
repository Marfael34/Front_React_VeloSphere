import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DeliveryTracker from '../components/UI/Order/DeliveryTracker';
import { API_ROOT } from '../constants/apiConstant';

const OrderTracking = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { id } = useParams();

    // Récupération sécurisée
    const order = location.state?.order;

    // Si on a perdu la commande (ex: rafraîchissement)
    if (!order) {
        return (
            <div className="min-h-[80vh] flex flex-col items-center justify-center bg-dark-nigth-blue p-4">
                <div className="bg-nigth-blue p-8 rounded-2xl shadow-lg border border-slate-grey_06 text-center max-w-md w-full animate-slideup">
                    <h2 className="text-2xl font-bold text-white mb-4">Commande introuvable</h2>
                    <button onClick={() => navigate('/profile')} className="main-button">
                        Retourner au profil
                    </button>
                </div>
            </div>
        );
    }

    // FONCTION SÉCURISÉE POUR LA DATE (C'est souvent ça qui fait crasher un écran blanc !)
    const getSafeDate = () => {
        const dateString = order.created_at || order.createdAt;
        if (!dateString) return "Date inconnue";
        try {
            const dateObj = new Date(dateString);
            if (isNaN(dateObj.getTime())) return "Date invalide";
            return dateObj.toLocaleDateString('fr-FR');
        } catch (e) {
            return "Erreur de date";
        }
    };

    return (
        <div className="min-h-screen bg-dark-nigth-blue py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto animate-slideup">
                
                <button 
                    onClick={() => navigate('/profile')} 
                    className="group flex items-center text-sm font-medium text-white_05 hover:text-orange transition-colors duration-300 mb-8"
                >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Retour à mes commandes
                </button>

                <div className="mb-8">
                    <h1 className="title-h1 !mb-2">Suivi de commande</h1>
                    <p className="text-sm text-white_05">
                        ID : <span className="text-orange font-bold">#{order.id || id || "?"}</span> • 
                        Date : <span className="text-white">{getSafeDate()}</span>
                    </p>
                </div>

                <div className="bg-nigth-blue shadow-2xl rounded-2xl border border-slate-grey_06 overflow-hidden">
                    <div className="p-8 sm:p-12">
                        {/* Appel du tracker ultra sécurisé */}
                        <DeliveryTracker order={order} />
                    </div>
                    
                    {order.path && (
                        <div className="bg-black/20 px-6 py-4 border-t border-slate-grey_06 flex justify-end">
                            <a 
                                href={`${API_ROOT}${order.path}`}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-sm font-bold text-orange hover:text-white transition-colors"
                            >
                                Télécharger la facture PDF
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderTracking;