import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomInput from "../../components/UI/CustomInput";
import ErrorMessage from "../../components/UI/ErrorMessage";
import ButtonLoader from "../../components/Loader/ButtonLoader";
import axios from "axios";
import { API_ROOT } from "../../constants/apiConstant";

const Register = () => {
  // on déclare nos state pour les valeurs du formulaire
    const [lastName, setLastName] = useState("");
    const [firstName, setFirstName] = useState("");
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
  
    };
  return (
    <>
      <div className="flex flex-row items-center justify-center bg-dark-nigth-blue w-full min-h-[70vh] px-4 sm:px-6 py-8">
        <div className="md:w-xl lg:w-1/2 animate-slideup2">
          <div className="text-center mb-8">
            <h1 className="title-h1">Créez votre compte</h1>
            <p className="text-gray-300 mt-2 text-sm">
              Rejoignez la communauté de La Roue Libre
            </p>
          </div>

          {/* formulaire */}
          <form
            onSubmit={handleSubmit}
            className="w-full rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 p-8 sm:p-10 shadow-2xl shadow-black_05"
          >
            <div className="space-y-1">
              <h2 className="flex justify-center pb-2 text-3xl font-bold underline">Profile</h2>
              <div className="flex flex-row gap-5 justify-center">
                <div className="w-1/2">
                  <CustomInput
                    label={"Saisir votre Nom"}
                    type={"text"}
                    placeholder="Martie" // propriété optionnelle
                    state={lastName}
                    callable={(event) => setLastName(event.target.value)}
                  />
                </div>
                <div className="w-1/2">
                  <CustomInput
                    label={"Saisir votre Prénom"}
                    type={"text"}
                    placeholder="Jean-Paul" // propriété optionnelle
                    state={firstName}
                    callable={(event) => setFirstName(event.target.value)}
                  />
                </div>
              </div>
              <CustomInput
                label={"Saisir votre date de naissance"}
                type={"date"}
                placeholder="" // propriété optionnelle
                state={birthday}
                callable={(event) => setBirthday(event.target.value)}
              />
              <CustomInput
                    label={"Saisir votre Pseudo"}
                    type={"text"}
                    placeholder="JPdu66" // propriété optionnelle
                    state={pseudo}
                    callable={(event) => setPseudo(event.target.value)}
                  />
            </div>
            <div className="space-y-1">
              <h2 className="flex justify-center pb-2 text-3xl font-bold underline">Adresse</h2>
              <div className="flex flex-wrap gap-5 md:flex-row">
                <div className="w-20 md:w-20">
                  <CustomInput
                    label={"N°"}
                    type={"text"}
                    placeholder="18 bis" // propriété optionnelle
                    state={nbAdress}
                    callable={(event) => setNbAdress(event.target.value)}
                  />
                </div>
                <div className="w-74 md:w-32 lg:w-75 xl:w-50 ">
                    <CustomInput
                      label={"Type de voie"}
                      type={"text"}
                      placeholder="Allées, Rue, ..." // propriété optionnelle
                      state={typeVoie}
                      callable={(event) => setTypeVoie(event.target.value)}
                    />
                  </div>
                  <div className="w-full md:w-61 lg:w-full xl:w-1/2 ">
                    <CustomInput
                      label={"Nom de la voie"}
                      type={"text"}
                      placeholder="Jean Datacenter" // propriété optionnelle
                      state={label}
                      callable={(event) => setLabel(event.target.value)}
                    />
                  </div>
                  
              </div>
              <CustomInput
                      label={"Complément d'adresse"}
                      type={"text"}
                      placeholder="Apprt. 404, Résidence du Bug" // propriété optionnelle
                      state={complement}
                      callable={(event) => setComplement(event.target.value)}
                    />
              <div className="flex flex-row gap-5">
                <div className="w-1/2">
                  <CustomInput
                      label={"Ville"}
                      type={"text"}
                      placeholder="Perpignan" // propriété optionnelle
                      state={city}
                      callable={(event) => setCity(event.target.value)}
                  />
                </div>
                <div className="w-1/2">
                   <CustomInput
                      label={"Code postal"}
                      type={"number"}
                      placeholder="66000" // propriété optionnelle
                      state={cp}
                      callable={(event) => setCp(event.target.value)}
                    />
                </div>
                
                   
              </div>
            </div>
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
                  S'inscrire
                </button>
              )}
            </div>

            <p className="mt-6 text-center text-gray-300 text-sm">
              Déjà un compte ?{" "}
              <Link
                to={"/login"}
                className="text-green font-semibold hover:text-green_top underline underline-offset-2 transition-colors"
              >
                Se connecter
              </Link>
            </p>
          </form>
        </div>
      </div>
    </>
    
  );
}

export default Register