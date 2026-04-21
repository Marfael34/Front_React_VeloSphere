import React from "react";

const CustomInput = ({ label, state, type, placeholder = "", callable }) => {
  return (
    <div className="mb-5">
      <label className="block text-white font-semibold mb-2 text-sm">
        {label}
      </label>
      <input 
        type={type} 
        className="w-full px-4 py-3 rounded-lg bg-[#2a2a2a] border border-white_01 text-white placeholder-gray-500 focus:outline-none focus:border-green focus:ring-2 focus:ring-green/30 transition duration-200"
        placeholder={placeholder}
        value={state}
        onChange={callable}
      />
    </div>
  );
};

export default CustomInput;