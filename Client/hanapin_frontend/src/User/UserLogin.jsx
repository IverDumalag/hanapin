import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import bgTemplate from '../../../../Client/hanapin_frontend/src/assets/BG TEMPLATE.png'; 
import './UserLogin.css';

const UserLogin = () => {
   const navigate = useNavigate();
   const [formData, setFormData] = useState({ email: '', password: '' });
   const [error, setError] = useState('');

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
         ...prevData,
         [name]: value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      try {
         const response = await axios.post('http://localhost/hanapin/Client/hanapin_backend/api/login.php', formData);
         if (response.data.status === 200) {
            userLoginData.setData('user', response.data.user);
            navigate('/user_home_page');
         } else {
            setError(response.data.message);
         }
      } catch (error) {
         setError('An error occurred. Please try again.');
      }
   };

   return (
      <div className="hanapin-login-page" style={{ backgroundImage: `url(${bgTemplate})` }}>
         <form className="login-form" onSubmit={handleSubmit}>
            <h1>Member Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className='email-input'>
               <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email"
               />
            </div>
            <div className='password-input'>
               <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="password"
                  required
               />
            </div>
            <p style={{fontFamily: 'Arial', color: '#AFB0CE'}}>Log in if you are already a member.</p>
            <button type="submit">LOGIN</button> <p style={{fontFamily: 'Arial', color: '#AFB0CE'}}>Register if you are not yet a member.</p>
            <button type="button" className="register-button" onClick={() => navigate('/register')} style={{ backgroundColor: '#BA96DD' }}>
               REGISTER
            </button>
         </form>
      </div>
   );
};

export default UserLogin;
