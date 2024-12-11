import React, { useEffect, useState } from 'react';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import { useCookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';

const UserHomePage = () => {
   const [userData, setUserData] = useState(userLoginData.getData('user'));
   const [cookies, setCookie, removeCookie] = useCookies(['user']);
   const navigate = useNavigate();

   useEffect(() => {
      const updateListener = () => {
         setUserData(userLoginData.getData('user'));
      };
      userLoginData.subscribe(updateListener); // Subscribe to userLoginData updates
      return () => {
         userLoginData.unsubscribe(updateListener); // Unsubscribe when component unmounts
      };
   }, []);

   const handleLogout = () => {
      removeCookie('user', { path: '/' });
      userLoginData.setData('user', null);
      navigate('/login');
   };

   return (
      <>
         <h1>User Home Page</h1>
         <p>Welcome, {userData?.email}!</p>
         
         <button onClick={handleLogout}>Logout</button>
            
      </>
   );
};

export default UserHomePage;