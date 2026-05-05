import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { RiCloseLine } from "react-icons/ri";
import { HiOutlineMenu } from "react-icons/hi";
import { FaChartLine, FaUsers, FaBicycle, FaMapMarkedAlt, FaShoppingBag, FaIdCard, FaTrophy } from 'react-icons/fa';

const NavbarAdmin = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const adminLinks = [
    { title: "Stats", path: "/dashboard", icon: FaChartLine },
    { title: "Utilisateurs", path: "/admin/users", icon: FaUsers },
    { title: "Produits", path: "/admin/products", icon: FaBicycle },
    { title: "Lieux", path: "/admin/places", icon: FaMapMarkedAlt },
    { title: "Commandes", path: "/admin/orders", icon: FaShoppingBag },
    { title: "Permis", path: "/admin/licences", icon: FaIdCard },
    { title: "Compétitions", path: "/admin/competitions", icon: FaTrophy },
  ];

  const activeLinkStyle = ({ isActive }) =>
    isActive
      ? "bg-orange/20 text-orange flex items-center gap-2 px-4 py-2 rounded-xl font-bold border border-orange/30 shadow-lg shadow-orange/10 transition-all scale-105"
      : "text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 px-4 py-2 rounded-xl transition-all";

  return (
    <nav className="w-full bg-black/40 backdrop-blur-xl border-b border-white/10 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange animate-pulse"></div>
            <span className="text-white text-sm font-black uppercase tracking-widest">Admin Panel</span>
          </div>

          {/* MENU BUREAU */}
          <div className="hidden md:flex items-center space-x-2">
            {adminLinks.map((item) => (
              <NavLink key={item.title} to={item.path} end className={activeLinkStyle}>
                <item.icon className="text-lg" />
                <span className="text-xs">{item.title}</span>
              </NavLink>
            ))}
          </div>

          {/* BOUTON MOBILE */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 text-gray-400 hover:text-white transition-colors">
              {mobileMenu ? <RiCloseLine size={24} /> : <HiOutlineMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* MENU MOBILE */}
      <div 
        className={`md:hidden absolute w-full bg-black/95 backdrop-blur-2xl border-b border-white/10 transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenu ? "max-h-80 opacity-100 py-4" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 space-y-2">
          {adminLinks.map((item) => (
            <NavLink 
                key={item.title} 
                to={item.path} 
                end 
                className={activeLinkStyle} 
                onClick={() => setMobileMenu(false)}
            >
              <item.icon className="text-xl" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default NavbarAdmin;