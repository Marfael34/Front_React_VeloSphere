import React from 'react'

const HomeOffline = () => {
  return (
    <>
      <div className="flex flex-col items-center h-screen px-4 md:px-6 pt-5 bg-opacity-50">
        <div className="flex flex-col gap-5 justify-center items-center shadow-2xl">
          <h2 className=" text-2xl md:text-6xl text-white font-bold">Bienvenue sur LaRoueLibre</h2>
          <h3 className=" text-lg md:text-xl text-white font-bold">A quoi sert LaRoueLibre ?</h3>
          <p className="text-md ">
            Plus qu'une simple boutique de vélos et de pièces détachées, LaRoueLibre est votre guide pour trouver des itinéraires magnifiques à parcourir à deux roues.
          </p>
        </div>
      </div>

      <div className="flex flex-col items-center h-screen px-4 md:px-6 pt-5 bg-dark-nigth-blue_05 bg-opacity-50 bg-center bg-contain">
        <div className="flex justify-center items-center ">
          <h2 className=" text-xl md:text-6xl text-white text-center">Markat Place</h2>
        </div>
      </div>
    </>
   
    
  )
}

export default HomeOffline;