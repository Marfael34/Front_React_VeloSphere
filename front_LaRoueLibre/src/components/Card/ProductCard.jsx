import React from 'react';
import { Link } from 'react-router-dom';
import { API_ROOT, IMAGE_URL } from '../../constants/apiConstant';

const ProductCard = ({ product }) => {
    
    const productId = product?.id ?? 0;
    const productTitle = product?.title ?? "Produit inconnu";
    const productPrice = product?.price ? `${product?.price / 100} €` : "Prix non renseigné";
    const productBrand = product?.brand ?? "Marque inconnue"; 
    
    // L'image utilise la constante IMAGE_URL (http://localhost:8087/images)
    // Assurez-vous que vos images soient dans le dossier public/images/ de Symfony
    const imageUrl = product.imagePath ? (product.imagePath.startsWith('/') ? `${API_ROOT}${product.imagePath}` : `${API_ROOT}/images/products/${product.imagePath}`) : `${IMAGE_URL}/default/default_product.png`;

  return (
    <div className='flex flex-col items-center w-65.5 p-4 bg-nigth-blue hover:bg-dark-nigth-blue_09 transition-all ease-in-out duration-500 animate-slideup rounded-lg cursor-pointer group'>
        <div className="relative w-full flex flex-col">
            
            {/* Image du produit cliquable */}
            <Link to={`/product/${productId}`} className="relative group">
                <img 
                    src={imageUrl}
                    alt={`Image du produit ${productTitle}`} 
                    className={`mx-auto rounded-lg object-cover h-52 w-52 bg-white/10 ${product.quantity <= 0 ? 'grayscale opacity-60' : ''}`}
                    onError={(e) => { e.target.src = `${IMAGE_URL}/default/default_product.png`; }}
                />
                {product.quantity <= 0 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-600/90 text-white px-3 py-1.5 rounded-lg font-black text-xs uppercase tracking-widest shadow-xl border border-red-500/50 backdrop-blur-sm whitespace-nowrap rotate-[-5deg]">
                        Rupture de stock
                    </div>
                )}
            </Link>

            {/* Bouton d'action au survol */}
            <div className={`absolute hidden group-hover:flex right-3 bottom-5`}>
                <Link 
                    to={`/product/${productId}`}
                    className="group-hover:animate-slideup2 bg-orange hover:bg-orange/80 text-black px-4 py-2 font-bold rounded-full shadow-lg transition-colors duration-200"
                >
                    Voir
                </Link>
            </div>

            {/* Informations sous l'image */}
            <Link to={`/product/${productId}`}>
                <div className="mt-4 flex flex-col">
                    <p className="text-white text-xl truncate font-bold">{productTitle}</p>
                    <div className="flex justify-between items-center mt-1">
                        {/* Affiche la marque (brand) à gauche et le prix à droite */}
                        <p className="text-slate-grey_06 text-sm truncate">{productBrand}</p>
                        <p className="text-orange font-bold">{productPrice}</p>
                    </div>
                </div>
            </Link>

        </div>
    </div>
  );
}

export default ProductCard;