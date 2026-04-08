import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./components/UI/SideBar"; // J'ai corrigé la majuscule si besoin
import Topbar from "./components/UI/TopBar";

const App = () => {
  // 1. LA MÉMOIRE GLOBALE : L'utilisateur (null par défaut)
  const [user, setUser] = useState(null);

  return (
    <div className="relative flex">
      {/* SIDEBAR: On lui passe l'utilisateur et la fonction pour se déconnecter */}
      <SideBar 
        user={user} 
        onLogout={() => setUser(null)} 
      />

      <div className="flex-1 flex flex-col bg-linear-to-b from-black to-[rgb(18,18,18)]">
        {/* Topbar : (Vous pourrez aussi lui passer {user} plus tard si besoin d'afficher son nom !) */}
        <Topbar />

        <div className="h-[calc(100vh-64px)] overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
          <div className="flex-1 h-fit pb-40 text-white">
            
            {/* 2. OUTLET : On injecte l'utilisateur ET la fonction de modification 
                 à TOUTES les pages qui s'afficheront ici (dont le Login) */}
            <Outlet context={{ user, setUser }} />

          </div>
        </div>
      </div>
    
    </div>
  );
};

export default App;