// src/components/Market/CheckoutForm.jsx
import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import ButtonLoader from '../Loader/ButtonLoader';

export default function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Redirection vers le profil après le paiement
                return_url: `${window.location.origin}/profile`, 
            },
        });

        if (error) {
            setMessage(error.message);
        }

        setIsProcessing(false);
    };

    return (
        <form onSubmit={handleSubmit}>
            <PaymentElement />
            
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
            
            {message && <div className="text-red-400 mt-4 text-center bg-red-500/10 p-3 rounded-lg border border-red-500/30">{message}</div>}
        </form>
    );
}