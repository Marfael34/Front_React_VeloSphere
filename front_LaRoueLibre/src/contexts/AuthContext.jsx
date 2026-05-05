// src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialisation paresseuse : on regarde dans le cookie au premier chargement
  const [user, setUser] = useState(() => {
    const savedUser = Cookies.get("user");
    if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser.token) {
            try {
                const decoded = jwtDecode(parsedUser.token);
                return { ...parsedUser, roles: decoded.roles || [] };
            } catch (e) {
                return parsedUser;
            }
        }
        return parsedUser;
    }
    return null;
  });

  // Intercepteur Axios pour gérer les 401 (token expiré) globalement
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        // Si 401 et que ce n'est pas une tentative de login, on déconnecte
        if (error.response?.status === 401 && !error.config.url.includes('/login_check')) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  // Fonction pour mettre à jour l'utilisateur avec décodage auto du token
  const updateUser = (userData) => {
    if (userData && userData.token) {
        try {
            const decoded = jwtDecode(userData.token);
            setUser({ ...userData, roles: decoded.roles || [] });
        } catch (e) {
            setUser(userData);
        }
    } else {
        setUser(userData);
    }
  };

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
    <AuthContext.Provider value={{ user, setUser: updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};