// src/screens/InVoice.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaDownload, FaArrowLeft } from 'react-icons/fa';

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
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchOrder();
    }, [id, user]);

    if (isLoading) return <div className="min-h-screen flex items-center justify-center"><ButtonLoader size={60} /></div>;

    const pdfUrl = order?.path ? `${API_ROOT}${order.path}` : null;

    return (
        <div className="bg-gray-100 min-h-screen py-10 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between mb-6">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-gray-600 hover:text-orange transition">
                        <FaArrowLeft /> Retour
                    </button>
                    {pdfUrl && (
                        <a href={pdfUrl} target="_blank" rel="noreferrer" className="bg-orange text-black px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:scale-105 transition shadow-lg">
                            <FaDownload /> Télécharger la facture officielle (PDF)
                        </a>
                    )}
                </div>

                <div className="bg-white shadow-2xl rounded-xl overflow-hidden h-[80vh] border border-gray-200">
                    {pdfUrl ? (
                        <iframe src={pdfUrl} width="100%" height="100%" title="Facture" className="border-none" />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">Facture non générée.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Invoice;