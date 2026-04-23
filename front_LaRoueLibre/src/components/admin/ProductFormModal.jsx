import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../Loader/ButtonLoader';
import { FaEdit, FaPlus, FaTimes } from 'react-icons/fa';

const ProductFormModal = ({ initialProduct, onClose, onSuccess }) => {
    const { user } = useContext(AuthContext);
    const [editingProduct, setEditingProduct] = useState(initialProduct);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateError, setUpdateError] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        if (!imageFile) return;
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewUrl(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
    }, [imageFile]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let parsedValue = value;
        if (name === 'price') {
            parsedValue = value === '' ? '' : parseFloat(value);
        } else if (name === 'quantity') {
            parsedValue = value === '' ? '' : parseInt(value, 10);
        }
        setEditingProduct(prev => ({ ...prev, [name]: parsedValue }));
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        setUpdateError(null);

        try {
            const payload = {
                title: editingProduct.title,
                description: editingProduct.description,
                price: Math.round((parseFloat(editingProduct.price) || 0) * 100),
                brand: editingProduct.brand,
                quantity: parseInt(editingProduct.quantity, 10) || 0,
                imagePath: editingProduct.imagePath || null
            };

            let productId = editingProduct.id;

            if (productId) {
                await axios.put(`${API_ROOT}/api/products/${productId}`, payload, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/ld+json'
                    }
                });
            } else {
                const res = await axios.post(`${API_ROOT}/api/products`, payload, {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/ld+json'
                    }
                });
                productId = res.data.id;
            }

            if (imageFile && productId) {
                const imgData = new FormData();
                imgData.append('file', imageFile);
                await axios.post(`${API_ROOT}/api/products/${productId}/image`, imgData, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
            }

            onSuccess();
        } catch (err) {
            console.error("Erreur lors de la sauvegarde:", err);
            setUpdateError((editingProduct.id ? "Erreur lors de la mise à jour du produit. " : "Erreur lors de la création du produit. ") + (err.response?.data?.['hydra:description'] || err.message));
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-nigth-blue border border-white/10 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideup">
                <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                    <h2 className="text-xl font-bold flex items-center gap-3">
                        {editingProduct.id ? <FaEdit className="text-orange" /> : <FaPlus className="text-orange" />}
                        {editingProduct.id ? 'Modifier le produit' : 'Créer un produit'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                <form onSubmit={handleUpdateSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Titre</label>
                            <input
                                type="text" name="title" value={editingProduct.title || ''} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Prix (€)</label>
                            <input
                                type="number" step="0.01" name="price" value={editingProduct.price !== undefined ? editingProduct.price : ''} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Quantité en stock</label>
                            <input
                                type="number" name="quantity" value={editingProduct.quantity !== undefined ? editingProduct.quantity : ''} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Marque</label>
                            <input
                                type="text" name="brand" value={editingProduct.brand || ''} onChange={handleInputChange} required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Image</label>
                            <div className="flex gap-6 items-center bg-black/20 p-4 rounded-xl border border-white/5">
                                <div className="text-center">
                                    <p className="text-[10px] text-gray-400 uppercase mb-2">Actuel</p>
                                    <img
                                        src={editingProduct.imagePath ? (editingProduct.imagePath.startsWith('/') ? `${API_ROOT}${editingProduct.imagePath}` : `${IMAGE_URL}/products/${editingProduct.imagePath}`) : `${IMAGE_URL}/default/default_product.png`}
                                        alt="Aperçu actuel"
                                        className="w-16 h-16 rounded-xl object-cover border border-white/10 shrink-0"
                                    />
                                </div>
                                {previewUrl && (
                                    <div className="text-center">
                                        <p className="text-[10px] text-orange uppercase mb-2">Nouveau</p>
                                        <img 
                                            src={previewUrl} 
                                            className="w-16 h-16 rounded-xl object-cover border border-orange shrink-0" 
                                            alt="Nouvel aperçu"
                                        />
                                    </div>
                                )}
                                <div className="flex-1 ml-4">
                                    <input
                                        type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}
                                        className="text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange/20 file:text-orange hover:file:bg-orange hover:file:text-white transition-all cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-bold text-gray-400 uppercase tracking-wider">Description</label>
                            <textarea
                                name="description" value={editingProduct.description || ''} onChange={handleInputChange} rows={3}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-orange outline-none transition-all resize-none"
                            ></textarea>
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
                            {isUpdating ? <ButtonLoader size={20} /> : (editingProduct.id ? 'Sauvegarder les modifications' : 'Créer le produit')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProductFormModal;
