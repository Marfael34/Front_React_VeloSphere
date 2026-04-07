import React from "react";
import { IMG_LOGO } from "../../constants/appConstant";

const Topbar = () => {


  return (
    <div className="h-auto flex items-center bg-dark-nigth-blue_05 shadow-md pb-2 md:hidden">
          <div className="text-white text-lg font-semibold px-4">
              <div className="flex flex-row items-center">
                    <img
                        className="h-14 object-contain pr-2 pt-1.5"
                        src={IMG_LOGO}
                        alt="Logo"
                    />
                    <span className="text-blue-50 text-xl">LaRoueLibre</span>
            </div>
        </div>
    </div>
  );
};

export default Topbar;