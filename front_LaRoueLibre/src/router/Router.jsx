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
import ProductDetail from "../screens/ProductDetail";
import EditProduct from "../screens/EditProduct";
import Checkout from "../screens/Checkout";
import Invoice from "../screens/InVoice";
import OrderTracking from "../screens/OrderTracking";
import ParticipationTracking from "../screens/ParticipationTracking";
import LocationDetail from "../screens/LocationDetail";
import Dashboard from "../screens/admin/Dashboard";
import UsersManagement from "../screens/admin/UsersManagement";
import ProductsManagement from "../screens/admin/ProductsManagement";
import PlacesManagement from "../screens/admin/PlacesManagement";
import OrdersManagement from "../screens/admin/OrdersManagement";
import AdminLayout from "../screens/admin/AdminLayout";
import ProtectedRoute from "../components/ProtectedRoute";
import LicenceForm from "../screens/LicenceForm";
import LicenceManagement from "../screens/admin/LicenceManagement";
import Competitions from "../screens/Competitions";
import CompetitionManagement from "../screens/admin/CompetitionManagement";


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
                path: "/licence",
                element: <LicenceForm/>
            },
            {
                path: "/competitions",
                element: <Competitions/>
            },
            {
                path: "/location",
                element: <Location/>
            },
            {
                path: "/product/:id",
                element: <ProductDetail/>
            },
            {
                path: "/product/edit/:id",
                element: <EditProduct/>
            },
            { 
                path: "/checkout", 
                element: <Checkout/> 
            },
            { 
                path: "/invoice/:id", 
                element: <Invoice/> 
            },
            {
                path: "/profile/order/:id",
                element: <OrderTracking/>
            },
            {
                path: "/profile/registration/:id",
                element: <ParticipationTracking/>
            },
            {
                path: "/location/:id",
                element: <LocationDetail/> 
            },
            {
                element: <ProtectedRoute allowedRoles={["ROLE_ADMIN"]} />,
                children: [
                    {
                        element: <AdminLayout />,
                        children: [
                            {
                                path: "/dashboard",
                                element: <Dashboard/>
                            },
                            {
                                path: "/admin/users",
                                element: <UsersManagement/>
                            },
                            {
                                path: "/admin/products",
                                element: <ProductsManagement/>
                            },
                            {
                                path: "/admin/places",
                                element: <PlacesManagement/>
                            },
                            {
                                path: "/admin/licences",
                                element: <LicenceManagement/>
                            },
                            {
                                path: "/admin/orders",
                                element: <OrdersManagement/>
                            },
                            {
                                path: "/admin/competitions",
                                element: <CompetitionManagement/>
                            }
                        ]
                    }
                ]
            }
            
        ]
    }
]);

export default Router;