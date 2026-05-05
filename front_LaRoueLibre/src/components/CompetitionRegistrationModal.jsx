import React, { useState } from 'react';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { 
    FaTimes, FaUser, FaBuilding, FaIdCard, FaLayerGroup, 
    FaCheckCircle, FaSpinner, FaArrowRight, FaArrowLeft, 
    FaShieldAlt, FaPhone, FaFileUpload, FaInfoCircle, FaBolt, FaIdBadge
} from 'react-icons/fa';

const CompetitionRegistrationModal = ({ competition, user, userLicences, onClose, onSuccess }) => {
    const [isRegistering, setIsRegistering] = useState(false);
    const [error, setError] = useState(null);
    
    // Initialize form data based on user profile and available licenses
    const activeLicence = userLicences.find(l => l.isActive || l.etat?.label === 'Approuvée');
    
    const [formData, setFormData] = useState({
        category: '',
        club: '',
        plateNumber: '',
        firstName: user?.firstname || user?.firstName || '',
        lastName: user?.lastname || user?.lastName || '',
        licence: activeLicence ? activeLicence['@id'] : (userLicences.length > 0 ? userLicences[0]['@id'] : ''),
        licenceFile: null,
        emergencyContactName: '',
        emergencyContactPhone: ''
    });
    
    const [formStep, setFormStep] = useState(1);
    const totalSteps = 4;

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        setIsRegistering(true);
        setError(null);
        
        try {
            // Étape 1 : Créer l'inscription
            const regResponse = await axios.post(`${API_ROOT}/api/competition_registrations`, {
                user: `/api/users/${user.id}`,
                competition: `/api/competitions/${competition.id}`,
                category: formData.category,
                club: formData.club,
                plateNumber: formData.plateNumber,
                firstName: formData.firstName,
                lastName: formData.lastName,
                licence: formData.licence || null,
                emergencyContactName: formData.emergencyContactName,
                emergencyContactPhone: formData.emergencyContactPhone
            }, {
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/ld+json'
                }
            });

            const registrationId = regResponse.data.id;

            // Étape 2 : Uploader le permis si présent
            if (formData.licenceFile) {
                const fileData = new FormData();
                fileData.append('licence', formData.licenceFile);

                await axios.post(`${API_ROOT}/api/competition_registrations/${registrationId}/licence`, fileData, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }
            
            onSuccess();
        } catch (err) {
            console.error("Erreur lors de l'inscription:", err);
            setError(err.response?.data?.['hydra:description'] || "Une erreur est survenue lors de l'inscription.");
        } finally {
            setIsRegistering(false);
        }
    };

    const nextStep = () => {
        if (formStep === 1) {
            if (!formData.firstName || !formData.lastName) {
                setError("Veuillez renseigner les informations du pilote.");
                return;
            }
        }
        if (formStep === 2) {
            if (!formData.licence && !formData.licenceFile) {
                setError("Veuillez sélectionner un permis ou charger un fichier.");
                return;
            }
        }
        if (formStep === 3) {
            if (!formData.category || !formData.club || !formData.plateNumber) {
                setError("Veuillez renseigner toutes les informations de course.");
                return;
            }
        }
        
        setError(null);
        if (formStep < totalSteps) setFormStep(formStep + 1);
    };

    const prevStep = () => {
        if (formStep > 1) setFormStep(formStep - 1);
    };

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-8 bg-[#050810]/95 backdrop-blur-2xl animate-fade-in overflow-y-auto">
            <div className="relative w-full max-w-2xl bg-[#0D111C] rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(255,102,0,0.1)] overflow-hidden my-auto">
                
                {/* Header & Progress */}
                <div className="p-8 md:p-12 pb-6">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-orange/20 rounded-2xl flex items-center justify-center text-orange">
                                <FaBolt className="text-xl" />
                            </div>
                            <div>
                                <h4 className="text-2xl font-black italic uppercase text-white tracking-tight leading-none">Inscription</h4>
                                <p className="text-orange text-[10px] font-black uppercase tracking-widest mt-1">{competition.title}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 bg-white/5 hover:bg-red-500/20 hover:text-red-500 rounded-xl transition-all flex items-center justify-center text-gray-500">
                            <FaTimes size={18} />
                        </button>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                        <div 
                            className="absolute top-0 left-0 h-full bg-linear-to-r from-orange to-red-500 transition-all duration-700 ease-out"
                            style={{ width: `${(formStep / totalSteps) * 100}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-[0.2em] text-gray-500 italic">
                        <span className={formStep >= 1 ? 'text-orange' : ''}>Pilote</span>
                        <span className={formStep >= 2 ? 'text-orange' : ''}>Permis</span>
                        <span className={formStep >= 3 ? 'text-orange' : ''}>Catégorie</span>
                        <span className={formStep >= 4 ? 'text-orange' : ''}>Validation</span>
                    </div>
                </div>

                {/* Error message inside modal */}
                {error && (
                    <div className="mx-8 md:mx-12 mb-4 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-2xl text-[11px] font-bold italic flex items-center gap-3">
                        <FaInfoCircle /> {error}
                    </div>
                )}

                {/* Form Content */}
                <form onSubmit={(e) => e.preventDefault()} className="px-8 md:px-12 pb-12">
                    
                    {/* STEP 1: PILOTE INFO */}
                    {formStep === 1 && (
                        <div className="space-y-6 animate-slide-in">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Prénom</label>
                                    <div className="relative group">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange transition-colors" />
                                        <input 
                                            type="text" required placeholder="ex: Marc"
                                            value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Nom</label>
                                    <div className="relative group">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange transition-colors" />
                                        <input 
                                            type="text" required placeholder="ex: Dupont"
                                            value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="bg-orange/5 border border-orange/10 p-6 rounded-4xl flex items-start gap-4">
                                <div className="w-10 h-10 bg-orange/20 rounded-xl flex items-center justify-center shrink-0 text-orange">
                                    <FaIdBadge />
                                </div>
                                <div>
                                    <h5 className="text-white text-xs font-black uppercase italic mb-1">Information de compte</h5>
                                    <p className="text-gray-500 text-[11px] leading-relaxed">
                                        Cette inscription sera rattachée à votre profil <span className="text-white">{user.email}</span>. Assurez-vous que les informations du pilote sont correctes pour le jour de la course.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: LICENCE SELECTION & UPLOAD */}
                    {formStep === 2 && (
                        <div className="space-y-6 animate-slide-in">
                            <div className="space-y-4">
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Sélection du Permis (Licence)</label>
                                
                                {userLicences.length > 0 && (
                                    <div className="grid grid-cols-1 gap-3 mb-6">
                                        {userLicences.map(lic => (
                                            <label key={lic.id} className={`flex items-center gap-4 p-4 rounded-2xl border cursor-pointer transition-all ${formData.licence === lic['@id'] ? 'bg-orange/20 border-orange' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}>
                                                <input 
                                                    type="radio" name="licence" value={lic['@id']}
                                                    checked={formData.licence === lic['@id']} 
                                                    onChange={(e) => {
                                                        setFormData({...formData, licence: e.target.value, licenceFile: null});
                                                    }}
                                                    className="hidden"
                                                />
                                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${formData.licence === lic['@id'] ? 'border-orange bg-orange' : 'border-gray-700'}`}>
                                                    {formData.licence === lic['@id'] && <FaCheckCircle className="text-white text-xs" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-white text-xs font-black italic uppercase">Licence #{lic.id}</p>
                                                    <p className="text-gray-500 text-[10px] font-bold">{lic.price_licence?.label || 'Licence BMX'}</p>
                                                </div>
                                                <div className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase italic ${lic.isActive ? 'bg-green-500/20 text-green-500' : 'bg-orange/20 text-orange'}`}>
                                                    {lic.isActive ? 'Active' : (lic.etat?.label || 'En attente')}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    <div 
                                        onClick={() => setFormData({...formData, licence: ''})}
                                        className={`p-1 rounded-2xl transition-all ${!formData.licence ? 'bg-linear-to-r from-orange to-red-500' : ''}`}
                                    >
                                        <div className={`p-6 rounded-xl flex flex-col items-center gap-4 cursor-pointer transition-all ${!formData.licence ? 'bg-[#0D111C]' : 'bg-white/5 border border-dashed border-white/10 hover:border-white/30'}`}>
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${!formData.licence ? 'bg-orange/20 text-orange' : 'bg-white/5 text-gray-500'}`}>
                                                <FaFileUpload className="text-xl" />
                                            </div>
                                            <div className="text-center">
                                                <p className={`text-xs font-black italic uppercase ${!formData.licence ? 'text-white' : 'text-gray-500'}`}>
                                                    {formData.licenceFile ? "Fichier sélectionné" : "Utiliser un autre permis / Charger un fichier"}
                                                </p>
                                                {formData.licenceFile && (
                                                    <p className="text-orange text-[10px] font-bold mt-1">{formData.licenceFile.name}</p>
                                                )}
                                            </div>
                                            
                                            {!formData.licence && (
                                                <div className="w-full mt-4">
                                                    <div className="relative group bg-black/40 border border-white/10 p-8 rounded-2xl hover:border-orange transition-all flex flex-col items-center text-center">
                                                        <input 
                                                            type="file" 
                                                            onChange={(e) => setFormData({...formData, licenceFile: e.target.files[0]})}
                                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                                        />
                                                        <span className="text-gray-500 text-[9px] font-black uppercase tracking-widest">
                                                            {formData.licenceFile ? "Changer le fichier" : "Cliquer pour parcourir"}
                                                        </span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {userLicences.length === 0 && !formData.licenceFile && (
                                        <div className="bg-orange/5 border border-orange/10 p-4 rounded-2xl flex items-center gap-3">
                                            <FaInfoCircle className="text-orange" />
                                            <p className="text-[10px] text-gray-400 font-medium">
                                                Aucun permis détecté. Veuillez charger votre licence manuellement pour continuer.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CATEGORY & CLUB */}
                    {formStep === 3 && (
                        <div className="space-y-6 animate-slide-in">
                            <div className="space-y-2">
                                <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Catégorie de Course</label>
                                <div className="relative">
                                    <FaLayerGroup className="absolute left-4 top-1/2 -translate-y-1/2 text-orange" />
                                    <select 
                                        required value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="" disabled className="bg-[#0D111C]">-- Choisir votre catégorie --</option>
                                        <option value="Pré-licencié" className="bg-[#0D111C]">Pré-licencié (5-6 ans)</option>
                                        <option value="Poussin" className="bg-[#0D111C]">Poussin (7-8 ans)</option>
                                        <option value="Pupille" className="bg-[#0D111C]">Pupille (9-10 ans)</option>
                                        <option value="Benjamin" className="bg-[#0D111C]">Benjamin (11-12 ans)</option>
                                        <option value="Minime" className="bg-[#0D111C]">Minime (13-14 ans)</option>
                                        <option value="Cadet" className="bg-[#0D111C]">Cadet (15-16 ans)</option>
                                        <option value="Junior" className="bg-[#0D111C]">Junior (17-18 ans)</option>
                                        <option value="Elite" className="bg-[#0D111C]">Elite / Pro</option>
                                        <option value="Cruiser" className="bg-[#0D111C]">Cruiser (Roues 24")</option>
                                        <option value="Master" className="bg-[#0D111C]">Master (+30 ans)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">Club Actuel</label>
                                    <div className="relative group">
                                        <FaBuilding className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange transition-colors" />
                                        <input 
                                            type="text" required placeholder="ex: BMX Club Local"
                                            value={formData.club} onChange={(e) => setFormData({...formData, club: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-gray-500 text-[10px] font-black uppercase tracking-widest ml-1">N° de Plaque</label>
                                    <div className="relative group">
                                        <FaIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-orange transition-colors" />
                                        <input 
                                            type="text" required placeholder="ex: 42X"
                                            value={formData.plateNumber} onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white focus:border-orange outline-none transition-all placeholder:text-gray-700"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 4: SECURITY & VALIDATION */}
                    {formStep === 4 && (
                        <div className="space-y-8 animate-slide-in">
                            <div className="bg-red-500/5 border border-red-500/10 p-6 rounded-4xl">
                                <h5 className="text-red-500 text-[10px] font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                    <FaShieldAlt /> Contact d'urgence (Obligatoire)
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="relative">
                                        <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50" />
                                        <input 
                                            type="text" required placeholder="Nom du contact"
                                            value={formData.emergencyContactName} onChange={(e) => setFormData({...formData, emergencyContactName: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                    <div className="relative">
                                        <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500/50" />
                                        <input 
                                            type="tel" required placeholder="Téléphone"
                                            value={formData.emergencyContactPhone} onChange={(e) => setFormData({...formData, emergencyContactPhone: e.target.value})}
                                            className="w-full bg-black/40 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-white focus:border-red-500 outline-none transition-all text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary Card */}
                            <div className="bg-white/2 border border-white/5 rounded-4xl p-8 space-y-4">
                                <h5 className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-4">Récapitulatif de l'engagement</h5>
                                <div className="grid grid-cols-2 gap-8">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Pilote</p>
                                        <p className="text-white font-black italic uppercase">{formData.firstName} {formData.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Course</p>
                                        <p className="text-white font-black italic uppercase">{formData.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Permis</p>
                                        <p className="text-orange font-black italic uppercase text-xs truncate">
                                            {formData.licence ? `Licence #${formData.licence.split('/').pop()}` : (formData.licenceFile ? "Fichier joint" : "Non spécifié")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Club</p>
                                        <p className="text-white font-black italic uppercase">{formData.club}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Plaque</p>
                                        <p className="text-orange font-black italic uppercase">{formData.plateNumber}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 px-4">
                                <div className="pt-1">
                                    <input type="checkbox" required className="w-5 h-5 accent-orange bg-black/40 border-white/5 rounded-lg" id="terms" />
                                </div>
                                <label htmlFor="terms" className="text-gray-500 text-[11px] leading-relaxed cursor-pointer font-medium">
                                    Je certifie l'exactitude des informations fournies et j'accepte le règlement officiel de la compétition <span className="text-white">"{competition.title}"</span>.
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Footer Buttons */}
                    <div className="flex gap-4 mt-12">
                        {formStep > 1 && (
                            <button 
                                type="button" onClick={prevStep}
                                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-4xl font-black uppercase italic tracking-widest transition-all border border-white/5 flex items-center justify-center gap-3"
                            >
                                <FaArrowLeft /> Retour
                            </button>
                        )}
                        <button 
                            type="button" 
                            onClick={formStep === totalSteps ? handleRegister : nextStep} 
                            disabled={isRegistering}
                            className={`flex-2 bg-linear-to-r from-orange to-red-500 text-white py-5 rounded-4xl font-black uppercase italic tracking-widest shadow-2xl shadow-orange/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 ${isRegistering ? 'opacity-50 grayscale' : ''}`}
                        >
                            {isRegistering ? <FaSpinner className="animate-spin" /> : (formStep === totalSteps ? <FaCheckCircle /> : <FaArrowRight />)}
                            {isRegistering ? "Traitement..." : (formStep === totalSteps ? "Valider l'inscription" : "Étape suivante")}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CompetitionRegistrationModal;
