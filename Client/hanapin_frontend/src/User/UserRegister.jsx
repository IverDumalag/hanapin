import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';

const UserRegister = () => {
   const navigate = useNavigate();
   const [googleUser, setGoogleUser] = useState(null);
   const [cookies, setCookie] = useCookies(['user']);
   const [userData, setUserData] = useState(userLoginData.getData('user'));
   const [formData, setFormData] = useState({
      first_name: '' ,
      middle_name: '',
      last_name: '',
      extension: '',
      email: userData.email,
      profile_pic: '',
      password: '',
      role: 'User',
      date_of_birth: '',
      sex: '',
      house_number: '',
      street: '',
      subdivision: '',
      barangay: '',
      city_municipality: '',
      province: '',
      postal_code: '',
   });

   const handleGoogleLoginSuccess = (credentialResponse) => {
      const decoded = jwtDecode(credentialResponse.credential);
      setGoogleUser(decoded);
      setCookie('user', JSON.stringify(decoded), { path: '/' });
      userLoginData.setData('user', decoded);
      console.log('Login Success:', decoded);
      console.log('User Email:', userLoginData.getData('user').email);
   };
   
   useEffect(() => {
      const updateListener = () => {
         setUserData(userLoginData.getData('user'));
      };
      userLoginData.subscribe(updateListener); // Subscribe to userLoginData updates
      return () => {
         userLoginData.unsubscribe(updateListener); // Unsubscribe when component unmounts
      };
   }, []);

   const handleGoogleLoginError = () => {
      console.log('Login Failed');
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({
         ...formData,
         [name]: value,
      });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      // Submit form data to the backend using axios
      axios.post('http://localhost/hanapin/Client/hanapin_backend/api/createUserAccount.php', formData)
         .then((response) => {
            if (response.data.status === 201) {
               console.log('User Created Successfully');
               navigate('/login');
            } else {
               console.error('Error:', response.data.message);
            }
         })
         .catch((error) => {
            console.error('Error:', error);
         });
   };

   return (
      <div>
         <h1>Register</h1>
         <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
         {googleUser && (
            <form onSubmit={handleSubmit}>
               <div>
                  <label>First Name</label>
                  <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
               </div>
               <div>
                  <label>Middle Name</label>
                  <input type="text" name="middle_name" placeholder="Middle Name" value={formData.middle_name} onChange={handleChange} />
               </div>
               <div>
                  <label>Last Name</label>
                  <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
               </div>
               <div>
                  <label>Extension</label>
                  <input type="text" name="extension" placeholder="Extension" value={formData.extension} onChange={handleChange} />
               </div>
               <div>
                  <label>Email</label>
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} readOnly />
               </div>
               <div>
                  <label>Password</label>
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
               </div>
               <div>
                  <label>Date of Birth</label>
                  <input type="date" name="date_of_birth" placeholder="Date of Birth" value={formData.date_of_birth} onChange={handleChange} required />
               </div>
               <div>
                  <label>Sex</label>
                  <select name="sex" value={formData.sex} onChange={handleChange} required>
                     <option value="">Select</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                  </select>
               </div>
               <div>
                  <label>House Number</label>
                  <input type="text" name="house_number" placeholder="House Number" value={formData.house_number} onChange={handleChange} required />
               </div>
               <div>
                  <label>Street</label>
                  <input type="text" name="street" placeholder="Street" value={formData.street} onChange={handleChange} required />
               </div>
               <div>
                  <label>Subdivision</label>
                  <input type="text" name="subdivision" placeholder="Subdivision" value={formData.subdivision} onChange={handleChange} required />
               </div>
               <div>
                  <label>Barangay</label>
                  <input type="text" name="barangay" placeholder="Barangay" value={formData.barangay} onChange={handleChange} required />
               </div>
               <div>
                  <label>City/Municipality</label>
                  <input type="text" name="city_municipality" placeholder="City/Municipality" value={formData.city_municipality} onChange={handleChange} required />
               </div>
               <div>
                  <label>Province</label>
                  <input type="text" name="province" placeholder="Province" value={formData.province} onChange={handleChange} required />
               </div>
               <div>
                  <label>Postal Code</label>
                  <input type="text" name="postal_code" placeholder="Postal Code" value={formData.postal_code} onChange={handleChange} required />
               </div>
               <button type="submit">Register</button>
            </form>
         )}
         <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
   );
};

export default UserRegister;