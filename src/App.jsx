// src/App.jsx
import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/UI/Navbar"; // L'import a changé !
import { AuthContext } from "./contexts/AuthContext"; // (Si vous utilisez le contexte mis en place plus tôt)

const App = () => {
  const { user, setUser } = useContext(AuthContext); // ou useState si vous n'avez pas mis le contexte

  return (
    // Structure classique : en colonne, prend au minimum la taille de l'écran
    <div className="flex flex-col min-h-screen bg-white">
      
      {/* 1. Notre barre de navigation en haut */}
      <Navbar 
        user={user} 
        onLogout={() => setUser(null)} 
      />

      {/* 2. Le contenu de la page juste en dessous */}
      <main className="flex-1 w-full text-white">
        <Outlet context={{ user, setUser }} />
      </main>

    </div>
  );
};

export default App;