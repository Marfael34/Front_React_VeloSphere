import React, { useContext } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./components/UI/Navbar";
import { AuthContext } from "./contexts/AuthContext"; 

const App = () => {
  const { user, setUser } = useContext(AuthContext); 

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar 
        user={user} 
        onLogout={() => setUser(null)} 
      />
      <main className="flex-1 w-full text-white">
        <Outlet context={{ user, setUser }} />
      </main>
    </div>
  );
};

export default App;