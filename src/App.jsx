import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./components/UI/SideBar";


const App = () => {


  return (
    <div className="relative flex">
      {/* SIDEBAR: Navigation principale (gauche) */}
      <Sidebar />
      <div className="h-[calc(100vh-64px)] overflow-y-scroll hide-scrollbar flex xl:flex-row flex-col-reverse">
          <div className="flex-1 h-fit pb-40 text-white">
            <Outlet />
          </div>
        </div>
    </div>
  );
};

export default App;