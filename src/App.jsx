import React from "react";
import { Outlet } from "react-router-dom";
import SideBar from "./components/UI/SideBar";
import { useSelector } from "react-redux";

import Topbar from "./components/UI/TopBar";

const App = () => {


  return (
    <div className="relative flex">
      {/* SIDEBAR: Navigation principale (gauche) */}
      <SideBar />

      <div className="flex-1 flex flex-col bg-linear-to-b from-black to-[rgb(18,18,18)]">
        {/* Topbar : barre supérieur (profil, recherche) */}
        <Topbar/>

        <div className="h-[calc(100vh-64px)] overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
          <div className="flex-1 h-fit pb-40 text-white">
            <Outlet />
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default App;
