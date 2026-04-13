import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaPrint, FaArrowLeft } from 'react-icons/fa';

const Invoice = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const res = await axios.get(`${API_ROOT}/api/orders/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setOrder(res.data);
            } catch (err) { console.error(err); }
            finally { setIsLoading(false); }
        };
        fetchOrder();
    }, [id, user]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-white"><ButtonLoader /></div>;
    if (!order) return <div className="text-center p-10">Commande non trouvée.</div>;

    const total = order.products.reduce((acc, p) => acc + p.price, 0).toFixed(2);

    return (
        <div className="bg-gray-100 min-h-screen py-10 text-black p-4">
            <div className="max-w-3xl mx-auto bg-white p-10 shadow-xl rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-10 print:hidden">
                    <button onClick={() => navigate('/profile')} className="flex items-center gap-2 text-gray-500 font-bold"><FaArrowLeft/> Retour</button>
                    <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded shadow"><FaPrint/> Imprimer</button>
                </div>
                
                <h1 className="text-3xl font-bold border-b pb-4 mb-4">FACTURE #{order.id}</h1>
                <p className="mb-8">Client : <strong>{user.firstName} {user.lastName}</strong> ({user.email})</p>
                
                <table className="w-full mb-10">
                    <thead><tr className="border-b text-left"><th>Produit</th><th className="text-right">Prix</th></tr></thead>
                    <tbody>
                        {order.products.map((p, i) => (
                            <tr key={i} className="border-b"><td className="py-2">{p.title}</td><td className="text-right">{p.price} €</td></tr>
                        ))}
                    </tbody>
                </table>
                <div className="text-right text-2xl font-bold">TOTAL : {total} €</div>
            </div>
        </div>
    );
};
export default Invoice;