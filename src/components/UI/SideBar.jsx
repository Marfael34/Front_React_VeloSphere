import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  dataNav,
  IMG_LOGO,
  OfflinedataUserNav,
  OnlinedataUserNav,
  styleIcon,
} from "../../constants/appConstant";
import { API_ROOT } from "../../constants/apiConstant";
import Navlinks from "./Navlinks";
import { RiCloseLine } from "react-icons/ri";
import { HiOutlineMenu } from "react-icons/hi";

const Sidebar = ({ user, onLogout }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  // --- Fonction de déconnexion ---
  const handleLogout = async () => {
    try {
      // 1. On appelle Symfony pour détruire le cookie HttpOnly du Refresh Token
      await axios.post(`${API_ROOT}/api/logout`, {}, {
        withCredentials: true 
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion serveur :", error);
    } finally {
      // 2. On vide l'utilisateur de la mémoire React (Context/State du parent)
      if (onLogout) onLogout(); 
      
      // 3. On ferme le menu mobile s'il était ouvert et on redirige vers le login
      setMobileMenu(false);
      navigate("/login");
    }
  };

  return (
    <>
      {/* ========================================== */}
      {/* SIDEBAR BUREAU (Écrans >= 768px)           */}
      {/* ========================================== */}
      <div className="hidden md:flex flex-col w-60 py-10 px-4 bg-dark-nigth-blue_05 justify-between h-screen overflow-y-auto overflow-x-hidden">
        <div>
          <div className="md:flex flex-col items-center">
            <img
              className="w-full h-14 object-contain"
              src={IMG_LOGO}
              alt="Logo LaRoueLibre"
            />
            <span className="text-blue-50 text-2xl mt-2">LaRoueLibre</span>
          </div>

          <h2 className="text-lg text-white font-semibold mt-10">Profile</h2>
          
          {/* Menu conditionnel selon l'état "user" */}
          <Navlinks data={user ? OnlinedataUserNav : OfflinedataUserNav} marginTop={"mt-4"} />
          
          {/* Bouton déconnexion affiché UNIQUEMENT si l'utilisateur est connecté */}
          {user && (
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:text-red-400 font-bold mt-6 text-sm text-left transition-colors px-3 py-2 w-full"
            >
              Se déconnecter
            </button>
          )}

          <h2 className="text-lg text-white font-semibold mt-10">Navigation</h2>
          <Navlinks data={dataNav} marginTop={"mt-4"} />
        </div>
      </div>

      {/* ========================================== */}
      {/* BOUTONS MOBILE (Burger & Close)            */}
      {/* ========================================== */}
      <div className="absolute md:hidden block top-6 right-3 z-30">
        {mobileMenu ? (
          <RiCloseLine
            style={styleIcon}
            className="text-white mr-2 cursor-pointer"
            onClick={() => setMobileMenu(false)}
          />
        ) : (
          <HiOutlineMenu
            style={styleIcon}
            className="text-white mr-2 cursor-pointer"
            onClick={() => setMobileMenu(true)}
          />
        )}
      </div>

      {/* ========================================== */}
      {/* SIDEBAR MOBILE (Écrans < 768px)            */}
      {/* ========================================== */}
      <div className={`z-20 absolute top-0 h-screen w-2/3 bg-linear-to-tl from-white_01 to-black backdrop-blur-lg md:hidden smooth-transition duration-500 overflow-y-auto ${mobileMenu ? 'left-0' : '-left-full'} flex flex-col p-6`}>
        <div>
          <img
            className="w-full h-14 object-contain"
            src={IMG_LOGO}
            alt="Logo LaRoueLibre"
          />
          
          <h2 className="text-lg text-white font-semibold mt-10">Profile</h2>
          
          {/* Menu conditionnel pour la version mobile */}
          <Navlinks data={user ? OnlinedataUserNav : OfflinedataUserNav} marginTop={"mt-4"} />

          {/* Bouton déconnexion pour la version mobile */}
          {user && (
            <button 
              onClick={handleLogout} 
              className="text-red-500 hover:text-red-400 font-bold mt-6 text-sm text-left transition-colors px-3 py-2 w-full"
            >
              Se déconnecter
            </button>
          )}

          <h2 className="text-lg text-white font-semibold mt-10">Navigation</h2>
          <Navlinks data={dataNav} marginTop={"mt-4"} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;