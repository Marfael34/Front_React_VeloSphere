// src/screens/OfflineScreens/Register.jsx
import React, { useEffect, useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomInput from "../components/UI/CustomInput";
import ErrorMessage from "../components/UI/ErrorMessage";
import axios from "axios";
import { AuthContext } from "../contexts/AuthContext";
import { API_ROOT } from "../constants/apiConstant";
import ButtonLoader from "../components/Loader/ButtonLoader";

const Register = () => {
  const [lastname, setLastName] = useState("");
  const [firstname, setFirstName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [nbAdress, setNbAdress] = useState("");
  const [typeVoie, setTypeVoie] = useState("");
  const [label, setLabel] = useState("");
  const [complement, setComplement] = useState("");
  const [city, setCity] = useState("");
  const [cp, setCp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. On récupère la mémoire globale au lieu d'un state local
  const { user, setUser } = useContext(AuthContext);

  const navigate = useNavigate();

  useEffect(() => {
    // Si l'utilisateur est déjà connecté, on le redirige vers l'accueil
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    //On structure les données : on groupe les champs de l'adresse dans un sous-objet
    const userData = {
      lastName: lastname,
      firstName: firstname,
      birthday: birthday, 
      pseudo: pseudo,
      email: email,
      password: password,
      address: {
        nbAdress: nbAdress,
        typeVoie: typeVoie,
        label: label,
        // Si complement est vide (""), on envoie null, sinon on envoie la valeur
        complement: complement.trim() === "" ? null : complement, 
        city: city,
        cp: cp
      }
    };

    try {
      // On envoie tout en une seule requête POST vers votre route de création d'utilisateur
      // Remplacez '/api/register' par la vraie route de votre API Symfony
      await axios.post(`${API_ROOT}/api/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Si succès, on redirige l'utilisateur vers le login avec un petit délai
      // Vous pourriez aussi utiliser un toast/alerte pour lui dire "Compte créé avec succès"
      navigate("/login");

    } catch (error) {
      console.error("Erreur d'inscription:", error);
      // Gestion basique des erreurs
      if (error.response && error.response.status === 400) {
        setErrorMessage("Certains champs sont invalides ou l'email existe déjà.");
      } else {
        setErrorMessage("Une erreur est survenue lors de la création de votre compte.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 bg-transparent">
      
      {/* J'ai mis lg:w-[700px] pour laisser de la place aux champs côte à côte */}
      <div className="w-full md:w-2xl lg:w-175 animate-slideup2">
        <div className="text-center mb-8">
          <h1 className="title-h1">Créez votre compte</h1>
          <p className="text-gray-300 mt-2 text-sm">
            Rejoignez la communauté de La Roue Libre
          </p>
        </div>

        {/* formulaire */}
        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-slate-grey_08 backdrop-blur-xl border border-white/10 p-8 sm:p-10 shadow-2xl shadow-black_05"
        >
          <div className="space-y-1">
            <h2 className="flex justify-center pb-2 text-3xl font-bold underline mb-4">Profil</h2>
            <div className="flex flex-row gap-5 justify-center">
              <div className="w-1/2">
                <CustomInput
                  label={"Saisir votre Nom"}
                  type={"text"}
                  placeholder="Martie" 
                  state={lastname}
                  callable={(event) => setLastName(event.target.value)}
                />
              </div>
              <div className="w-1/2">
                <CustomInput
                  label={"Saisir votre Prénom"}
                  type={"text"}
                  placeholder="Jean-Paul" 
                  state={firstname}
                  callable={(event) => setFirstName(event.target.value)}
                />
              </div>
            </div>
            <CustomInput
              label={"Saisir votre date de naissance"}
              type={"date"}
              placeholder="" 
              state={birthday}
              callable={(event) => setBirthday(event.target.value)}
              
            />
            <CustomInput
              label={"Saisir votre email"}
              type={"email"}
              placeholder="votre@email.com" 
              state={email}
              callable={(event) => setEmail(event.target.value)}
            />
            <CustomInput
              label={"Saisir votre mot de passe"}
              type={"password"}
              placeholder="********" 
              state={password}
              callable={(event) => setPassword(event.target.value)}
            />
            <CustomInput
              label={"Saisir votre Pseudo"}
              type={"text"}
              placeholder="JPdu66" 
              state={pseudo}
              callable={(event) => setPseudo(event.target.value)}
            />
          </div>

          <div className="space-y-1 mt-6">
            <h2 className="flex justify-center pb-2 text-3xl font-bold underline mb-4">Adresse</h2>
            <div className="flex flex-wrap gap-5 md:flex-row">
              <div className="w-20 md:w-20">
                <CustomInput
                  label={"N°"}
                  type={"text"}
                  placeholder="18 bis" 
                  state={nbAdress}
                  callable={(event) => setNbAdress(event.target.value)}
                />
              </div>
              <div className="w-68 md:w-32 lg:w-35 ">
                <CustomInput
                  label={"Type de voie"}
                  type={"text"}
                  placeholder="Allées, Rue, ..." 
                  state={typeVoie}
                  callable={(event) => setTypeVoie(event.target.value)}
                />
              </div>
              <div className="w-full md:w-85 lg:w-89.5">
                <CustomInput
                  label={"Nom de la voie"}
                  type={"text"}
                  placeholder="Jean Datacenter" 
                  state={label}
                  callable={(event) => setLabel(event.target.value)}
                />
              </div>
            </div>
            <CustomInput
              label={"Complément d'adresse"}
              type={"text"}
              placeholder="Apprt. 404, Résidence du Bug" 
              state={complement}
              callable={(event) => setComplement(event.target.value)}
            />
            <div className="flex flex-row gap-5">
              <div className="w-1/2">
                <CustomInput
                  label={"Ville"}
                  type={"text"}
                  placeholder="Perpignan" 
                  state={city}
                  callable={(event) => setCity(event.target.value)}
                />
              </div>
              <div className="w-1/2">
                <CustomInput
                  label={"Code postal"}
                  type={"number"}
                  placeholder="66000" 
                  state={cp}
                  callable={(event) => setCp(event.target.value)}
                />
              </div>
            </div>
          </div>

          {errorMessage && <ErrorMessage message={errorMessage} />}

          <div className="mt-8">
            {isLoading ? (
              <div className="flex justify-center py-2">
                <ButtonLoader />
              </div>
            ) : (
              <button className="main-button" type="submit">
                S'inscrire
              </button>
            )}
          </div>

          <p className="mt-6 text-center text-gray-300 text-sm">
            Déjà un compte ?{" "}
            {/* 4. Adaptation de la couleur au thème (Orange) */}
            <Link
              to={"/login"}
              className="text-orange hover:text-orange/80 font-semibold underline underline-offset-2 transition-colors"
            >
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;