import React from 'react'
import { RouterProvider } from 'react-router-dom'
import Router from './Router'

const AppRouter = () => {
  return (
    
    // TODO: prevoir context d'authentification et de session pour savoir quelle routeur choisir

    <RouterProvider router={Router} />
  )
}

export default AppRouter