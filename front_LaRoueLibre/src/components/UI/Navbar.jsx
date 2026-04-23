// src/components/UI/Navbar.jsx (Anciennement SideBar.jsx)
import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  dataNav,
  IMG_LOGO,
  OfflinedataUserNav,
  OnlinedataUserNav,
} from "../../constants/appConstant";
import { API_ROOT } from "../../constants/apiConstant";
import { RiCloseLine } from "react-icons/ri";
import { HiOutlineMenu } from "react-icons/hi";
import { FaChartLine } from "react-icons/fa";

const Navbar = ({ user, onLogout }) => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  // --- Fonction de déconnexion ---
 const handleLogout = async () => {
      // Plus d'appel Axios inutile qui cause le 404 !
      if (onLogout) onLogout(); // Ça va mettre 'user' à null et le AuthContext supprimera le cookie
      setMobileMenu(false);
      navigate("/login");
  };

  // On détermine quel menu profil afficher
  const currentProfileNav = user ? OnlinedataUserNav : OfflinedataUserNav;

  // Fonction pour gérer le style actif des liens
  const activeLinkStyle = ({ isActive }) =>
    isActive
      ? "text-orange flex items-center gap-2 font-semibold"
      : "text-white hover:text-orange transition-colors flex items-center gap-2";

  return (
    <nav className="w-full bg-dark-nigth-blue shadow-xl shadow-black/40 sticky top-0 z-50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LOGO & TITRE */}
          <div className="flex items-center cursor-pointer" onClick={() => navigate('/')}>
            <img
              className="h-10 w-auto pr-2 object-contain"
              src={IMG_LOGO}
              alt="Logo LaRoueLibre"
            />
            <span className="text-blue-50 text-xl font-bold tracking-wide">LaRoueLibre</span>
          </div>

          {/* MENU BUREAU (Caché sur mobile) */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Principale */}
            {dataNav.map((item) => (
              <NavLink key={item.title} to={item.path} end className={activeLinkStyle}>
                <item.icon className="text-xl" />
                <span>{item.title}</span>
              </NavLink>
            ))}

            {/* Lien Dashboard pour les Admins */}
            {user?.roles?.includes("ROLE_ADMIN") && (
              <NavLink to="/dashboard" className={activeLinkStyle}>
                <FaChartLine className="text-xl" />
                <span>Admin</span>
              </NavLink>
            )}

            {/* Séparateur vertical */}
            <div className="h-6 w-px bg-slate-grey_06"></div>

            {/* Navigation Profil */}
            {currentProfileNav.map((item) => (
              <NavLink key={item.title} to={item.path} end className={activeLinkStyle}>
                <item.icon className="text-xl" />
                <span>{item.title}</span>
              </NavLink>
            ))}

            {/* Bouton Déconnexion */}
            {user && (
            
              <button
                onClick={handleLogout}
                className="text-red-500 hover:text-red-400 font-bold text-sm transition-colors"
              >
                Se déconnecter
              </button>
            )}
          </div>

          {/* BOUTON MENU MOBILE (Burger) */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenu(!mobileMenu)}>
              {mobileMenu ? (
                <RiCloseLine className="text-white text-3xl" />
              ) : (
                <HiOutlineMenu className="text-white text-3xl" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE (S'ouvre vers le bas) */}
      <div 
        className={`md:hidden absolute w-full bg-dark-nigth-blue border-t border-white_01 transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenu ? "max-h-100 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
          <p className="text-slate-grey_06 text-xs uppercase font-bold mt-4">Navigation</p>
          {dataNav.map((item) => (
            <NavLink key={item.title} to={item.path} end className={activeLinkStyle} onClick={() => setMobileMenu(false)}>
              <item.icon className="text-xl" />
              <span>{item.title}</span>
            </NavLink>
          ))}

          {user?.roles?.includes("ROLE_ADMIN") && (
            <NavLink to="/dashboard" className={activeLinkStyle} onClick={() => setMobileMenu(false)}>
              <FaChartLine className="text-xl" />
              <span>Admin</span>
            </NavLink>
          )}

          <p className="text-slate-grey_06 text-xs uppercase font-bold mt-4">Profil</p>
          {currentProfileNav.map((item) => (
            <NavLink key={item.title} to={item.path} end className={activeLinkStyle} onClick={() => setMobileMenu(false)}>
              <item.icon className="text-xl" />
              <span>{item.title}</span>
            </NavLink>
          ))}

          {user && (
            <button
              onClick={handleLogout}
              className="text-red-500 hover:text-red-400 font-bold text-left pt-2 transition-colors"
            >
              Se déconnecter
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;