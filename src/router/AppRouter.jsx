import React from 'react'
import { RouterProvider } from 'react-router-dom'
import OfflineRouter from './OfflineRouter'

const AppRouter = () => {
  return (
    
    // TODO: prevoir context d'authentification et de session pour savoir quelle routeur choisir

    <RouterProvider router={OfflineRouter} />
  )
}

export default AppRouter