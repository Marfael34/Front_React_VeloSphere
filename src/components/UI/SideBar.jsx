import React from "react";
import {dataNav, IMG_LOGO, OfflinedataUserNav,} from "../../constants/appConstant";
import Navlinks from "./Navlinks";


const Sidebar = () => {

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
    </>
  );
};

export default Sidebar;