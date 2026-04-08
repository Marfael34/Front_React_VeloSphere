import React, { useState } from "react";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import CustomInput from "../../components/UI/CustomInput";
import ErrorMessage from "../../components/UI/ErrorMessage";
import ButtonLoader from "../../components/Loader/ButtonLoader";
import axios from "axios";
import { API_ROOT } from "../../constants/apiConstant";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {setUser} = useOutletContext();
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    // MOUCHARD N°1 : Vérifions si l'URL de votre API est correcte
    console.log("Vérification API_ROOT :", API_ROOT);

    try {
      const response = await axios.post(`${API_ROOT}/api/login_check`, {
        email: email,
        password: password,
      }, {
        withCredentials: true
      });

      const token = response.data.token;
      setUser({email: email, token: token})
      navigate("/");
      
    } catch (error) {

      if (error.response && error.response.status === 401) {
        setErrorMessage("L'adresse email ou le mot de passe est incorrect.");
      } else {
        setErrorMessage("Erreur mystère : regardez la console F12 !");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-row items-center justify-center bg-dark-nigth-blue w-full min-h-[70vh] px-4 sm:px-6 py-8">
        <div className="md:w-xl lg:w-1/2 animate-slideup2">
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