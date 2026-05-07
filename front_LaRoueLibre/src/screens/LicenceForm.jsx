import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaIdCard, FaFileMedical, FaPhoneAlt, FaGlobe, FaCheckCircle, FaUser, FaEnvelope, FaCalendarAlt, FaHome } from 'react-icons/fa';

import SignaturePad from '../components/UI/SignaturePad';

const LicenceForm = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const [prices, setPrices] = useState([]);
    const [etats, setEtats] = useState([]);
    const [existingLicence, setExistingLicence] = useState(null);
    
    // État consolidé pour toutes les données (Profil + Licence)
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        pseudo: '',
        email: '',
        birthday: '',
        nationaly: '',
        country_resid: '',
        phone: '',
        priceLicence: '',
        // Champs Adresse
        address_number: '',
        address_type: 'Rue',
        address_label: '',
        address_complement: '',
        address_cp: '',
        address_city: ''
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
    const [originalUser, setOriginalUser] = useState(null);

    useEffect(() => {
        if (!user) return navigate('/login');

        const fetchData = async () => {
            setIsLoading(true);
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };

                // 1. Charger le profil complet de l'utilisateur pour pré-remplir
                const userRes = await axios.get(`${API_ROOT}/api/users/${user.id}`, config);
                const u = userRes.data;
                setOriginalUser(u);
                
                const primaryAddress = u.adresses && u.adresses.length > 0 ? u.adresses[0] : {};

                setFormData(prev => ({
                    ...prev,
                    firstname: u.firstname || '',
                    lastname: u.lastname || '',
                    pseudo: u.pseudo || '',
                    email: u.email || '',
                    birthday: u.birthday ? u.birthday.split('T')[0] : '',
                    phone: u.telephone || '',
                    address_number: primaryAddress.number || '',
                    address_type: primaryAddress.type || 'Rue',
                    address_label: primaryAddress.label || '',
                    address_complement: primaryAddress.complement || '',
                    address_cp: primaryAddress.cp || '',
                    address_city: primaryAddress.city || '',
                }));

                // 2. Charger les états
                const etatsRes = await axios.get(`${API_ROOT}/api/etats`, config);
                const etatsData = etatsRes.data['hydra:member'] || etatsRes.data.member || [];
                setEtats(etatsData);

                // 3. Vérifier licence existante
                const licRes = await axios.get(`${API_ROOT}/api/licences?user=/api/users/${user.id}`, config);
                const userLicences = licRes.data['hydra:member'] || licRes.data.member || [];

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

                // 4. Charger les prix
                const res = await axios.get(`${API_ROOT}/api/price_licences`, config);
                const data = res.data['hydra:member'] || res.data.member || [];
                setPrices(data);
                if (data.length > 0) {
                    setFormData(prev => ({ ...prev, priceLicence: data[0]['@id'] || data[0].id }));
                }
            } catch (err) {
                console.error("Erreur chargement données:", err);
                setError("Erreur lors de la récupération des données.");
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

        if (!files.signature) {
            setError("La signature est obligatoire.");
            return;
        }

        const findEtat = (label) => etats.find(e => e.label?.trim().toLowerCase() === label.toLowerCase());
        let etatEnAttente = findEtat('En attente de validation') || findEtat('En attente');

        if (!etatEnAttente) {
            setError("Configuration serveur incomplète.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                }
            };

            // Préparation des adresses (Logique similaire à EditProfileForm)
            const processedAdresses = [];
            if (formData.address_label && formData.address_city) {
                const newAddr = {
                    number: String(formData.address_number),
                    type: formData.address_type || "Rue",
                    label: formData.address_label,
                    complement: formData.address_complement || null,
                    cp: parseInt(formData.address_cp, 10),
                    city: formData.address_city
                };

                // Vérifier si elle existe déjà pour éviter les doublons
                const match = originalUser?.adresses?.find(existing => 
                    String(existing.number) === String(newAddr.number) &&
                    existing.type === newAddr.type &&
                    existing.label === newAddr.label &&
                    String(existing.cp) === String(newAddr.cp) &&
                    existing.city === newAddr.city
                );

                processedAdresses.push(match ? (match['@id'] || `/api/adresses/${match.id}`) : newAddr);
            }

            // 1. METTRE À JOUR LE PROFIL UTILISATEUR D'ABORD
            const userUpdateRes = await axios.patch(`${API_ROOT}/api/users/${user.id}`, {
                firstname: formData.firstname,
                lastname: formData.lastname,
                pseudo: formData.pseudo,
                email: formData.email,
                birthday: formData.birthday,
                telephone: formData.phone,
                adresses: processedAdresses
            }, {
                headers: {
                    ...config.headers,
                    'Content-Type': 'application/merge-patch+json'
                }
            });

            // Mettre à jour l'utilisateur localement
            setUser({ ...user, ...userUpdateRes.data });

            // 2. CRÉER LA LICENCE
            const licencePayload = {
                nationaly: formData.nationaly,
                country_resid: formData.country_resid,
                phone: formData.phone,
                price_licence: formData.priceLicence,
                user: `/api/users/${user.id}`,
                etat: etatEnAttente['@id']
            };

            const resLicence = await axios.post(`${API_ROOT}/api/licences`, licencePayload, {
                headers: {
                    ...config.headers,
                    'Content-Type': 'application/ld+json'
                }
            });

            const licenceId = resLicence.data.id;

            // 3. UPLOADER LES FICHIERS
            const fileData = new FormData();
            if (files.identityCard) fileData.append('identityCard', files.identityCard);
            if (files.medicalCertificate) fileData.append('medicalCertificate', files.medicalCertificate);
            if (files.photo) fileData.append('photo', files.photo);
            if (files.signature) fileData.append('signature', files.signature, 'signature.png');

            await axios.post(`${API_ROOT}/api/licences/${licenceId}/files`, fileData, {
                headers: {
                    ...config.headers,
                    'Content-Type': 'multipart/form-data'
                }
            });

            setIsSuccess(true);
            setTimeout(() => navigate('/profile'), 3000);
        } catch (err) {
            console.error("Erreur lors de la soumission:", err);
            setError("Une erreur est survenue. Vérifiez vos informations.");
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
                    <h2 className="text-3xl font-black text-white mb-4 italic uppercase">Dossier Validé !</h2>
                    <p className="text-gray-300">Votre demande et votre profil ont été mis à jour.</p>
                </div>
            </div>
        );
    }

    if (existingLicence) {
        return (
            <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-dark-nigth-blue px-4 py-20">
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 p-10 rounded-3xl text-center max-w-lg animate-slideup">
                    <div className="w-20 h-20 bg-orange/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FaCheckCircle className="text-orange text-5xl animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-black text-white mb-4 italic uppercase tracking-tighter">Licence en cours</h2>
                    <p className="text-gray-400 mb-6 font-medium">Vous avez déjà une demande active. Vous pouvez suivre son état dans votre profil.</p>
                    <button onClick={() => navigate('/profile')} className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-bold transition-all">Aller au profil</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 bg-dark-nigth-blue flex flex-col items-center">
            <div className="max-w-4xl w-full">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Demande de Permis <span className="text-orange">BMX</span></h1>
                    <p className="text-gray-400 font-medium">Vérifiez et modifiez vos informations avant de soumettre.</p>
                </div>

                <form onSubmit={handleSubmit} className="bg-black/60 backdrop-blur-xl border border-white/10 p-6 md:p-12 rounded-3xl shadow-2xl space-y-12 animate-slideup">

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm italic font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    {/* SECTION 1 : IDENTITÉ (MODIFIABLE) */}
                    <div className="space-y-8">
                        <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                            <FaUser /> Informations Personnelles
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Prénom</label>
                                <input type="text" name="firstname" value={formData.firstname} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Nom</label>
                                <input type="text" name="lastname" value={formData.lastname} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Pseudo</label>
                                <input type="text" name="pseudo" value={formData.pseudo} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Adresse Email</label>
                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Date de naissance</label>
                                <input type="date" name="birthday" value={formData.birthday} onChange={handleInputChange} required className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2 : ADRESSE (MODIFIABLE) */}
                    <div className="space-y-8">
                        <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                            <FaHome /> Mon Adresse
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">N°</label>
                                <input type="text" name="address_number" value={formData.address_number} onChange={handleInputChange} required placeholder="ex: 12" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Type de voie</label>
                                <input type="text" name="address_type" value={formData.address_type} onChange={handleInputChange} required placeholder="ex: Rue, Avenue..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Nom de la voie</label>
                                <input type="text" name="address_label" value={formData.address_label} onChange={handleInputChange} required placeholder="ex: de la Paix" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Code Postal</label>
                                <input type="text" name="address_cp" value={formData.address_cp} onChange={handleInputChange} required placeholder="ex: 75000" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Ville</label>
                                <input type="text" name="address_city" value={formData.address_city} onChange={handleInputChange} required placeholder="ex: Paris" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Complément (Optionnel)</label>
                            <input type="text" name="address_complement" value={formData.address_complement} onChange={handleInputChange} placeholder="ex: Appt 4, Étage 2..." className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                        </div>
                    </div>

                    {/* SECTION 3 : FORMULE & CONTACT */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        <div className="space-y-8">
                            <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                                <FaGlobe /> Localisation & Contact
                            </h3>
                            <div className="space-y-5">
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Nationalité</label>
                                    <input type="text" name="nationaly" value={formData.nationaly} onChange={handleInputChange} required placeholder="ex: Française" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Pays de résidence</label>
                                    <input type="text" name="country_resid" value={formData.country_resid} onChange={handleInputChange} required placeholder="ex: France" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-gray-500 uppercase ml-2 mb-2 block">Téléphone (xx.xx.xx.xx.xx)</label>
                                    <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} required placeholder="06.12.34.56.78" pattern="[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}\.[0-9]{2}" className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-orange outline-none transition-all font-bold" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                                <FaCheckCircle /> Choix de la Licence
                            </h3>
                            <div className="space-y-4">
                                {prices.map((p) => (
                                    <label key={p['@id']} className={`flex flex-col p-5 rounded-2xl border cursor-pointer transition-all ${formData.priceLicence === p['@id'] ? 'bg-orange/10 border-orange shadow-lg shadow-orange/10' : 'bg-white/5 border-white/10 hover:border-white/30'}`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <input type="radio" name="priceLicence" value={p['@id']} checked={formData.priceLicence === p['@id']} onChange={handleInputChange} className="hidden" />
                                                <div className="flex flex-col">
                                                    <span className={`text-sm font-black uppercase italic tracking-tighter ${formData.priceLicence === p['@id'] ? 'text-orange' : 'text-white'}`}>{p.label}</span>
                                                    <span className="text-[10px] text-gray-500 font-bold">Validité 1 an</span>
                                                </div>
                                            </div>
                                            <span className="text-orange font-black text-lg">{(p.price / 100).toFixed(2)} €</span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4 : JUSTIFICATIFS */}
                    <div className="space-y-8">
                        <h3 className="text-orange font-black uppercase text-sm tracking-widest flex items-center gap-2 border-b border-white/10 pb-4">
                            <FaFileMedical /> Documents & Signature
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             {/* Pièces jointes adaptées mobile */}
                             {[
                                { name: 'identityCard', label: 'Carte d\'identité', icon: FaIdCard },
                                { name: 'medicalCertificate', label: 'Certificat médical', icon: FaFileMedical },
                                { name: 'photo', label: 'Photo d\'identité', icon: '📸' }
                             ].map((file) => (
                                <div key={file.name} className="relative group bg-white/5 border border-dashed border-white/20 p-8 rounded-3xl hover:border-orange transition-all flex flex-col items-center text-center">
                                    {typeof file.icon === 'string' ? <span className="text-4xl mb-4">{file.icon}</span> : <file.icon className="text-4xl text-gray-500 mb-4 group-hover:text-orange" />}
                                    <span className="text-white font-bold">{file.label}</span>
                                    {previews[file.name] && (
                                        <div className="mt-4 w-full h-24 rounded-xl overflow-hidden border border-white/10">
                                            <img src={previews[file.name]} className="w-full h-full object-cover" alt="preview" />
                                        </div>
                                    )}
                                    <input type="file" name={file.name} onChange={handleFileChange} required className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="mt-4 bg-orange/20 text-orange px-4 py-2 rounded-xl text-[10px] font-black uppercase">Choisir un fichier</div>
                                </div>
                             ))}

                             <div className="bg-white/5 border border-dashed border-white/20 p-8 rounded-3xl flex flex-col items-center">
                                <span className="text-white font-bold mb-4">Signature digitale</span>
                                <SignaturePad 
                                    onSave={(blob) => setFiles(prev => ({ ...prev, signature: blob }))} 
                                    onClear={() => setFiles(prev => ({ ...prev, signature: null }))} 
                                />
                             </div>
                        </div>
                    </div>

                    <div className="pt-8">
                        <button
                            type="submit" disabled={isLoading}
                            className="w-full bg-orange hover:bg-orange/80 text-white py-5 rounded-3xl font-black text-2xl uppercase italic tracking-tighter transition-all shadow-2xl shadow-orange/20 flex justify-center items-center gap-4 active:scale-95"
                        >
                            {isLoading ? <ButtonLoader size={28} /> : <>Soumettre mon dossier <span className="text-3xl">⚡</span></>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LicenceForm;
