import React from 'react';
import { useNavigate } from 'react-router-dom';
import bgTemplate from './assets/BG TEMPLATE.png';
import './LandingPage.css';

const LandingPage = () => {
   const navigate = useNavigate();

   const redirectToLogin = () => {
      navigate('/login');
   };

   const redirectToRegister = () => {
      navigate('/register');
   };

   return (
      <div className="hanapin-landing-page" style={{ backgroundImage: `url(${bgTemplate})` }}>
         <div className="hanapin-text-container">
            <div className="hanapin-title">
               <h1>
                  Hana<span>PIN,</span>
               </h1>
            </div>

            <div className="hanapin-subtitle">
               <p>Helps Paws find <br></br>their way home</p>
            </div>

            <div className="hanapin-description">
               <p>HanaPin is a community app that helps reunite lost pets with their owners. <br></br> HanaPin connects people and pets quickly with real-time alerts.</p>
            </div>

         </div>
            <div className="hanapin-button-container">
               <button onClick={redirectToLogin} className="hanapin-login-button">
                  LOGIN
               </button>
               <button onClick={redirectToRegister} className="hanapin-register-button">
                  REGISTER
               </button>
         </div>
      </div>
   );
};

export default LandingPage;
