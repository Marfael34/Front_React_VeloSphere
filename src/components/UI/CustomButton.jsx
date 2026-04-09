import React from 'react';
import { Link } from 'react-router-dom';

const CustomButton = ({ 
  children, 
  to, 
  onClick, 
  bgColor = "bg-orange", // Couleur par défaut
  hoverColor = "hover:bg-orange/80", 
  textColor = "text-black",
  className = "", 
  type = "button" 
}) => {
  

  const baseClasses = `px-6 py-3 font-bold rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-orange/30 text-center flex justify-center items-center gap-2 ${bgColor} ${hoverColor} ${textColor} ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClasses}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClasses}>
      {children}
    </button>
  );
};

export default CustomButton;