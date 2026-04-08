import { createBrowserRouter } from "react-router-dom";
import HomeOffline from "../screens/OfflineScreens/HomeOffline";
import ErrorPages from "../screens/ErrorScreens/ErrorPages";
import Login from "../screens/OfflineScreens/Login";
import Register from "../screens/OfflineScreens/Register";
import App from "../App";

const OfflineRouter = createBrowserRouter([
    {
        element: <App/>, // élément qui sera retourné sur toutes les vue
        errorElement: <ErrorPages/>, // élément retouné en cas d'erreur 
        children: [
            {
                path: "/", // chemin de la vue
                element: <HomeOffline/>, // élément retourné
            },
            {
                path: "/register",
                element: <Register/>
            },
            {
                path: "/login",
                element: <Login onLoginSuccess={(token, email) => {
                        console.log("LE TOKEN EST ARRIVÉ DANS LE PARENT :", token);
                        console.log("EMAIL DE L'UTILISATEUR :", email);
                        // Plus tard, c'est ici qu'on mettra à jour votre state global !
                        }} />
            }
            
        ]
    }
]);

export default OfflineRouter;