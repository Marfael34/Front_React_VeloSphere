// src/screens/Checkout.jsx
import React, { useState, useEffect, useContext } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import CheckoutForm from "../components/Market/CheckoutForm";
import { AuthContext } from "../contexts/AuthContext";
import { API_ROOT } from "../constants/apiConstant";
import axios from "axios";
import ButtonLoader from "../components/Loader/ButtonLoader";
import { useNavigate, useLocation } from "react-router-dom";
// Ajout d'icônes pour rassurer l'utilisateur
import { FaLock, FaShieldAlt } from "react-icons/fa"; 

// Ta vraie clé publique Stripe
const stripePromise = loadStripe("pk_test_51TLQCEGyXLZ1k1lnmyigtun4AQIvMKhL3hj86EjlvDvTHzUw4iLm7upHNkiAafJ48v0viIyTn2eag9Nbr2PhDRG700Od83tAKg");

const Checkout = () => {
    const [clientSecret, setClientSecret] = useState("");
    const { user } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const licenceId = location.state?.licenceId;
    const type = location.state?.type;

    useEffect(() => {
        if (!user || !user.token) {
            navigate("/login");
            return;
        }

        const endpoint = type === 'licence' && licenceId 
            ? `${API_ROOT}/api/create-licence-payment-intent/${licenceId}`
            : `${API_ROOT}/api/create-payment-intent`;

        // On appelle Symfony pour générer l'intention de paiement
        axios.post(endpoint, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
        })
        .then((res) => {
            setClientSecret(res.data.clientSecret);
            setIsLoading(false);
        })
        .catch((err) => {
            console.error("Erreur Stripe:", err);
            setIsLoading(false);
        });
    }, [user, navigate, licenceId, type]);

    // Personnalisation poussée des inputs Stripe pour matcher ton CSS Tailwind
    const appearance = {
        theme: 'night', 
        variables: {
            colorPrimary: '#f28c33', // Ton orange
            colorBackground: '#132136', // Légèrement plus clair que bg-dark-nigth-blue pour ressortir
            colorText: '#ffffff',
            colorDanger: '#ef4444', // red-500 Tailwind
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            borderRadius: '12px', // Bords arrondis modernes
            spacingGridRow: '20px'
        },
        rules: {
            '.Input': {
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: 'none',
                backgroundColor: 'rgba(0, 0, 0, 0.2)',
                padding: '12px 16px',
            },
            '.Input:focus': {
                border: '1px solid #f28c33', // Focus en orange
                boxShadow: '0 0 0 1px #f28c33',
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-dark-nigth-blue space-y-4">
                <ButtonLoader size={60} />
                <p className="text-slate-grey_06 animate-pulse font-medium">Connexion sécurisée en cours...</p>
            </div>
        );
    }

    return (
        <div className="bg-dark-nigth-blue min-h-[calc(100vh-4rem)] text-white flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
            
            {/* Effet de lumière subtil en arrière-plan (Glow effect) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-lg z-10 animate-slideup">
                
                {/* En-tête de la page */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-orange/20 to-orange/5 border border-orange/20 text-orange mb-6 shadow-lg shadow-orange/10">
                        <FaShieldAlt size={36} />
                    </div>
                    <h1 className="title-h1 mb-3">Paiement Sécurisé</h1>
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2 font-medium">
                        <FaLock className="text-orange/70" /> 
                        Vos informations sont chiffrées de bout en bout
                    </p>
                </div>
            
                {/* Carte contenant le formulaire */}
                <div className="bg-black/50 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {clientSecret ? (
                        <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                            <CheckoutForm />
                        </Elements>
                    ) : (
                        <div className="text-center py-8">
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-8">
                                <p className="font-semibold">Une erreur est survenue.</p>
                                <p className="text-sm mt-1 opacity-80">Impossible de joindre le serveur de paiement.</p>
                            </div>
                            <button onClick={() => navigate('/panier')} className="main-button">
                                Retour au panier
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer de réassurance */}
                <div className="mt-8 text-center flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
                    <span>Propulsé par</span>
                    <span className="font-bold text-gray-400 text-base tracking-wider">stripe</span>
                </div>

            </div>
        </div>
    );
};

export default Checkout;