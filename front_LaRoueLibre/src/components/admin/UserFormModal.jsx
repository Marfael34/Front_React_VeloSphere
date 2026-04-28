import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT, AVATAR_URL, IMAGE_URL } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../Loader/ButtonLoader';
import { FaUserEdit, FaUserPlus, FaTimes, FaCheck, FaTrash } from 'react-icons/fa';

const UserFormModal = ({ initialUser, onClose, onSuccess }) => {
    const { user: currentUser } = useContext(AuthContext);
    
    const [editingUser, setEditingUser] = useState(initialUser);
    
    // Vérifier si l'utilisateur édité est l'utilisateur connecté
    const isOwnProfile = currentUser && editingUser.id === currentUser.id;
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [avatarFile, setAvatarFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!avatarFile) return;
        const objectUrl = URL.createObjectURL(avatarFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [avatarFile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingUser(prev => ({ ...prev, [name]: value }));
    };

    const handleRoleChange = (role) => {
        const currentRoles = editingUser.roles || [];
        const newRoles = currentRoles.includes(role)
            ? currentRoles.filter(r => r !== role)
            : [...currentRoles, role];
        setEditingUser(prev => ({ ...prev, roles: newRoles }));
    };

    const handleDeleteAvatar = async () => {
        if (!window.confirm("Voulez-vous vraiment supprimer cet avatar ?")) return;
        
        try {
            await axios.delete(`${API_ROOT}/api/users/${editingUser.id}/avatar`, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            setEditingUser(prev => ({ ...prev, avatar: null }));
            setPreviewUrl(null);
            setAvatarFile(null);
        } catch (err) {
            console.error("Erreur lors de la suppression de l'avatar:", err);
            setUpdateError("Erreur lors de la suppression de l'avatar.");
        }
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateError(null);

        try {
            if (editingUser.id) {
                await axios.patch(`${API_ROOT}/api/users/${editingUser.id}`, {
                    firstname: editingUser.firstname,
                    lastname: editingUser.lastname,
                    email: editingUser.email,
                    roles: editingUser.roles,
                    pseudo: editingUser.pseudo
                }, {
                    headers: {
                        Authorization: `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/merge-patch+json'
                    }
                });

                if (avatarFile) {
                    const imgData = new FormData();
                    imgData.append('file', avatarFile);
                    await axios.post(`${API_ROOT}/api/users/${editingUser.id}/avatar`, imgData, {
                        headers: { Authorization: `Bearer ${currentUser.token}` }
                    });
                }
            } else {
                // Optionnel : Gérer la création si l'API le permet plus tard
            }

            onSuccess();
        } catch (err) {
            console.error("Erreur lors de la mise à jour:", err);
            setUpdateError("Erreur lors de la mise à jour de l'utilisateur.");
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-nigth-blue border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideup">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        {editingUser.id ? <FaUserEdit className="text-orange" /> : <FaUserPlus className="text-orange" />}
                        {editingUser.id ? "Modifier l'utilisateur" : "Ajouter un utilisateur"}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Prénom</label>
                            <input
                                type="text" name="firstname" value={editingUser.firstname || ''} onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Nom</label>
                            <input
                                type="text" name="lastname" value={editingUser.lastname || ''} onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Email</label>
                            <input
                                type="email" name="email" value={editingUser.email || ''} onChange={handleInputChange}
                                readOnly={editingUser.id && !isOwnProfile}
                                className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all ${editingUser.id && !isOwnProfile ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title={editingUser.id && !isOwnProfile ? "L'email des autres utilisateurs ne peut pas être modifié" : ""}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pseudo</label>
                            <input 
                                type="text" name="pseudo" value={editingUser.pseudo || ''} onChange={handleInputChange}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Avatar</label>
                            <div className="flex items-center gap-6 bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="text-center relative group">
                                    <p className="text-[10px] text-gray-400 uppercase mb-2">Actuel</p>
                                    <div className="relative">
                                        <img 
                                            src={editingUser.avatar ? (editingUser.avatar.startsWith('/') ? `${API_ROOT}${editingUser.avatar}` : `${AVATAR_URL}/${editingUser.avatar}`) : `${IMAGE_URL}/default/avatar/default-avatar-1.png`} 
                                            className="w-16 h-16 rounded-full object-cover border border-white/10" 
                                            alt="Avatar actuel"
                                        />
                                        {editingUser.avatar && (
                                            <button 
                                                type="button"
                                                onClick={handleDeleteAvatar}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                title="Supprimer l'avatar"
                                            >
                                                <FaTrash size={10} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                                {previewUrl && (
                                    <div className="text-center">
                                        <p className="text-[10px] text-orange uppercase mb-2">Nouveau</p>
                                        <img 
                                            src={previewUrl} 
                                            className="w-16 h-16 rounded-full object-cover border border-orange" 
                                            alt="Nouvel avatar"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 ml-4">
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={(e) => setAvatarFile(e.target.files[0])} 
                                        className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-orange/20 file:text-orange hover:file:bg-orange hover:file:text-white transition-all cursor-pointer" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Rôles</label>
                        <div className="flex flex-wrap gap-3">
                            {['ROLE_USER', 'ROLE_ADMIN'].map(role => (
                                <button
                                    key={role}
                                    type="button"
                                    onClick={() => handleRoleChange(role)}
                                    disabled={isOwnProfile}
                                    className={`px-4 py-2 rounded-xl border font-bold text-xs transition-all flex items-center gap-2 ${editingUser.roles?.includes(role)
                                            ? 'bg-orange/20 border-orange/50 text-orange'
                                            : 'bg-white/5 border-white/10 text-gray-400 grayscale'
                                        } ${isOwnProfile ? 'cursor-not-allowed opacity-70' : 'hover:border-orange/50'}`}
                                    title={isOwnProfile ? "Vous ne pouvez pas modifier vos propres rôles" : ""}
                                >
                                    {editingUser.roles?.includes(role) && <FaCheck size={10} />}
                                    {role.replace('ROLE_', '')}
                                </button>
                            ))}
                        </div>
                    </div>

                    {updateError && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-sm">{updateError}</div>}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button" onClick={onClose}
                            className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all border border-white/10"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit" disabled={isUpdating}
                            className="flex-1 bg-orange hover:bg-orange/80 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-orange/20 flex justify-center items-center gap-2"
                        >
                            {isUpdating ? <ButtonLoader size={20} /> : 'Sauvegarder les modifications'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
