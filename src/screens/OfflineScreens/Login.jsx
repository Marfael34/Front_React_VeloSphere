import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomInput from "../../components/UI/CustomInput";
import ErrorMessage from "../../components/UI/ErrorMessage";
import ButtonLoader from "../../components/Loader/ButtonLoader";
import axios from "axios";
import { API_ROOT } from "../../constants/apiConstant";

// 1. On importe le contexte
import { AuthContext } from "../../contexts/AuthContext"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // 2. On utilise useContext au lieu de useOutletContext
  const { setUser } = useContext(AuthContext);
  
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const response = await axios.post(`${API_ROOT}/api/login_check`, {
        email: email,
        password: password,
      }, {
        withCredentials: true
      });

      const token = response.data.token;
      
      // On met à jour l'utilisateur globalement
      setUser({email: email, token: token});
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
    // 3. Ajustement du CSS pour prendre toute la hauteur disponible sous la Navbar
    // min-h-[calc(100vh-4rem)] permet de centrer parfaitement sans scroll inutile
    <div className="flex flex-col items-center justify-center w-full min-h-[calc(100vh-4rem)] px-4 sm:px-6 py-8 bg-transparent">
      
      <div className="w-full md:w-xl lg:w-125 animate-slideup2">
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
              className="text-orange hover:text-orange/80 font-semibold underline underline-offset-2 transition-colors"
            >
              Créer un compte
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;