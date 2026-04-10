import { AiOutlineHome, AiOutlineUserAdd } from "react-icons/ai";
import { IMAGE_URL } from "./apiConstant";
import { MdDirectionsBike, MdOutlinePedalBike } from "react-icons/md";
import { BiLogIn } from "react-icons/bi";
import { FaRegUserCircle } from "react-icons/fa";
import { RiShoppingBasket2Line } from "react-icons/ri";
import { LuMapPin } from "react-icons/lu";


// ===========================
// CLE DU LOCAL STORAGE
// ===========================

// Logo de l'application
export const IMG_LOGO = `${IMAGE_URL}/logo.png`


// ===========================
// CONFIGURATION DE LA SIDEBAR
// ===========================

// Navigation principale 
export const dataNav = [
    {title: "Acceuil", path: "/", icon: AiOutlineHome},
    {title: "Market", path: "/market", icon: MdOutlinePedalBike},
    {title: "Lieux", path: "/location", icon: LuMapPin},

]

// Navigation utilisateur (compte et playlists)
export const OfflinedataUserNav = [
  {title: "Login", path: "/login", icon: BiLogIn},
  {title: "Resgister", path: "/register", icon: AiOutlineUserAdd},
  
]

// Navigation utilisateur (compte et playlists)
export const OnlinedataUserNav = [
  {title: "Profile", path: "/profile", icon: FaRegUserCircle },
  {title: "Panier", path: "/panier", icon: RiShoppingBasket2Line }

]


//STYLES POUR LES ICONES

export const styleIcon = {width:'25px', height: '25px'};

export const tableIcon = {width:'20px', height: '20px'};