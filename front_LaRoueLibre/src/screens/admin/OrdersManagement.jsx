import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import { FaEdit, FaTrashAlt, FaPlus, FaShoppingBag, FaUser, FaCheckCircle } from 'react-icons/fa';
import OrderFormModal from '../../components/admin/OrderFormModal';

const OrdersManagement = () => {
    const { user } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const [editingOrder, setEditingOrder] = useState(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log("Fetching orders with token:", user.token);
            const response = await axios.get(`${API_ROOT}/api/orders`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            console.log("Orders response data:", response.data);
            const data = response.data['hydra:member'] || response.data.member || response.data || [];
            console.log("Parsed orders:", data);
            setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur fetching orders:", err);
            setError("Impossible de charger les commandes. " + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (order, statusId) => {
        try {
            // Dans API Platform, pour un ManyToMany, envoyer un tableau d'IRI remplace la collection
            await axios.patch(`${API_ROOT}/api/orders/${order.id}`, {
                etats: [`/api/etats/${statusId}`]
            }, {
                headers: { 
                    Authorization: `Bearer ${user.token}`,
                    'Content-Type': 'application/merge-patch+json'
                }
            });
            fetchOrders();
        } catch (err) {
            console.error("Erreur mise à jour statut:", err);
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [user.token]);

    const handleEditClick = (order) => {
        setEditingOrder(order);
    };

    const handleAddClick = null; // Supprimé à la demande de l'utilisateur

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Payées': 
            case 'Validées':
            case 'Livrées': return 'bg-green-500/20 text-green-400 border-green-500/30';
            case 'En attentes de paiement':
            case 'En attente de validation':
            case 'En cours de préparation':
            case 'En cours de livraison': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
            case 'Annulées': return 'bg-red-500/20 text-red-400 border-red-500/30';
            default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><ButtonLoader size={60} /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="title-h2">Gestion des Commandes</h1>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-2">
                        Total: <span className="text-orange font-bold">{orders.length}</span> commandes
                    </div>
                </div>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 font-bold text-gray-300">N° Commande</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Client</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Date</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Total</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Statut</th>
                            <th className="px-6 py-4 font-bold text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-20 text-center text-gray-500">
                                    <FaShoppingBag className="mx-auto mb-4 opacity-20" size={40} />
                                    <p className="text-lg font-semibold">Aucune commande trouvée</p>
                                    <p className="text-sm">Les commandes apparaîtront ici dès qu'un client effectuera un achat.</p>
                                </td>
                            </tr>
                        ) : (
                            orders.map((o) => {
                                const total = o.products?.reduce((acc, p) => acc + (p.price || 0), 0) || 0;
                                const currentStatus = o.etats?.[o.etats.length - 1]?.label || "En attente";

                                return (
                                    <tr key={o.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 font-mono text-xs text-orange">
                                                <FaShoppingBag size={12} />
                                                ORD-{o.id ? o.id.toString().padStart(5, '0') : '????'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-white">
                                                <FaUser size={14} className="text-gray-500" />
                                                <span>
                                                    {o.user?.firstname ? `${o.user.firstname} ${o.user.lastname}` : (typeof o.user === 'string' ? o.user : 'Client inconnu')}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-400 text-sm">
                                            {o.created_at ? new Date(o.created_at).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 font-black text-white">{(total / 100).toFixed(2)} €</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(currentStatus)}`}>
                                                {currentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {currentStatus === 'Payées' && (
                                                    <button 
                                                        onClick={() => handleStatusUpdate(o, 13)}
                                                        className="p-2 hover:bg-green-500/20 text-green-500 rounded-lg transition-all" title="Valider la commande"
                                                    >
                                                        <FaCheckCircle size={18} />
                                                    </button>
                                                )}

                                                <div className="w-px h-8 bg-white/10 mx-1"></div>
                                                <button 
                                                    onClick={() => handleEditClick(o)}
                                                    className="p-2 hover:bg-orange/20 text-orange rounded-lg transition-all" title="Modifier"
                                                >
                                                    <FaEdit size={18} />
                                                </button>
                                                <button className="p-2 hover:bg-red-500/20 text-red-500 rounded-lg transition-all" title="Supprimer">
                                                    <FaTrashAlt size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* MODAL D'ÉDITION / CRÉATION */}
            {editingOrder && (
                <OrderFormModal 
                    initialOrder={editingOrder} 
                    onClose={() => setEditingOrder(null)} 
                    onSuccess={() => { setEditingOrder(null); fetchOrders(); }} 
                />
            )}
        </div>
    );
};

export default OrdersManagement;
