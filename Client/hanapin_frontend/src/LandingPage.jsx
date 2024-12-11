import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
   const navigate = useNavigate();

   const redirectToLogin = () => {
      navigate('/login');
   };

   const redirectToRegister = () => {
      navigate('/register');
   };

   return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
         <h1>Landing Page</h1>
         <button onClick={redirectToLogin} style={{ marginRight: '10px' }}>
            Login
         </button>
         <button onClick={redirectToRegister}>
            Register
         </button>
      </div>
   );
};

export default LandingPage;