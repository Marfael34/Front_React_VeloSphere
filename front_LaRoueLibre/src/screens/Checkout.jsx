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
import CustomInput from "../components/UI/CustomInput";
import AddressAutocomplete from "../components/UI/AddressAutocomplete";
import { FaLock, FaShieldAlt, FaMapMarkerAlt, FaCreditCard } from "react-icons/fa"; 

// Ta vraie clé publique Stripe
const stripePromise = loadStripe("pk_test_51TLQCEGyXLZ1k1lnmyigtun4AQIvMKhL3hj86EjlvDvTHzUw4iLm7upHNkiAafJ48v0viIyTn2eag9Nbr2PhDRG700Od83tAKg");

const Checkout = () => {
    const [clientSecret, setClientSecret] = useState("");
    const { user, setUser } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [isSavingAddress, setIsSavingAddress] = useState(false);
    const [step, setStep] = useState(1); // 1: Adresse, 2: Paiement
    
    // States pour l'adresse
    const [number, setNumber] = useState("");
    const [typeVoie, setTypeVoie] = useState("");
    const [label, setLabel] = useState("");
    const [complement, setComplement] = useState("");
    const [city, setCity] = useState("");
    const [cp, setCp] = useState("");

    const licenceId = location.state?.licenceId;
    const type = location.state?.type;

    useEffect(() => {
        if (!user || !user.token) {
            navigate("/login");
            return;
        }

        // Pré-remplir l'adresse si elle existe déjà dans le profil (optionnel mais sympa)
        if (user.adresses && user.adresses.length > 0) {
            const addr = user.adresses[0];
            setNumber(addr.number || "");
            setTypeVoie(addr.type || "");
            setLabel(addr.label || "");
            setComplement(addr.complement || "");
            setCity(addr.city || "");
            setCp(addr.cp?.toString() || "");
        }

        setIsLoading(false);
    }, [user, navigate]);

    const handleAddressSubmit = async (e) => {
        e.preventDefault();
        setIsSavingAddress(true);

        try {
            // 1. Création de l'adresse d'abord (plus robuste que le PATCH imbriqué)
            const addressData = {
                number: number,
                type: typeVoie,
                label: label,
                complement: complement.trim() === "" ? null : complement,
                city: city,
                cp: cp ? parseInt(cp) : 0
            };

            const addrRes = await axios.post(`${API_ROOT}/api/adresses`, addressData, {
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/ld+json',
                    'Accept': 'application/ld+json'
                }
            });

            const addressIRI = addrRes.data['@id'] || `/api/adresses/${addrRes.data.id}`;

            // 2. On lie l'adresse à l'utilisateur
            const patchRes = await axios.patch(`${API_ROOT}/api/users/${user.id}`, {
                adresses: [addressIRI] // On envoie l'IRI
            }, {
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/merge-patch+json'
                }
            });

            // Mettre à jour l'utilisateur dans le contexte
            setUser({
                ...user,
                adresses: patchRes.data.adresses
            });

            // 3. On génère l'intention de paiement
            const endpoint = type === 'licence' && licenceId 
                ? `${API_ROOT}/api/create-licence-payment-intent/${licenceId}`
                : `${API_ROOT}/api/create-payment-intent`;

            const res = await axios.post(endpoint, {}, {
                headers: { Authorization: `Bearer ${user.token}` }
            });

            setClientSecret(res.data.clientSecret);
            setStep(2); 
        } catch (err) {
            console.error("Erreur détaillée:", err.response?.data || err.message);
            const serverMsg = err.response?.data?.detail || err.response?.data?.error || err.message;
            alert(`Une erreur est survenue : ${serverMsg}`);
        } finally {
            setIsSavingAddress(false);
        }
    };

    const appearance = {
        theme: 'night', 
        variables: {
            colorPrimary: '#f28c33',
            colorBackground: '#132136',
            colorText: '#ffffff',
            colorDanger: '#ef4444',
            fontFamily: 'ui-sans-serif, system-ui, sans-serif',
            borderRadius: '12px',
            spacingGridRow: '20px'
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-dark-nigth-blue space-y-4">
                <ButtonLoader size={60} />
                <p className="text-slate-grey_06 animate-pulse font-medium">Initialisation...</p>
            </div>
        );
    }

    return (
        <div className="bg-dark-nigth-blue min-h-[calc(100vh-4rem)] text-white flex flex-col items-center justify-center py-12 px-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-orange/5 blur-[120px] rounded-full pointer-events-none"></div>

            <div className="w-full max-w-lg z-10 animate-slideup">
                
                {/* En-tête de la page */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-orange/20 to-orange/5 border border-orange/20 text-orange mb-6 shadow-lg shadow-orange/10">
                        {step === 1 ? <FaMapMarkerAlt size={36} /> : <FaCreditCard size={36} />}
                    </div>
                    <h1 className="title-h1 mb-3">
                        {step === 1 ? "Adresse de facturation" : "Paiement Sécurisé"}
                    </h1>
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2 font-medium">
                        <FaShieldAlt className="text-orange/70" /> 
                        {step === 1 ? "Étape 1 sur 2 : Vos coordonnées" : "Étape 2 sur 2 : Informations de paiement"}
                    </p>
                </div>
            
                {/* Carte contenant le formulaire */}
                <div className="bg-black/50 backdrop-blur-2xl border border-white/10 p-8 sm:p-10 rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                    {step === 1 ? (
                        <form onSubmit={handleAddressSubmit} className="space-y-6">
                            <AddressAutocomplete onAddressSelect={(addr) => {
                                setNumber(addr.number);
                                setTypeVoie(addr.type);
                                setLabel(addr.label);
                                setCity(addr.city);
                                setCp(addr.cp);
                            }} />

                            <div className="pt-4 border-t border-white/5">
                                <p className="text-xs text-gray-500 mb-4 italic">Vérifiez ou complétez vos informations :</p>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-24">
                                            <CustomInput
                                                label="N°"
                                                type="text"
                                                placeholder="12"
                                                state={number}
                                                callable={(e) => setNumber(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <CustomInput
                                                label="Type de voie"
                                                type="text"
                                                placeholder="Rue, Avenue..."
                                                state={typeVoie}
                                                callable={(e) => setTypeVoie(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <CustomInput
                                        label="Nom de la voie"
                                        type="text"
                                        placeholder="de la Paix"
                                        state={label}
                                        callable={(e) => setLabel(e.target.value)}
                                        required
                                    />
                                    <CustomInput
                                        label="Complément"
                                        type="text"
                                        placeholder="Appartement, Bâtiment..."
                                        state={complement}
                                        callable={(e) => setComplement(e.target.value)}
                                    />
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <CustomInput
                                                label="Ville"
                                                type="text"
                                                placeholder="Paris"
                                                state={city}
                                                callable={(e) => setCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="w-32">
                                            <CustomInput
                                                label="Code Postal"
                                                type="text"
                                                placeholder="75000"
                                                state={cp}
                                                callable={(e) => setCp(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                className="main-button w-full mt-2"
                                disabled={isSavingAddress}
                            >
                                {isSavingAddress ? <ButtonLoader size={20} /> : "Continuer vers le paiement"}
                            </button>
                        </form>
                    ) : (
                        clientSecret ? (
                            <Elements options={{ clientSecret, appearance }} stripe={stripePromise}>
                                <CheckoutForm />
                            </Elements>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-red-400">Erreur lors de l'initialisation du paiement.</p>
                                <button onClick={() => setStep(1)} className="main-button mt-4">Retour</button>
                            </div>
                        )
                    )}
                </div>

                {/* Footer de réassurance */}
                <div className="mt-8 text-center flex items-center justify-center gap-4 text-xs text-gray-500 font-medium">
                    <FaLock /> Paiement crypté SSL
                </div>

            </div>
        </div>
    );
};

export default Checkout;