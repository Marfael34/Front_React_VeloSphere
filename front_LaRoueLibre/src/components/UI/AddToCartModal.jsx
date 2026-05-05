import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaShoppingBag, FaArrowRight, FaTimes } from 'react-icons/fa';

const AddToCartModal = ({ isOpen, onClose, product }) => {
    const navigate = useNavigate();

    // Si la modale n'est pas ouverte, on ne renvoie rien (invisible)
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 transition-opacity">
            {/* Conteneur principal de la modale avec ton design */}
            <div className="bg-nigth-blue border border-slate-grey_06 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl animate-slideup relative">
                
                {/* Bouton de fermeture en haut à droite */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-grey hover:text-white transition-colors"
                >
                    <FaTimes size={20} />
                </button>

                {/* Icône de succès */}
                <div className="flex justify-center mb-4">
                    <div className="bg-dark-nigth-blue p-4 rounded-full border border-slate-grey_06 shadow-[0_0_15px_rgba(242,140,51,0.2)]">
                        <FaCheckCircle className="text-orange text-4xl" />
                    </div>
                </div>

                {/* Textes */}
                <h2 className="text-2xl font-bold text-white text-center mb-2">
                    Ajouté au panier
                </h2>
                
                <p className="text-white_05 text-sm text-center mb-8">
                    {product ? (
                        <>L'article <strong className="text-white">{product.title}</strong> a bien été ajouté à votre panier.</>
                    ) : (
                        "Votre article a bien été ajouté au panier."
                    )}
                </p>

                {/* Boutons d'action */}
                <div className="flex flex-col gap-3">
                    {/* Bouton Principal : Voir le panier */}
                    <button 
                        onClick={() => {
                            onClose(); // On ferme la modale avant de rediriger
                            navigate('/panier');
                        }}
                        className="flex items-center justify-center gap-2 bg-orange hover:bg-[#d97b29] text-black font-bold py-3 px-4 rounded-xl transition-all duration-300 w-full"
                    >
                        <FaShoppingBag /> Voir mon panier
                    </button>

                    {/* Bouton Secondaire : Continuer les achats */}
                    <button 
                        onClick={() => {
                            onClose();
                            navigate('/market');
                        }}
                        className="flex items-center justify-center gap-2 bg-transparent border border-slate-grey_06 text-white_05 hover:text-white hover:bg-white/5 py-3 px-4 rounded-xl transition-all duration-300 w-full font-medium"
                    >
                        Continuer mes achats <FaArrowRight className="text-xs" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToCartModal;