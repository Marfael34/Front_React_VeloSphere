import { createBrowserRouter } from "react-router-dom";
import HomeOffline from "../screens/OfflineScreens/HomeOffline";
import ErrorPages from "../screens/ErrorScreens/ErrorPages";
import Login from "../screens/OfflineScreens/Login";
import Register from "../screens/OfflineScreens/Register";

const OfflineRouter = createBrowserRouter([
    {
        element: <HomeOffline/>, // élément qui sera retourné sur toutes les vue
        errorElement: <ErrorPages/>, // élément retouné en cas d'erreur 
        children: [
            {
                path: "/", // chemin de la vue
                element: <Login/>, // élément retourné
            },
            {
                path: "/register",
                element: <Register/>
            }
            
        ]
    }
]);

export default OfflineRouter;