import React from 'react';
import { useNavigate } from 'react-router-dom';

const UserLogin = () => {
   const navigate = useNavigate();
   
   return (
      <div>
         <h1>Login</h1>
         <button onClick={() => navigate('/user_home_page')}>
            Login
         </button>
         <button onClick={() => navigate('/register')}>
            Register
         </button>
      </div>
   );
};

export default UserLogin;