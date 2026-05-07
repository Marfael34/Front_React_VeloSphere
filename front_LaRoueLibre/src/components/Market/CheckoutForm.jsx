import React, { useState, useContext } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import ButtonLoader from '../Loader/ButtonLoader';
import { AuthContext } from '../../contexts/AuthContext';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const { user } = useContext(AuthContext);

    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isStripeLoaded, setIsStripeLoaded] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const result = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redirection vers le profil après le paiement
                return_url: `${window.location.origin}/profile`, 
                payment_method_data: {
                    billing_details: {
                        name: user ? `${user.firstname} ${user.lastname}` : 'Client',
                        email: user?.email || '',
                        address: user?.adresses?.[0] ? {
                            line1: `${user.adresses[0].number} ${user.adresses[0].type} ${user.adresses[0].label}`,
                            line2: user.adresses[0].complement || '',
                            city: user.adresses[0].city,
                            postal_code: user.adresses[0].cp?.toString(),
                            country: 'FR'
                        } : undefined
                    }
                }
            },
        });

        if (result.error) {
            console.error("Erreur de paiement Stripe:", result.error);
            setMessage(result.error.message);
            setIsProcessing(false);
        } else {
            // Normalement Stripe redirige ici, mais au cas où...
            console.log("Paiement réussi, redirection en cours...");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="relative">
            {(!stripe || !elements || !isStripeLoaded) && (
                <div className="flex flex-col items-center justify-center py-12 animate-pulse">
                    <ButtonLoader size={40} />
                    <p className="text-gray-400 mt-4 text-xs font-medium uppercase tracking-widest">Chargement de la plateforme de paiement...</p>
                </div>
            )}

            <div className={!isStripeLoaded ? 'hidden' : 'block animate-slideup'}>
                <PaymentElement 
                    onReady={() => setIsStripeLoaded(true)} 
                />
                
                <button 
                    disabled={isProcessing || !stripe || !elements} 
                    className="main-button mt-8"
                >
                    {isProcessing ? (
                        <div className="flex justify-center"><ButtonLoader size={25} /></div>
                    ) : (
                        "Confirmer le paiement"
                    )}
                </button>
            </div>
            
            {message && <div className="text-red-400 mt-4 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/30">{message}</div>}
        </form>
    );
}