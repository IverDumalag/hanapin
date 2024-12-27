import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';

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
      <div>
         <h1>Login</h1>
         {error && <p style={{ color: 'red' }}>{error}</p>}
         <form onSubmit={handleSubmit}>
            <div>
               <label>Email</label>
               <input type="email" name="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div>
               <label>Password</label>
               <input type="password" name="password" value={formData.password} onChange={handleChange} required />
            </div>
            <button type="submit">Login</button>
         </form>
         <button onClick={() => navigate('/register')}>
            Register Here
         </button>
      </div>
   );
};

export default UserLogin;