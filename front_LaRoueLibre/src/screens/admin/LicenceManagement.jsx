import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import { AuthContext } from '../../contexts/AuthContext';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import { FaCheck, FaTimes, FaFileAlt, FaUser, FaPhone } from 'react-icons/fa';

const LicenceManagement = () => {
    const { user } = useContext(AuthContext);
    const [licences, setLicences] = useState([]);
    const [etats, setEtats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedFiles, setSelectedFiles] = useState(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            
            // 1. Charger les états
            const etatsRes = await axios.get(`${API_ROOT}/api/etats`, config);
            const etatsData = etatsRes.data['hydra:member'] || etatsRes.data.member || (Array.isArray(etatsRes.data) ? etatsRes.data : []);
            setEtats(etatsData);

            // 2. Charger les licences
            const res = await axios.get(`${API_ROOT}/api/licences`, config);
            const data = res.data['hydra:member'] || res.data.member || (Array.isArray(res.data) ? res.data : []);
            const sortedData = [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setLicences(sortedData);
        } catch (err) {
            console.error("Erreur fetching data:", err);
            setError("Impossible de charger les données.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user.token]);

    const handleStatusUpdate = async (id, type) => {
        const label = type === 'approve' ? 'Approuvée' : 'Rejetée';
        const targetEtat = etats.find(e => e.label === label);

        if (!targetEtat) {
            alert(`État '${label}' non trouvé dans la configuration.`);
            return;
        }
        
        try {
            await axios.patch(`${API_ROOT}/api/licences/${id}`, 
                { etat: targetEtat['@id'], isActive: false },
                { 
                    headers: { 
                        Authorization: `Bearer ${user.token}`,
                        'Content-Type': 'application/merge-patch+json'
                    } 
                }
            );

            if (type === 'approve') {
                await axios.post(`${API_ROOT}/api/licences/${id}/notify-validation`, {}, { 
                    headers: { Authorization: `Bearer ${user.token}` } 
                });
            }

            fetchData();
        } catch (err) {
            console.error("Erreur mise à jour statut:", err);
            alert("Erreur lors de la mise à jour du statut.");
        }
    };

    if (isLoading) return <div className="flex justify-center py-20"><ButtonLoader size={60} /></div>;

    return (
        <div className="animate-fade-in text-white">
            <div className="mb-8">
                <h1 className="text-3xl font-black italic uppercase tracking-tighter">Gestion des <span className="text-orange">Permis BMX</span></h1>
                <p className="text-gray-400">Validez ou refusez les demandes de licence des utilisateurs.</p>
            </div>

            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl mb-6">{error}</div>}

            <div className="grid grid-cols-1 gap-6">
                {licences.length > 0 ? licences.map((lic) => (
                    <div key={lic.id} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-orange/50 transition-all flex flex-col md:flex-row justify-between items-center gap-6">
                        
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-orange/20 rounded-full flex items-center justify-center text-orange font-bold text-xl uppercase">
                                    {lic.user?.firstname?.[0] || 'U'}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">{lic.user?.firstname} {lic.user?.lastname}</h2>
                                    <p className="text-gray-400 text-sm">{lic.user?.email}</p>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                                    lic.isActive ? 'bg-green-500/10 border-green-500/20 text-green-500' : 
                                    lic.etat?.label === 'Approuvée' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                                    lic.etat?.label === 'Rejetée' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                                    'bg-orange/10 border-orange/20 text-orange'
                                }`}>
                                    {lic.isActive ? 'Actif' : lic.etat?.label || 'En attente'}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-bold">Nationalité</span>
                                    <span>{lic.nationaly}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-bold">Résidence</span>
                                    <span>{lic.country_resid}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-bold">Téléphone</span>
                                    <span className="flex items-center gap-1"><FaPhone className="text-[10px]" /> {lic.phone}</span>
                                </div>
                                <div>
                                    <span className="block text-gray-500 uppercase text-[10px] font-bold">Formule</span>
                                    <span className="text-orange font-bold">{lic.price_licence?.label || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        {/* Pièces Jointes */}
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setSelectedFiles({ title: "Pièce d'Identité", path: lic.identityCardPath })}
                                className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-orange/20 transition-all"
                            >
                                <FaFileAlt className="text-xl text-gray-400" />
                                <span className="text-[10px] font-bold uppercase">ID</span>
                            </button>
                            <button 
                                onClick={() => setSelectedFiles({ title: "Certificat Médical", path: lic.medicalCertificatePath })}
                                className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-orange/20 transition-all"
                            >
                                <FaFileAlt className="text-xl text-gray-400" />
                                <span className="text-[10px] font-bold uppercase">Santé</span>
                            </button>
                            <button 
                                onClick={() => setSelectedFiles({ title: "Photo d'identité", path: lic.photoPath })}
                                className="flex flex-col items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-orange/20 transition-all"
                            >
                                <div className="text-xl">📸</div>
                                <span className="text-[10px] font-bold uppercase">Photo</span>
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-2">
                            {!lic.isActive && (
                                lic.etat?.label?.toLowerCase().trim() === 'en attente' || 
                                lic.etat?.label?.toLowerCase().trim() === 'en attente de validation'
                            ) && (
                                <button 
                                    onClick={() => handleStatusUpdate(lic.id, 'approve')}
                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2"
                                >
                                    <FaCheck /> Valider
                                </button>
                            )}
                            <button 
                                onClick={() => handleStatusUpdate(lic.id, 'reject')}
                                className="bg-white/5 hover:bg-red-500/20 text-red-500 px-6 py-2 rounded-xl font-bold border border-white/10 transition-all flex items-center gap-2"
                            >
                                <FaTimes /> {lic.isActive ? 'Annuler' : 'Refuser'}
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 bg-black/20 rounded-3xl border border-white/10 italic text-gray-500">
                        Aucune demande de permis en attente.
                    </div>
                )}
            </div>

            {/* Viewer de fichiers */}
            {selectedFiles && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
                    <div className="relative w-full max-w-4xl h-[90vh] bg-dark-nigth-blue rounded-3xl border border-white/10 flex flex-col">
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-dark-nigth-blue rounded-t-3xl">
                            <h3 className="text-xl font-bold text-orange">{selectedFiles.title}</h3>
                            <button onClick={() => setSelectedFiles(null)} className="text-gray-400 hover:text-white"><FaTimes size={24} /></button>
                        </div>
                        <div className="flex-1 bg-black/20 p-4 overflow-y-auto custom-scrollbar rounded-b-3xl">
                            {selectedFiles.path ? (
                                selectedFiles.path.toLowerCase().endsWith('.pdf') ? (
                                    <iframe src={`${API_ROOT}${selectedFiles.path}`} className="w-full h-full min-h-[70vh] rounded-xl" title="PDF Preview" />
                                ) : (
                                    <img src={`${API_ROOT}${selectedFiles.path}`} className="w-full h-auto rounded-xl shadow-2xl" alt="Preview" />
                                )
                            ) : (
                                <p className="text-gray-500 italic text-center py-20">Aucun fichier fourni.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LicenceManagement;
