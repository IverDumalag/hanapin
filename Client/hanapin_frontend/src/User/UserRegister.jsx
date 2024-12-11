import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';

const UserRegister = () => {
   const navigate = useNavigate();
   const [googleUser, setGoogleUser] = useState(null);
   const [cookies, setCookie] = useCookies(['user']);

   const handleGoogleLoginSuccess = (credentialResponse) => {
      const decoded = jwtDecode(credentialResponse.credential);
      setGoogleUser(decoded);
      setCookie('user', JSON.stringify(decoded), { path: '/' });
      userLoginData.setData('user', decoded);
      console.log('Login Success:', decoded);
      console.log('User Email:', userLoginData.getData('user').email); 
   };

   const handleGoogleLoginError = () => {
      console.log('Login Failed');
   };

   return (
      <div>
         <h1>Register</h1>
         <GoogleLogin
            onSuccess={handleGoogleLoginSuccess}
            onError={handleGoogleLoginError}
         />
         <button onClick={() => navigate('/login')}>
            Go to Login
         </button>
      </div>
   );
};

export default UserRegister;