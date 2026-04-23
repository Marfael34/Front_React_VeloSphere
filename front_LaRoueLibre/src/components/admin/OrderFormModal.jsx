import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../Loader/ButtonLoader';
import { FaEdit, FaPlus, FaTimes, FaUser } from 'react-icons/fa';

const OrderFormModal = ({ initialOrder, onClose, onSuccess }) => {
    const { user } = useContext(AuthContext);
    
    const [etatsList, setEtatsList] = useState([]);

    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);

    useEffect(() => {
        console.log("OrderFormModal initialOrder:", initialOrder);
    }, [initialOrder]);

    const extractId = (data) => {
        if (!data) return null;
        if (typeof data === 'object') return data.id;
        if (typeof data === 'string') {
            const parts = data.split('/');
            return parts[parts.length - 1];
        }
        return null;
    };

    const [editingOrder, setEditingOrder] = useState({
        id: initialOrder.id,
        etatIri: initialOrder.etats?.length ? `/api/etats/${initialOrder.etats[initialOrder.etats.length - 1].id || extractId(initialOrder.etats[initialOrder.etats.length - 1])}` : ''
    });

    useEffect(() => {
        const fetchDependencies = async () => {
            try {
                const [etatsRes] = await Promise.all([
                    axios.get(`${API_ROOT}/api/etats`)
                ]);
                
                setEtatsList(etatsRes.data['hydra:member'] || etatsRes.data.member || etatsRes.data || []);
            } catch (error) {
                console.error("Erreur lors du chargement des dépendances", error);
            }
        };
        fetchDependencies();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditingOrder(prev => ({ ...prev, [name]: value }));
    };

    const handleProductsChange = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(options[i].value);
            }
        }
        setEditingOrder(prev => ({ ...prev, productIris: selectedValues }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateError(null);

        try {
            const payload = {
                etats: [editingOrder.etatIri]
            };

            if (editingOrder.id) {
                await axios.patch(`${API_ROOT}/api/orders/${editingOrder.id}`, payload, {
                    headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'application/merge-patch+json' }
                });
            }

            onSuccess();
        } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            setUpdateError((editingOrder.id ? "Erreur lors de la mise à jour. " : "Erreur lors de la création. ") + (err.response?.data?.['hydra:description'] || err.message));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-nigth-blue border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideup">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        <FaEdit className="text-orange" />
                        Modifier la commande : {initialOrder.user?.firstname ? `${initialOrder.user.firstname} ${initialOrder.user.lastname}` : (typeof initialOrder.user === 'string' ? initialOrder.user : 'Client inconnu')}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Client</label>
                            <div className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white flex items-center gap-3">
                                <FaUser className="text-gray-500" />
                                <div>
                                    <p className="font-bold">
                                        {initialOrder.user?.firstname ? `${initialOrder.user.firstname} ${initialOrder.user.lastname}` : (typeof initialOrder.user === 'string' ? 'Chargement...' : 'Client inconnu')}
                                    </p>
                                    <p className="text-xs text-gray-400">{initialOrder.user?.email || (typeof initialOrder.user === 'string' ? initialOrder.user : '')}</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Statut (État)</label>
                            <select
                                name="etatIri" value={editingOrder.etatIri} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all appearance-none"
                            >
                                <option value="" className="bg-dark-nigth-blue">-- Sélectionner un statut --</option>
                                {etatsList.map(e => (
                                    <option key={e.id} value={`/api/etats/${e.id}`} className="bg-dark-nigth-blue">
                                        {e.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Produits commandés</label>
                            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                                {initialOrder.products?.map((p, idx) => (
                                    <div key={idx} className="px-4 py-3 flex justify-between items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                        <span className="text-white font-medium">{p.title}</span>
                                        <span className="text-orange font-black">{(p.price / 100).toFixed(2)} €</span>
                                    </div>
                                ))}
                                {(!initialOrder.products || initialOrder.products.length === 0) && (
                                    <div className="px-4 py-8 text-center text-gray-500 italic">Aucun produit dans cette commande</div>
                                )}
                            </div>
                            <div className="flex justify-between items-center px-4 py-3 bg-white/5 mt-2 rounded-xl">
                                <span className="text-sm text-gray-400 uppercase font-bold tracking-widest">Total</span>
                                <span className="text-xl text-white font-black">
                                    {(initialOrder.products?.reduce((acc, p) => acc + (p.price || 0), 0) / 100).toFixed(2)} €
                                </span>
                            </div>
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

export default OrderFormModal;
