// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialisation paresseuse : on regarde dans le cookie au premier chargement
  const [user, setUser] = useState(() => {
    const savedUser = Cookies.get("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // Synchronisation automatique
  // À chaque fois que 'user' change, on met à jour le cookie
  useEffect(() => {
    if (user) {
      // On détecte si on est en développement (localhost)
      const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

      Cookies.set("user", JSON.stringify(user), { 
        expires: 1, 
        secure: !isLocalhost, // Faux en local, Vrai en production !
        sameSite: 'strict' 
      });
    } else {
      // Déconnexion : on supprime le cookie
      Cookies.remove("user");
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};