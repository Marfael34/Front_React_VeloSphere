import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

/**
 * Composant pour protéger les routes en fonction des rôles de l'utilisateur.
 * @param {Object} props - Les propriétés du composant.
 * @param {Array<string>} props.allowedRoles - Liste des rôles autorisés pour accéder à la route.
 * @returns {JSX.Element} - Le composant protégé ou une redirection.
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // Les rôles sont maintenant extraits automatiquement dans l'AuthContext
  const userRoles = user.roles || [];
  const hasAccess = allowedRoles.some((role) => userRoles.includes(role));

  if (!hasAccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
