import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import CustomInput from '../UI/CustomInput';
import CustomButton from '../UI/CustomButton';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';
import { FaPlus, FaTrash } from 'react-icons/fa';

const EditProfileForm = ({ user, fullUser, onCancel, onSuccess }) => {
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstname: fullUser?.firstname || "",
        lastname: fullUser?.lastname || "",
        pseudo: fullUser?.pseudo || "",
        email: fullUser?.email || "",
        telephone: fullUser?.telephone || fullUser?.phone || "",
        birthday: fullUser?.birthday ? fullUser.birthday.split('T')[0] : "",
        password: "",
        adresses: fullUser?.adresses?.length > 0 ? [...fullUser.adresses] : []
    });

    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!avatarFile) return;
        const objectUrl = URL.createObjectURL(avatarFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const handleChange = (e, field) => {
        setFormData({ ...formData, [field]: e.target.value });
    };

    const handleAddressChange = (index, field, value) => {
        const newAdresses = [...formData.adresses];
        newAdresses[index] = { ...newAdresses[index], [field]: value };
        setFormData({ ...formData, adresses: newAdresses });
    };

    const addAddressField = () => {
        setFormData({
            ...formData,
            adresses: [...formData.adresses, { number: "", type: "Rue", label: "", complement: "", cp: "", city: "" }]
        });
    };

    const removeAddressField = (index) => {
        const newAdresses = formData.adresses.filter((_, i) => i !== index);
        setFormData({ ...formData, adresses: newAdresses });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Logique de déduplication : on vérifie si l'adresse existe déjà chez l'utilisateur
            const processedAdresses = formData.adresses.map(addr => {
                const match = fullUser.adresses.find(existing => 
                    String(existing.number) === String(addr.number) &&
                    existing.type === addr.type &&
                    existing.label === addr.label &&
                    String(existing.cp) === String(addr.cp) &&
                    existing.city === addr.city &&
                    (existing.complement || "") === (addr.complement || "")
                );

                // Si elle existe, on renvoie son IRI, sinon on crée l'objet
                return match ? (match['@id'] || `/api/adresses/${match.id}`) : {
                    number: String(addr.number),
                    type: addr.type || "Rue",
                    label: addr.label,
                    complement: addr.complement || null,
                    cp: parseInt(addr.cp, 10),
                    city: addr.city
                };
            });

            const payload = {
                firstname: formData.firstname,
                lastname: formData.lastname,
                pseudo: formData.pseudo,
                email: formData.email,
                telephone: formData.telephone,
                birthday: formData.birthday || null,
                adresses: processedAdresses
            };

            if (formData.password) payload.plainPassword = formData.password;

            const res = await axios.patch(`${API_ROOT}/api/users/${user.id}`, payload, {
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/merge-patch+json' 
                }
            });

            if (avatarFile) {
                const imgData = new FormData();
                imgData.append('file', avatarFile);
                await axios.post(`${API_ROOT}/api/users/${user.id}/avatar`, imgData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }

            onSuccess(res.data);
        } catch (err) {
            console.error("Erreur PATCH:", err.response?.data);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setIsSubmitting(false);
        }
    };
    const handleDeactivate = async () => {
        const confirm = window.confirm("ATTENTION : Êtes-vous sûr de vouloir désactiver votre compte ? Vous serez immédiatement déconnecté et ne pourrez plus accéder à vos données.");
        if (!confirm) return;

        setIsSubmitting(true);
        try {
            await axios.patch(`${API_ROOT}/api/users/${user.id}`, 
                { is_active: false },
                { 
                    headers: { 
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/merge-patch+json' 
                    } 
                }
            );
            
            // Déconnexion propre
            localStorage.removeItem('user');
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error("Erreur désactivation:", err);
            alert("Une erreur est survenue lors de la désactivation du compte.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
            {/* Section Avatar */}
            <div className="flex justify-around items-center mb-6 bg-black/20 p-4 rounded-xl">
                <div className="text-center">
                    <p className="text-[10px] text-gray-400 uppercase">Actuel</p>
                    <img src={fullUser?.avatar ? `${API_ROOT}${fullUser.avatar}` : `${IMAGE_URL}/default/avatar/default-avatar-1.png`} className="w-16 h-16 rounded-full object-cover border border-white/10" />
                </div>
                {previewUrl && (
                    <div className="text-center">
                        <p className="text-[10px] text-orange uppercase">Nouveau</p>
                        <img src={previewUrl} className="w-16 h-16 rounded-full object-cover border border-orange" />
                    </div>
                )}
            </div>
            <input type="file" onChange={(e) => setAvatarFile(e.target.files[0])} className="text-xs mb-4" />

            {/* Infos Personnelles */}
            <div className="grid grid-cols-2 gap-3">
                <CustomInput label="Prénom" state={formData.firstname} callable={(e) => handleChange(e, 'firstname')} />
                <CustomInput label="Nom" state={formData.lastname} callable={(e) => handleChange(e, 'lastname')} />
            </div>
            <CustomInput label="Pseudo" state={formData.pseudo} callable={(e) => handleChange(e, 'pseudo')} />
            <CustomInput label="Email" state={formData.email} callable={(e) => handleChange(e, 'email')} />
            <CustomInput label="Téléphone" type="tel" state={formData.telephone} callable={(e) => handleChange(e, 'telephone')} />
            <CustomInput label="Anniversaire" type="date" state={formData.birthday} callable={(e) => handleChange(e, 'birthday')} />
            <CustomInput label="Nouveau mot de passe" type="password" state={formData.password} callable={(e) => handleChange(e, 'password')} placeholder="Laisser vide pour garder l'actuel" />

            {/* Section Adresses */}
            <div className="border-t border-white/10 pt-6 mt-6">
                <div className="flex justify-between items-center mb-4">
                    <p className="text-xs font-bold text-orange uppercase">Mes Adresses</p>
                    <button type="button" onClick={addAddressField} className="bg-orange/20 text-orange px-3 py-1 rounded-full text-xs hover:bg-orange transition-all">
                        + Ajouter
                    </button>
                </div>

                {formData.adresses.map((addr, index) => (
                    <div key={index} className="relative bg-white/5 p-4 rounded-xl border border-white/5 mb-4 group">
                        <button type="button" onClick={() => removeAddressField(index)} className="absolute -top-2 -right-2 bg-red-600 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                            <FaTrash size={10} />
                        </button>
                        <div className="grid grid-cols-3 gap-2 mb-2">
                            <CustomInput label="N°" state={addr.number} callable={(e) => handleAddressChange(index, 'number', e.target.value)} />
                            <CustomInput label="Type" state={addr.type} callable={(e) => handleAddressChange(index, 'type', e.target.value)} />
                            <CustomInput label="Voie" state={addr.label} callable={(e) => handleAddressChange(index, 'label', e.target.value)} />
                        </div>
                        <CustomInput label="Complément" state={addr.complement} callable={(e) => handleAddressChange(index, 'complement', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            <CustomInput label="CP" state={addr.cp} callable={(e) => handleAddressChange(index, 'cp', e.target.value)} />
                            <CustomInput label="Ville" state={addr.city} callable={(e) => handleAddressChange(index, 'city', e.target.value)} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex gap-4 pt-4 sticky bottom-0 bg-dark-nigth-blue py-2">
                <CustomButton type="submit" className="flex-1" bgColor="bg-green-600">Enregistrer</CustomButton>
                <CustomButton type="button" onClick={onCancel} className="flex-1" bgColor="bg-red-600">Annuler</CustomButton>
            </div>

            <div className="mt-10 pt-6 border-t border-red-500/20 text-center">
                <p className="text-[10px] text-gray-500 uppercase mb-3">Zone de danger</p>
                <button 
                    type="button" 
                    onClick={handleDeactivate}
                    className="text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500 px-4 py-2 rounded-xl text-xs font-black uppercase transition-all duration-300 italic tracking-widest"
                >
                    Désactiver mon profil
                </button>
            </div>
        </form>
    );
};

export default EditProfileForm;