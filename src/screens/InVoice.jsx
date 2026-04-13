import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaPrint, FaArrowLeft, FaFileInvoice } from 'react-icons/fa';

const Invoice = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [invoiceProducts, setInvoiceProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrderAndProducts = async () => {
            try {
                // 1. Récupération de la commande de base
                const res = await axios.get(`${API_ROOT}/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const orderData = res.data;
                setOrder(orderData);

                // 2. Vérification et récupération des vrais produits (si ce sont des IRI)
                let fullProducts = [];
                if (orderData.products && orderData.products.length > 0) {
                    if (typeof orderData.products[0] === 'string') {
                        // Ce sont des liens (IRIs), on va chercher les infos de chaque produit
                        const productPromises = orderData.products.map(iri => 
                            axios.get(`${API_ROOT}${iri}`).then(p => p.data)
                        );
                        fullProducts = await Promise.all(productPromises);
                    } else {
                        // Ce sont déjà des objets complets
                        fullProducts = orderData.products;
                    }
                }

                // 3. Regroupement pour calculer la QUANTITÉ
                const grouped = {};
                fullProducts.forEach(p => {
                    if (!grouped[p.id]) {
                        grouped[p.id] = { ...p, quantity: 1 };
                    } else {
                        grouped[p.id].quantity += 1;
                    }
                });
                
                // On transforme l'objet en tableau pour l'affichage
                setInvoiceProducts(Object.values(grouped));

            } catch (error) {
                console.error("Erreur lors de la récupération de la facture :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderAndProducts();
    }, [id, user, navigate]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-100"><ButtonLoader size={60} /></div>;
    if (!order) return <div className="text-center mt-20 text-red-500 font-bold">Facture introuvable.</div>;

    // Calcul du total en fonction de la quantité
    const total = invoiceProducts.reduce((acc, p) => acc + ((parseFloat(p.price) || 0) * p.quantity), 0).toFixed(2);

    return (
        <div className="bg-gray-100 min-h-screen py-10 text-black">
            <div className="max-w-3xl mx-auto">
                
                {/* --- BOUTONS D'ACTION --- */}
                <div className="flex justify-between mb-6 print:hidden px-4">
                    <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-600 hover:text-orange font-bold">
                        <FaArrowLeft /> Retour au profil
                    </button>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition">
                        <FaPrint /> Imprimer / PDF
                    </button>
                </div>

                {/* --- FACTURE --- */}
                <div className="bg-white p-10 shadow-2xl rounded-xl border border-gray-200">
                    <div className="flex justify-between border-b-2 border-gray-100 pb-8 mb-8">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <FaFileInvoice className="text-blue-900" size={32} />
                                <h1 className="text-4xl font-black text-blue-900 tracking-tighter">FACTURE</h1>
                            </div>
                            <p className="text-gray-500 font-medium">Commande N° {order.id}</p>
                            <p className="text-gray-400 text-sm">Date : {new Date().toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-2xl font-bold text-gray-800">Ton Site E-commerce</h2>
                            <p className="text-gray-500 text-sm mt-1">123 Rue du Commerce<br/>75000 Paris, France<br/>contact@tonsite.fr</p>
                        </div>
                    </div>

                    <div className="mb-10 bg-gray-50 p-6 rounded-lg border border-gray-100">
                        <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Facturé à :</h3>
                        <p className="text-lg font-bold text-gray-800">{user.firstName} {user.lastName}</p>
                        <p className="text-gray-600">{user.email}</p>
                    </div>

                    <table className="w-full text-left mb-8">
                        <thead>
                            <tr className="bg-blue-900 text-white text-sm uppercase">
                                <th className="py-3 px-4 rounded-tl-lg font-semibold">Produit</th>
                                <th className="py-3 px-4 text-center font-semibold">Qté</th>
                                <th className="py-3 px-4 text-right font-semibold">Prix Unitaire</th>
                                <th className="py-3 px-4 text-right font-semibold rounded-tr-lg">Total Ligne</th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoiceProducts.length > 0 ? invoiceProducts.map((product, index) => (
                                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium text-gray-800">
                                        {product.title || "Produit sans nom"}
                                        <span className="block text-xs text-gray-400 font-normal mt-1">Marque: {product.brand || 'N/A'}</span>
                                    </td>
                                    <td className="py-4 px-4 text-center font-bold text-gray-600">x{product.quantity}</td>
                                    <td className="py-4 px-4 text-right text-gray-600">{parseFloat(product.price).toFixed(2)} €</td>
                                    <td className="py-4 px-4 text-right font-bold text-gray-800">{(product.price * product.quantity).toFixed(2)} €</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="py-4 text-center text-gray-400 italic">Aucun produit dans cette commande.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-end border-t-2 border-gray-100 pt-6">
                        <div className="w-1/2">
                            <div className="flex justify-between text-gray-600 mb-2">
                                <span>Sous-total HT</span>
                                <span>{(total / 1.2).toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-gray-600 mb-2">
                                <span>TVA (20%)</span>
                                <span>{(total - (total / 1.2)).toFixed(2)} €</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black text-blue-900 mt-4 pt-4 border-t border-gray-200">
                                <span>TOTAL TTC</span>
                                <span>{total} €</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Invoice;