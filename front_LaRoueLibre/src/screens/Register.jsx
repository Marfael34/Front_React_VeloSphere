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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    const randomAvatarNumber = Math.floor(Math.random() * 5) + 1;
    const randomAvatarPath = `/images/avatar/default/default-avatar-${randomAvatarNumber}.png`;

    const userData = {
      lastName: lastname,
      firstName: firstname,
      birthday: birthday, 
      pseudo: pseudo,
      email: email,
      password: password,
      avatar: randomAvatarPath
    };

    try {
      await axios.post(`${API_ROOT}/api/register`, userData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      navigate("/login");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
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
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 bg-dark-nigth-blue">
      <div className="w-full md:w-2xl lg:w-175 animate-slideup2">
        <div className="text-center mb-8">
          <h1 className="title-h1">Créez votre compte</h1>
          <p className="text-gray-300 mt-2 text-sm">
            Rejoignez la communauté de La Roue Libre
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="w-full rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 shadow-2xl shadow-black_05"
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
              required
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