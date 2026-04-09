import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { API_ROOT } from '../../constants/apiConstant';
import ProductSuggestion from '../../components/Market/ProductSuggestion';
import ButtonLoader from '../../components/Loader/ButtonLoader';
import CustomButton from '../../components/UI/CustomButton';
import { AuthContext } from '../../contexts/AuthContext';
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaRegUserCircle } from "react-icons/fa";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // On récupère "user" depuis le contexte global
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API_ROOT}/api/products`);
        const productsData = response.data.member || response.data['hydra:member'] || [];
        setProducts(productsData);
      } catch (error) {
        console.error("Erreur lors du chargement des produits :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center min-h-screen px-4 md:px-6 pt-5 bg-opacity-50">
        <div className="flex flex-col gap-5 justify-center items-center p-5 w-full max-w-7xl bg-dark-nigth-blue border border-slate-grey rounded-xl">
          
            <h2 className="text-xl md:text-5xl lg:text-6xl text-white font-bold text-center ">
              Bienvenue sur LaRoueLibre
            </h2>
            <h3 className="text-lg md:text-xl text-white font-bold text-center mt-4">
              A quoi sert LaRoueLibre ?
            </h3>
            <p className="text-center text-md text-gray-300 max-w-2xl pt-5">
              Plus qu'une simple boutique de vélos et de pièces détachées, LaRoueLibre est votre guide pour trouver des itinéraires magnifiques à parcourir à deux roues.
            </p>
            
            {/*  NOTRE BLOC CONDITIONNEL AVEC LE CUSTOM BUTTON */}
            <div className='flex flex-row gap-5 items-center justify-center pt-5'>
              {user ? (
                // Si le token JWT/l'utilisateur est présent dans le AuthContext
                <CustomButton to="/profile" bgColor="bg-slate-grey_08" hoverColor="hover:bg-slate-grey" textColor="text-white">
                  <FaRegUserCircle size={24} />
                  Mon profil
                </CustomButton>
              ) : (
                // S'il n'y a personne de connecté
                <CustomButton to="/register">
                  <AiOutlineUserAdd size={24} />
                  Créer un compte
                </CustomButton>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-5 justify-center items-center p-5 w-full max-w-7xl bg-dark-nigth-blue_05 border border-slate-grey rounded-xl mt-5 ">

          <h2 className="text-xl md:text-5xl lg:text-6xl text-white font-bold text-center">
            Market Place - Nouveautés
          </h2>
          
          {isLoading ? (
            <div className="flex justify-center w-full py-10">
              <ButtonLoader size={60} />
            </div>
          ) : (
            <ProductSuggestion Product={products} />
          )}
        </div>
      </div>
    </>
  );
}

export default Home;