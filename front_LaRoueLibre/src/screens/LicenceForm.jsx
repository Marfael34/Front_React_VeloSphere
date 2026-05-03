import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaIdCard, FaFileMedical, FaPhoneAlt, FaGlobe, FaCheckCircle } from 'react-icons/fa';
import CustomInput from '../components/UI/CustomInput';

import SignaturePad from '../components/UI/SignaturePad';

const LicenceForm = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [prices, setPrices] = useState([]);
    const [etats, setEtats] = useState([]);
    const [existingLicence, setExistingLicence] = useState(null);
    const [formData, setFormData] = useState({
        nationaly: '',
        country_resid: '',
        phone: '',
        priceLicence: ''
    });
    const [files, setFiles] = useState({
        identityCard: null,
        medicalCertificate: null,
        photo: null,
        signature: null
    });
    const [previews, setPreviews] = useState({
        identityCard: null,
        medicalCertificate: null,
        photo: null
    });

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        if (!user) return navigate('/login');

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // 1. Charger les états pour le mapping dynamique
                const etatsRes = await axios.get(`${API_ROOT}/api/etats`, config);
                const etatsData = etatsRes.data['hydra:member'] || etatsRes.data.member || (Array.isArray(etatsRes.data) ? etatsRes.data : []);
                setEtats(etatsData);

                // 2. Vérifier si l'utilisateur a déjà une licence
                const licRes = await axios.get(`${API_ROOT}/api/licences?user=/api/users/${user.id}`, config);
                const userLicences = licRes.data['hydra:member'] || licRes.data.member || [];

                // On cherche une licence active ou en attente par LABEL (souple)
                const activeOrPending = userLicences.find(l => {
                    const label = l.etat?.label?.toLowerCase().trim();
                    return label === 'en attente' ||
                        label === 'en attente de validation' ||
                        label === 'approuvée' ||
                        l.isActive === true;
                });

                if (activeOrPending) {
                    setExistingLicence(activeOrPending);
                }

                // 3. Charger les prix
                const res = await axios.get(`${API_ROOT}/api/price_licences`, config);
                const data = res.data['hydra:member'] || res.data.member || (Array.isArray(res.data) ? res.data : []);
                setPrices(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, priceLicence: data[0]['@id'] || data[0].id }));
                }
            } catch (err) {
                console.error("Erreur chargement données:", err);
                setError("Erreur lors de la récupération des données de configuration. Vérifiez votre connexion ou reconnectez-vous.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const { name, files: selectedFiles } = e.target;
        const file = selectedFiles[0];
        if (file) {
            setFiles(prev => ({ ...prev, [name]: file }));
            setPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!Array.isArray(etats) || etats.length === 0) {
            setError("Les données de configuration (états) ne sont pas encore disponibles. Réessayez dans un instant.");
            return;
        }

        if (!files.signature) {
            setError("La signature est obligatoire pour valider votre demande.");
            return;
        }

        // Recherche souple (insensible à la casse, trim, et fallback)
        const findEtat = (label) => etats.find(e => e.label?.trim().toLowerCase() === label.toLowerCase());

        let etatEnAttente = findEtat('En attente de validation') || findEtat('En attente');

        if (!etatEnAttente) {
            console.error("États disponibles en base :", etats.map(e => e.label));
            setError("Configuration serveur incomplète : état 'En attente' non trouvé dans la base de données.");
            return;
        }

        if (!formData.priceLicence) {
            setError("Veuillez choisir une formule de licence.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            if (!user?.id) {
                throw new Error("Utilisateur non identifié. Veuillez vous reconnecter.");
            }

            // 1. Créer l'entité Licence
            const licencePayload = {
                nationaly: formData.nationaly,
                country_resid: formData.country_resid,
                phone: formData.phone,
                price_licence: formData.priceLicence,
                user: `/api/users/${user.id}`,
                etat: etatEnAttente['@id']
            };

            const res = await axios.post(`${API_ROOT}/api/licences`, licencePayload, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/ld+json'
                }
            });

            const licenceId = res.data.id;

            // 2. Uploader les fichiers
            const fileData = new FormData();
            if (files.identityCard) fileData.append('identityCard', files.identityCard);
            if (files.medicalCertificate) fileData.append('medicalCertificate', files.medicalCertificate);
            if (files.photo) fileData.append('photo', files.photo);
            if (files.signature) fileData.append('signature', files.signature, 'signature.png');

            await axios.post(`${API_ROOT}/api/licences/${licenceId}/files`, fileData, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsSuccess(true);
            setTimeout(() => navigate('/profile'), 3000);
        } catch (err) {
            console.error("Erreur lors de la soumission:", err);
            const violations = err.response?.data?.violations;
            if (violations) {
                const messages = violations.map(v => `${v.propertyPath}: ${v.message}`).join(' | ');
                setError(messages);
            } else {
                setError(err.response?.data?.['hydra:description'] || "Une erreur est survenue lors de la demande.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-nigth-blue px-4">
                <div className="bg-black/40 backdrop-blur-xl border border-green-500/30 p-10 rounded-3xl text-center max-w-md animate-slideup">
                    <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheckCircle className="text-green-500 text-5xl" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4">Demande Envoyée !</h2>
                    <p className="text-gray-300">Votre demande de permis BMX est en cours d'examen. Un administrateur reviendra vers vous très bientôt.</p>
                    <div className="mt-8 text-orange font-bold animate-pulse">Redirection vers votre profil...</div>
                </div>
            </div>
        );
    }

    if (existingLicence) {
        const label = existingLicence.etat?.label?.toLowerCase().trim();
        const isPending = label === 'en attente' || label === 'en attente de validation';
        const isApproved = label === 'approuvée';
        const isActive = existingLicence.isActive === true;

        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-nigth-blue px-4 py-20">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center max-w-lg animate-slideup">
                    {isPending && (
                        <>
                            <div className="w-20 h-20 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheckCircle className="text-orange text-5xl animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 italic uppercase">Demande en cours d'examen</h2>
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Votre demande de permis BMX a bien été reçue. Nos administrateurs examinent actuellement vos pièces jointes.<br /><br />
                                <span className="text-orange font-bold">Un email vous sera envoyé dès que votre demande sera validée.</span>
                            </p>
                            <button onClick={() => navigate('/profile')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all">Retour au profil</button>
                        </>
                    )}

                    {isApproved && (
                        <>
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-green-500 text-4xl">💳</span>
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 italic uppercase">Paiement Requis</h2>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                Bonne nouvelle ! Votre demande a été <span className="text-green-500 font-bold uppercase">Approuvée</span>.<br />
                                Pour activer votre permis, veuillez procéder au règlement de votre licence.
                            </p>
                            <button
                                onClick={() => navigate('/checkout', { state: { licenceId: existingLicence.id, type: 'licence' } })}
                                className="w-full bg-orange hover:bg-orange/80 text-white py-4 rounded-2xl font-black text-xl uppercase italic tracking-tighter transition-all shadow-xl shadow-orange/30"
                            >
                                Payer ma licence {(existingLicence.price_licence?.price / 100).toFixed(2)} € ⚡
                            </button>
                        </>
                    )}

                    {isActive && (
                        <>
                            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FaCheckCircle className="text-green-500 text-5xl" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-4 italic uppercase">Permis Actif</h2>
                            <p className="text-gray-300 mb-8 leading-relaxed">
                                Vous possédez déjà une licence BMX active. Vous pouvez la retrouver dans votre profil.
                            </p>
                            <button onClick={() => navigate('/profile')} className="bg-orange text-white px-8 py-3 rounded-xl font-bold transition-all">Voir mon profil</button>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-dark-nigth-blue flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10 animate-fade-in">
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Demande de Permis <span className="text-orange">BMX</span></h1>
                    <p className="text-gray-400">Remplissez le formulaire ci-dessous pour obtenir votre licence officielle.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 sm:p-12 rounded-3xl shadow-2xl space-y-8 animate-slideup">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm italic">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Informations personnelles */}
                        <div className="space-y-6">
                            <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2">
                                <FaGlobe /> Localisation & Contact
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Nationalité</label>
                                    <input
                                        type="text" name="nationaly" value={formData.nationaly} onChange={handleInputChange} required placeholder="ex: Française"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Pays de résidence</label>
                                    <input
                                        type="text" name="country_resid" value={formData.country_resid} onChange={handleInputChange} required placeholder="ex: France"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Téléphone (format: 06.01.02.03.04)</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        required
                                        placeholder="06.XX.XX.XX.XX"
                                        pattern="[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}"
                                        title="Le format doit être xx.xx.xx.xx.xx"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Type de licence */}
                        <div className="space-y-6">
                            <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2">
                                <FaCheckCircle /> Type de Licence
                            </h3>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-500 uppercase ml-2 mb-1 block">Formule souhaitée</label>
                                <div className="space-y-3">
                                    {prices.map((p) => (
                                        <label key={p['@id']} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${formData.priceLicence === p['@id'] ? 'bg-orange/20 border-orange' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio" name="priceLicence" value={p['@id']}
                                                    checked={formData.priceLicence === p['@id']} onChange={handleInputChange}
                                                    className="hidden"
                                                />
                                                <span className="text-white font-bold">{p.label}</span>
                                            </div>
                                            <span className="text-orange font-black">{(p.price / 100).toFixed(2)} €</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <hr className="border-white/5" />

                    {/* Pièces jointes */}
                    <div className="space-y-6">
                        <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2">
                            <FaFileMedical /> Justificatifs obligatoires
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Carte d'identité */}
                            <div className="group relative bg-white/5 border border-dashed border-white/20 p-6 rounded-2xl hover:border-orange transition-all flex flex-col items-center text-center">
                                <FaIdCard className="text-4xl text-gray-500 group-hover:text-orange mb-4 transition-colors" />
                                <span className="text-white font-bold mb-1">Pièce d'identité</span>
                                <span className="text-gray-500 text-xs mb-4">Format image ou PDF (max 5Mo)</span>

                                {previews.identityCard && (
                                    <div className="mb-4 w-full h-24 rounded-lg overflow-hidden border border-white/10">
                                        <img src={previews.identityCard} className="w-full h-full object-cover" alt="ID Preview" />
                                    </div>
                                )}

                                <input
                                    type="file" name="identityCard" accept="image/*,application/pdf" onChange={handleFileChange} required
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="bg-orange/20 text-orange px-4 py-2 rounded-lg text-xs font-black uppercase">Choisir un fichier</div>
                            </div>

                            {/* Certificat médical */}
                            <div className="group relative bg-white/5 border border-dashed border-white/20 p-6 rounded-2xl hover:border-orange transition-all flex flex-col items-center text-center">
                                <FaFileMedical className="text-4xl text-gray-500 group-hover:text-orange mb-4 transition-colors" />
                                <span className="text-white font-bold mb-1">Certificat médical</span>
                                <span className="text-gray-500 text-xs mb-4">Datant de moins de 3 mois</span>

                                {previews.medicalCertificate && (
                                    <div className="mb-4 w-full h-24 rounded-lg overflow-hidden border border-white/10">
                                        <img src={previews.medicalCertificate} className="w-full h-full object-cover" alt="Med Preview" />
                                    </div>
                                )}

                                <input
                                    type="file" name="medicalCertificate" accept="image/*,application/pdf" onChange={handleFileChange} required
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="bg-orange/20 text-orange px-4 py-2 rounded-lg text-xs font-black uppercase">Choisir un fichier</div>
                            </div>

                            {/* Photo d'identité pour la licence */}
                            <div className="group relative bg-white/5 border border-dashed border-white/20 p-6 rounded-2xl hover:border-orange transition-all flex flex-col items-center text-center">
                                <div className="w-12 h-12 bg-orange/20 rounded-full flex items-center justify-center mb-4">
                                    <span className="text-orange text-2xl font-bold">📸</span>
                                </div>
                                <span className="text-white font-bold mb-1">Photo d'identité</span>
                                <span className="text-gray-500 text-xs mb-4">Format portrait (pour la carte)</span>

                                {previews.photo && (
                                    <div className="mb-4 w-16 h-20 rounded-lg overflow-hidden border border-white/10 mx-auto">
                                        <img src={previews.photo} className="w-full h-full object-cover" alt="Photo Preview" />
                                    </div>
                                )}

                                <input
                                    type="file" name="photo" accept="image/*" onChange={handleFileChange} required
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="bg-orange/20 text-orange px-4 py-2 rounded-lg text-xs font-black uppercase">Choisir une photo</div>
                            </div>

                            {/* Signature Digitale */}
                            <div className="bg-white/5 border border-dashed border-white/20 p-6 rounded-2xl hover:border-orange transition-all flex flex-col items-center">
                                <span className="text-white font-bold mb-1">Signature digitale</span>
                                <span className="text-gray-500 text-xs mb-4">Signez à l'aide de votre souris ou doigt</span>
                                <SignaturePad 
                                    onSave={(blob) => setFiles(prev => ({ ...prev, signature: blob }))} 
                                    onClear={() => setFiles(prev => ({ ...prev, signature: null }))} 
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit" disabled={isLoading}
                            className="w-full bg-orange hover:bg-orange/80 text-white py-4 rounded-2xl font-black text-xl uppercase italic tracking-tighter transition-all shadow-xl shadow-orange/30 flex justify-center items-center gap-3"
                        >
                            {isLoading ? <ButtonLoader size={24} /> : <>Soumettre ma demande <span className="text-2xl">⚡</span></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LicenceForm;
