import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomInput from "../../components/UI/CustomInput";
import ErrorMessage from "../../components/UI/ErrorMessage";
import ButtonLoader from "../../components/Loader/ButtonLoader";
import axios from "axios";
import { API_ROOT } from "../../constants/apiConstant";

const Login = () => {
  // on déclare nos state pour les valeurs du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);

  // on recupère le hook de navigation
  const navigate = useNavigate();


  useEffect(() => {
    //si j'ai un utilisateur en session alors on le redirige sur "/" du router online
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  //méthode qui receptionne les données du formulaire
  const handleSubmit = async (event) => {
    event.preventDefault(); // on empeche le comportement naturel du formulaire
    setIsLoading(true); // on passe isLoading a true pour afficher le loader
    setErrorMessage(""); // on vide les messages d'erreur

    try {
      //on verifie que les champs sont bien rempli
      if (email == "" || password == "") {
        setErrorMessage("Tous les champs doivent être remplis");
        return;
      }

      // on execute la requete sur l'API
      const response = await axios.post(`${API_ROOT}/login`, {
        email,
        password,
      });

      if (response.data.success === false) {
        setErrorMessage(response.data.message);
      } else {
        //on reconstruit un objet user
        const loggedInUser = {
          userId: response.data.id,
          email: response.data.email,
          nickname: response.data.nickname,
        };

        // on appelle la méthode signIn de authContext pour enregistrer l'utilisateur
        await signIn(loggedInUser);
        setUser(loggedInUser);
      }
    } catch (error) {
      console.log(`Erreur lors de la connexion: ${error}`);
      setErrorMessage("Email et/ou mot de passe incorrect");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-row items-center justify-center bg-dark-nigth-blue w-full min-h-[70vh] px-4 sm:px-6 py-8">
        <div className="w-full animate-slideup2">
          <div className="text-center mb-8">
            <h1 className="title-h1">Connectez vous</h1>
            <p className="text-gray-300 mt-2 text-sm">
              Accédez à votre bibliothèque musicale
            </p>
          </div>

          {/* formulaire */}
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 shadow-2xl shadow-black_05"
          >
            <div className="space-y-1">
              <CustomInput
                label={"Saisir votre email"}
                type={"email"}
                placeholder="votre@email.com" // propriété optionnelle
                state={email}
                callable={(event) => setEmail(event.target.value)}
              />
              <CustomInput
                label={"Saisir votre mot de passe"}
                type={"password"}
                placeholder="********" // propriété optionnelle
                state={password}
                callable={(event) => setPassword(event.target.value)}
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
                  Se connecter
                </button>
              )}
            </div>

            <p className="mt-6 text-center text-gray-300 text-sm">
              Pas encore de compte ?{" "}
              <Link
                to={"/register"}
                className="text-green font-semibold hover:text-green_top underline underline-offset-2 transition-colors"
              >
                Créer un compte
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
    
  );
};

export default Login;