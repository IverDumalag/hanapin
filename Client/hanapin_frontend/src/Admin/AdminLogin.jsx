import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import adminLoginData from '../../../../Client/hanapin_backend/data/AdminLoginData';
import './AdminLogin.css';
import bgTemplate from '../../../../Client/hanapin_frontend/src/assets/BG TEMPLATE.png'; 

const AdminLogin = () => {
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
         const response = await axios.post('http://localhost/hanapin/Client/hanapin_backend/api/adminLogin.php', formData);
         if (response.data.status === 200) {
            adminLoginData.setData('admin', response.data.user);
            navigate('/admin_dashboard');
         } else {
            setError(response.data.message);
         }
      } catch (error) {
         setError('An error occurred. Please try again.');
      }
   };

   return (
      <div className="hanapin-admin-login-page" style={{ backgroundImage: `url(${bgTemplate})` }}>
         <form className="login-form" onSubmit={handleSubmit}>
            <h1>Admin Login</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            <div className='email-input'>
               <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email"
                  required
               />
            </div>
            <div className='password-input'>
               <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
               />
            </div>
            <button type="submit">LOGIN</button>
         </form>
      </div>
   );
};

export default AdminLogin;