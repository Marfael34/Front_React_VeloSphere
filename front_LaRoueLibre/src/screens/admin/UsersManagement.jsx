import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT, AVATAR_URL, IMAGE_URL } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import { FaUserEdit, FaTrashAlt, FaUserPlus } from 'react-icons/fa';
import UserFormModal from '../../components/admin/UserFormModal';

const UsersManagement = () => {
    const { user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // État pour le mode édition
    const [editingUser, setEditingUser] = useState(null);

    const fetchUsers = async () => {
        setIsLoading(true);

        try {
            const response = await axios.get(`${API_ROOT}/api/users`, {
                headers: { Authorization: `Bearer ${currentUser.token}` }
            });
            // On gère plusieurs formats possibles de réponse
            const data = response.data['hydra:member'] || response.data['member'] || response.data || [];
            console.log("Données utilisateurs reçues:", data);
            setUsers(Array.isArray(data) ? data : []);

        } catch (err) {
            console.error("Erreur fetching users:", err);
            setError("Impossible de charger les utilisateurs. " + (err.response?.data?.['hydra:description'] || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [currentUser.token]);

    const handleEditClick = (user) => {
        setEditingUser({ ...user });
    };

    const handleAddClick = () => {
        setEditingUser({
            firstname: '',
            lastname: '',
            email: '',
            pseudo: '',
            roles: ['ROLE_USER'],
            avatar: null
        });
    };

    const handleToggleActive = async (id, currentStatus) => {
        if (id === currentUser.id) {
            alert("Vous ne pouvez pas désactiver votre propre compte.");
            return;
        }

        const action = currentStatus ? "désactiver" : "réactiver";
        if (!window.confirm(`Voulez-vous vraiment ${action} cet utilisateur ?`)) return;

        try {
            await axios.patch(`${API_ROOT}/api/users/${id}`, 
                { is_active: !currentStatus },
                { 
                    headers: { 
                        Authorization: `Bearer ${currentUser.token}`,
                        'Content-Type': 'application/merge-patch+json'
                    } 
                }
            );
            fetchUsers();
        } catch (err) {
            console.error("Erreur statut utilisateur:", err);
            alert("Impossible de modifier le statut de l'utilisateur. " + (err.response?.data?.['hydra:description'] || err.message));
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><ButtonLoader size={60} /></div>;

    return (
        <div className="animate-fade-in relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="title-h2">Gestion des Utilisateurs</h1>
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-orange hover:bg-orange/80 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-lg shadow-orange/20"
                >
                    <FaUserPlus /> Ajouter un utilisateur
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 font-bold text-gray-300">Nom / Prénom</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Email</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Statut</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Rôles</th>
                            <th className="px-6 py-4 font-bold text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full overflow-hidden bg-white/10 border border-white/5 shrink-0">
                                            <img
                                                src={u.avatar ? (u.avatar.startsWith('/') ? `${API_ROOT}${u.avatar}` : `${AVATAR_URL}/${u.avatar}`) : `${IMAGE_URL}/default/avatar/default-avatar-1.png`}
                                                alt={u.firstname}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { e.target.onerror = null; e.target.src = `${IMAGE_URL}/default/avatar/default-avatar-1.png`; }}
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white group-hover:text-orange transition-colors">
                                                {u.lastname} {u.firstname}
                                            </div>
                                            <div className="text-xs text-gray-500">@{u.pseudo || 'pas de pseudo'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                <td className="px-6 py-4">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest ${Number(u.is_active ?? u.isActive ?? 1) === 0 ? 'bg-red-500/20 text-red-500 border border-red-500/20' : 'bg-green-500/20 text-green-500 border border-green-500/20'}`}>
                                        {Number(u.is_active ?? u.isActive ?? 1) === 0 ? 'Inactif' : 'Actif'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-2">
                                        {u.roles?.map(role => (
                                            <span key={role} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 uppercase font-black">
                                                {role.replace('ROLE_', '')}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => handleEditClick(u)}
                                            className="p-2 hover:bg-orange/20 text-orange rounded-lg transition-all" title="Modifier"
                                        >
                                            <FaUserEdit size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleToggleActive(u.id, Number(u.is_active ?? u.isActive ?? 1) !== 0)}
                                            className={`p-2 rounded-lg transition-all ${Number(u.is_active ?? u.isActive ?? 1) === 0 ? 'hover:bg-green-500/20 text-green-500' : 'hover:bg-red-500/20 text-red-500'}`} 
                                            title={Number(u.is_active ?? u.isActive ?? 1) === 0 ? "Réactiver" : "Désactiver"}
                                            disabled={u.id === currentUser.id}
                                        >
                                            <FaTrashAlt size={18} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL D'ÉDITION */}
            {editingUser && (
                <UserFormModal 
                    initialUser={editingUser} 
                    onClose={() => setEditingUser(null)} 
                    onSuccess={() => { setEditingUser(null); fetchUsers(); }} 
                />
            )}
        </div>
    );
};

export default UsersManagement;
