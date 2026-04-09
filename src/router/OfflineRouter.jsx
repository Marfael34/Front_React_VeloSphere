import { createBrowserRouter } from "react-router-dom";
import Home from "../screens/OfflineScreens/Home";
import ErrorPages from "../screens/ErrorScreens/ErrorPages";
import Login from "../screens/OfflineScreens/Login";
import Register from "../screens/OfflineScreens/Register";
import App from "../App";
import Market from "../screens/OfflineScreens/Market";

const OfflineRouter = createBrowserRouter([
    {
        element: <App/>, // élément qui sera retourné sur toutes les vue
        errorElement: <ErrorPages/>, // élément retouné en cas d'erreur 
        children: [
            {
                path: "/", // chemin de la vue
                element: <Home/>, // élément retourné
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
            },{
                path: "/market",
                element: <Market/>
            }
            
        ]
    }
]);

export default OfflineRouter;