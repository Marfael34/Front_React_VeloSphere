import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa';
import ProductFormModal from '../../components/admin/ProductFormModal';

const ProductsManagement = () => {
    const { user } = useContext(AuthContext);
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // État pour le mode édition
    const [editingProduct, setEditingProduct] = useState(null);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_ROOT}/api/products`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            const data = response.data['hydra:member'] || response.data['member'] || response.data || [];
            setProducts(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Erreur fetching products:", err);
            setError("Impossible de charger les produits.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [user.token]);

    const handleEditClick = (product) => {
        setEditingProduct({ ...product, price: product.price !== undefined ? product.price / 100 : 0 });
    };

    const handleAddClick = () => {
        setEditingProduct({
            title: '',
            description: '',
            price: 0,
            brand: '',
            quantity: 0,
            imagePath: ''
        });
    };

    if (isLoading) return <div className="flex justify-center py-20"><ButtonLoader size={60} /></div>;

    return (
        <div className="animate-fade-in relative">
            <div className="flex justify-between items-center mb-8">
                <h1 className="title-h2">Gestion des Produits</h1>
                <button 
                    onClick={handleAddClick}
                    className="flex items-center gap-2 bg-orange hover:bg-orange/80 text-white px-4 py-2 rounded-lg transition-colors font-bold shadow-lg shadow-orange/20"
                >
                    <FaPlus /> Ajouter un produit
                </button>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

            <div className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 border-b border-white/10">
                            <th className="px-6 py-4 font-bold text-gray-300">Produit</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Prix</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Stock</th>
                            <th className="px-6 py-4 font-bold text-gray-300">Marque</th>
                            <th className="px-6 py-4 font-bold text-gray-300 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-lg overflow-hidden bg-white/10 border border-white/5 shrink-0">
                                            <img
                                                src={p.imagePath ? `${IMAGE_URL}/products/${p.imagePath}` : `${IMAGE_URL}/default/default_product.png`}
                                                alt={p.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-white group-hover:text-orange transition-colors">{p.title}</div>
                                            <div className="text-xs text-gray-400 truncate max-w-[200px]">{p.description?.substring(0, 50)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 font-black text-orange">{(p.price / 100).toFixed(2)} €</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.quantity > 0 ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                                        {p.quantity > 0 ? `${p.quantity} en stock` : 'Rupture'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-bold uppercase tracking-widest">
                                        {p.brand || "LaRoueLibre"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-3">
                                        <button
                                            onClick={() => handleEditClick(p)}
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
                        ))}
                    </tbody>
                </table>
            </div>

            {/* MODAL D'ÉDITION */}
            {editingProduct && (
                <ProductFormModal 
                    initialProduct={editingProduct} 
                    onClose={() => setEditingProduct(null)} 
                    onSuccess={() => { setEditingProduct(null); fetchProducts(); }} 
                />
            )}
        </div>
    );
};

export default ProductsManagement;
