import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import CustomInput from '../components/UI/CustomInput';
import ButtonLoader from '../components/Loader/ButtonLoader';
import ErrorMessage from '../components/UI/ErrorMessage';

const EditProduct = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const [title, setTitle] = useState("");
    const [price, setPrice] = useState("");
    const [brand, setBrand] = useState("");
    const [description, setDescription] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(`${API_ROOT}/api/products/${id}`);
                const p = response.data;
                setTitle(p.title || "");
                // Affichage du prix en Euros (conversion depuis les centimes)
                setPrice(p.price ? (p.price / 100).toString() : "");
                setBrand(p.brand || "");
                setDescription(p.description || "");
            } catch (error) {
                setError("Impossible de charger le produit.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            // Reconversion du prix en centimes avant l'envoi en base de données
            const priceInCents = Math.round(parseFloat(price) * 100);

            await axios.patch(
                `${API_ROOT}/api/products/${id}`,
                { 
                    title, 
                    price: priceInCents, 
                    brand, 
                    description 
                },
                {
                    headers: {
                        'Content-Type': 'application/merge-patch+json',
                        'Authorization': `Bearer ${user?.token}`
                    }
                }
            );
            navigate(`/product/${id}`);
        } catch (error) {
            setError("Erreur lors de la mise à jour du produit.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue"><ButtonLoader /></div>;

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen px-4 py-8 bg-dark-nigth-blue text-white">
            <div className="w-full max-w-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
                <h1 className="title-h1 text-center">Modifier le produit</h1>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <CustomInput 
                        label="Nom du produit" 
                        state={title} 
                        type="text" 
                        callable={(e) => setTitle(e.target.value)} 
                    />
                    <CustomInput 
                        label="Marque" 
                        state={brand} 
                        type="text" 
                        callable={(e) => setBrand(e.target.value)} 
                    />
                    <CustomInput 
                        label="Prix (€)" 
                        state={price} 
                        type="number" 
                        step="0.01"
                        callable={(e) => setPrice(e.target.value)} 
                    />
                    
                    <div className="mb-5">
                        <label className="block text-white font-semibold mb-2 text-sm">Description</label>
                        <textarea 
                            className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-white_01 text-white focus:outline-none focus:ring-2 focus:ring-orange/30 transition duration-200"
                            rows="4"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    {error && <ErrorMessage message={error} />}

                    <div className="flex gap-4 pt-4">
                        <button 
                            type="button" 
                            onClick={() => navigate(-1)}
                            className="flex-1 px-6 py-3 font-bold rounded-full border border-white/20 hover:bg-white/10 transition"
                        >
                            Annuler
                        </button>
                        <button 
                            type="submit" 
                            className="flex-1 main-button"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? <ButtonLoader size={20} /> : "Enregistrer"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProduct;