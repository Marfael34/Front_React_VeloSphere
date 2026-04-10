import { createBrowserRouter } from "react-router-dom";
import Home from "../screens/Home";
import ErrorPages from "../screens/ErrorScreens/ErrorPages";
import Login from "../screens/Login";
import Register from "../screens/Register";
import App from "../App";
import Market from "../screens/Market";
import Panier from "../screens/Panier";
import Profile from "../screens/Profile";
import Location from "../screens/Location";

const Router = createBrowserRouter([
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
            },
            {
                path: "/market",
                element: <Market/>
            },
            {
                path: "/panier",
                element: <Panier/>
            },
            {
                path: "/profile",
                element: <Profile/>
            },
            {
                path: "/location",
                element: <Location/>
            }
            
        ]
    }
]);

export default Router;