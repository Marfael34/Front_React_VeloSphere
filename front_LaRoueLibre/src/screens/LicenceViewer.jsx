// src/screens/LicenceViewer.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ROOT } from '../constants/apiConstant';
import { AuthContext } from '../contexts/AuthContext';
import ButtonLoader from '../components/Loader/ButtonLoader';
import { FaDownload, FaArrowLeft, FaIdCard, FaCheckCircle, FaFilePdf } from 'react-icons/fa';

const LicenceViewer = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [licence, setLicence] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0); // Revenir en haut de page au chargement
        const fetchLicence = async () => {
            try {
                const res = await axios.get(`${API_ROOT}/api/licences/${id}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setLicence(res.data);
            } catch (err) {
                console.error("Erreur chargement licence:", err);
            } finally {
                setIsLoading(false);
            }
        };
        if (user) fetchLicence();
    }, [id, user]);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue">
            <ButtonLoader size={60} />
        </div>
    );

    if (!licence) return (
        <div className="min-h-screen flex items-center justify-center bg-dark-nigth-blue text-white">
            <p>Licence introuvable.</p>
        </div>
    );

    const pdfUrl = licence.pdfPath ? `${API_ROOT}${licence.pdfPath}` : null;

    return (
        <div className="bg-dark-nigth-blue min-h-screen pb-10">
            {/* Header Mobile / Navigation */}
            <div className="bg-black/40 backdrop-blur-md border-b border-white/5 sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 font-bold text-white/60 hover:text-orange transition">
                        <FaArrowLeft /> Retour
                    </button>
                    <h1 className="text-sm font-black uppercase italic tracking-tighter text-white">Mon Permis <span className="text-orange">BMX</span></h1>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 pt-8">
                {/* Résumé de la licence (Card Mobile) */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 mb-8 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="flex items-start justify-between relative z-10 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-orange/20 rounded-2xl flex items-center justify-center text-orange text-3xl">
                                <FaIdCard />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">Licence #{licence.id}</h2>
                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{licence.price_licence?.label}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="bg-green-500/20 text-green-400 border border-green-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                <FaCheckCircle size={10} /> Active
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Titulaire</p>
                            <p className="text-white font-bold">{licence.user?.firstname} {licence.user?.lastname}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-black uppercase mb-1">Validité</p>
                            <p className="text-orange font-black italic">31 Décembre 2026</p>
                        </div>
                    </div>

                    {pdfUrl && (
                        <div className="mt-8">
                            <a 
                                href={pdfUrl} 
                                download 
                                className="w-full bg-orange hover:bg-orange/80 text-black py-4 rounded-2xl font-black text-center flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl shadow-orange/20"
                            >
                                <FaDownload /> Télécharger le PDF Officiel
                            </a>
                        </div>
                    )}
                </div>

                {/* Visualisation PDF */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-4">
                        <FaFilePdf className="text-orange" /> Aperçu du document officiel
                    </h3>
                    
                    <div className="bg-white rounded-3xl border border-white/5 overflow-hidden shadow-2xl h-[500px] sm:h-[80vh] relative">
                        {pdfUrl ? (
                            <object 
                                data={pdfUrl} 
                                type="application/pdf" 
                                width="100%" 
                                height="100%"
                                className="w-full h-full"
                            >
                                <iframe 
                                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(window.location.origin + licence.pdfPath)}&embedded=true`}
                                    width="100%" 
                                    height="100%" 
                                    title="Aperçu Licence" 
                                    className="border-none w-full h-full" 
                                />
                            </object>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-dark-nigth-blue space-y-4">
                                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center text-3xl">🚫</div>
                                <p className="font-bold italic">Le document PDF n'est pas encore disponible.</p>
                            </div>
                        )}
                    </div>
                    
                    <p className="text-[10px] text-gray-500 italic text-center px-6">
                        Note : Si l'aperçu ne s'affiche pas, utilisez le bouton "Télécharger" ci-dessus.
                    </p>
                </div>

                <div className="mt-10 text-center">
                    <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest italic">
                        © 2026 La Roue Libre - Fédération Française de Cyclisme
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LicenceViewer;
