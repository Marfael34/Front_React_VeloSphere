import React, { useState } from "react";
import {dataNav, IMG_LOGO, OfflinedataUserNav, styleIcon,} from "../../constants/appConstant";
import Navlinks from "./Navlinks";
import { RiCloseLine } from "react-icons/ri";
import { HiOutlineMenu } from "react-icons/hi";


const Sidebar = () => {
   //on crée nos states
  const [mobileMenu, setMobileMenu] = useState(false);


  return (
    <>
      {/* sidebar pour la vue au dessus de 768px */}
      <div className="hidden md:flex flex-col w-60 py-10 px-4 bg-dark-nigth-blue_05 justify-between">
        <div>
            <div className="md:flex flex-col items-center">
                <img
                    className="w-full h-14 object-contain"
                    src={IMG_LOGO}
                    alt="Logo"
                />
                <span className="text-blue-50 text-2xl">LaRoueLibre</span>
            </div>
          

          <h2 className="text-lg text-white font-semibold mt-10">Profile</h2>
          <Navlinks data={OfflinedataUserNav} marginTop={"mt-4"} />
          <h2 className="text-lg text-white font-semibold mt-10">Navigation</h2>
          {/* TODO ici la boucle pour afficher la liste des onglet suivant le tableau de data */}
          <Navlinks data={dataNav} marginTop={"mt-4"} />
        </div>
      </div>
      {/* gestion des icones pour ouvrir/fermer le menu en petit ecran */}
      <div className="absolute md:hidden block top-6 right-3">
        {mobileMenu ? (
          <RiCloseLine
            style={styleIcon}
            className="text-white mr-2"
            onClick={() => setMobileMenu(false)}
          />
        ) : (
          <HiOutlineMenu
            style={styleIcon}
            className="text-white mr-2"
            onClick={() => setMobileMenu(true)}
          />
        )}
      </div>
      {/* sidebar pour la vue en dessous de 768px */}
      <div className={`z-20 absolute top-0 h-screen w-2/3 bg-linear-to-tl from-white_01 to-black backdrop-blur-lg md:hidden smooth-transition duration-500 ${mobileMenu ? 'left-0' : '-left-full'} flex flex-col justify-between p-6`}>
        <div>
          <img
            className="w-full h-14 object-contain"
            src={IMG_LOGO}
            alt="Logo Spotify"
          />
          <h2 className="text-lg text-white font-semibold mt-10">Profile</h2>
          <Navlinks data={OfflinedataUserNav} marginTop={"mt-4"} />
          <h2 className="text-lg text-white font-semibold mt-10">Navigation</h2>
          {/* TODO ici la boucle pour afficher la liste des onglet suivant le tableau de data */}
          <Navlinks data={dataNav} marginTop={"mt-4"} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;