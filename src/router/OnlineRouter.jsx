import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import ErrorPages from "../screens/ErrorScreens/ErrorPages";
import Home from "../screens/OnlineScreens/Home";

const OnlineRouter = createBrowserRouter([
    {
        element: <App/>,
        errorElement: <ErrorPages/>,
        children: [
            {
                path: "/",
                element: <Home/>
            }
        ]
    },
]);

export default OnlineRouter;