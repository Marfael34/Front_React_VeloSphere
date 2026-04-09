import React from 'react';
import { Link } from 'react-router-dom';
import { IMAGE_URL } from '../../constants/apiConstant';

const ProductCard = ({ product }) => {
    
    // 1. On utilise les VRAIS noms de vos propriétés Symfony
    const productId = product?.id ?? 0;
    const productTitle = product?.title ?? "Produit inconnu"; // Modifié : title au lieu de name
    const productPrice = product?.price ? `${product?.price} €` : "Prix non renseigné";
    const productBrand = product?.brand ?? "Marque inconnue"; // Modifié : on utilise brand
    
    // 2. L'image utilise la constante IMAGE_URL (http://localhost:8087/images)
    // Assurez-vous que vos images soient dans le dossier public/images/ de Symfony
    const imgProduct = product?.imagePath 
        ? `${IMAGE_URL}/${product.imagePath}` 
        : 'https://via.placeholder.com/200'; // Image par défaut de secours

  return (
    <div className='flex flex-col items-center w-65.5 p-4 bg-dark-nigth-blue hover:bg-dark-nigth-blue_05 transition-all ease-in-out duration-500 animate-slideup rounded-lg cursor-pointer group'>
        <div className="relative w-full flex flex-col">
            
            {/* Image du produit cliquable */}
            <Link to={`/product/${productId}`} >
                <img 
                    src={imgProduct}
                    alt={`Image du produit ${productTitle}`} 
                    className="mx-auto rounded-lg object-cover h-52 w-52 bg-white/10" 
                />
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