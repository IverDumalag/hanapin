import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import './UserRegister.css';

const UserRegister = () => {
   const navigate = useNavigate();
   const [googleUser, setGoogleUser] = useState(null);
   const [cookies, setCookie, removeCookie] = useCookies(['user']);
   const [userData, setUserData] = useState(userLoginData.getData('user') || {});
   const [formData, setFormData] = useState({
      first_name: '',
      middle_name: '',
      last_name: '',
      extension: '',
      email: userData.email || '',
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

   const checkEmailExists = async (email) => {
      try {
         const response = await axios.post('http://localhost/hanapin/Client/hanapin_backend/api/readUserEmail.php', { email });
         console.log('checkEmailExists response:', response.data);
         return response.data.status === 200;
      } catch (error) {
         console.error('Error checking email:', error);
         return false;
      }
   };

   const handleGoogleLoginSuccess = async (credentialResponse) => {
      const decoded = jwtDecode(credentialResponse.credential);
      setGoogleUser(decoded);
      setFormData((prevFormData) => ({
         ...prevFormData,
         email: decoded.email,
      }));
      console.log('Login Success:', decoded);

      const emailExists = await checkEmailExists(decoded.email);
      console.log('Email exists:', emailExists);
      if (emailExists) {
         const confirmRedirect = window.confirm('Email already registered. Redirecting to login page.');
         removeCookie('user', { path: '/' });
         userLoginData.setData('user', null);
         if (confirmRedirect) {
            navigate('/login');
         }
      }
   };

   useEffect(() => {
      const updateListener = () => {
         setUserData(userLoginData.getData('user') || {});
      };
      userLoginData.subscribe(updateListener);
      return () => {
         userLoginData.unsubscribe(updateListener);
      };
   }, []);

   const handleGoogleLoginError = () => {
      console.error('Google Login Failed');
   };

   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
         ...prevData,
         [name]: value,
      }));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!googleUser) {
         console.error('Google user data not retrieved');
         return;
      }

      console.log('Submitting form data:', formData);

      try {
         const response = await axios.post('http://localhost/hanapin/Client/hanapin_backend/api/createUserAccount.php', formData);
         console.log('Response:', response.data);
         if (response.data.status === 201) {
            console.log('User Created Successfully');
            removeCookie('user', { path: '/' });
            userLoginData.setData('user', null);
            navigate('/login');
         } else {
            console.error('Error:', response.data.message);
         }
      } catch (error) {
         console.error('Error submitting data:', error);
      }
   };

   const googlePickerAccessToken = import.meta.env.VITE_GOOGLE_PICKER_ACCESS_TOKEN;
   const googleDriveFolderId = import.meta.env.VITE_GOOGLE_PICKER_FOLDER_ID;

   const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
         const metadata = {
            name: file.name,
            parents: [googleDriveFolderId],
         };

         const formData = new FormData();
         formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
         formData.append('file', file);

         try {
            const response = await axios.post(
               `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart`,
               formData,
               {
                  headers: {
                     Authorization: `Bearer ${googlePickerAccessToken}`,
                     'Content-Type': 'multipart/related',
                  },
               }
            );

            const fileId = response.data.id;
            const directUrl = `https://drive.google.com/thumbnail?id=${fileId}`;

            setFormData((prevData) => ({
               ...prevData,
               profile_pic: directUrl,
            }));
         } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
         }
      }
   };

   return (
      <div style={{ fontSize: '12px', display: 'flex', color: '#AFB0CE', fontFamily: 'Arial', flexDirection: 'column', alignItems: 'center' }}>

         <h1>Sign In your Google Account to Register !</h1>
         <br></br>
         <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} /> 
         {googleUser && (

         
            <form onSubmit={handleSubmit} className="form-container"> 
               <div className="FIRSTNAME">
                  <label>First Name</label>
                  <input type="text" name="first_name" placeholder="First Name" value={formData.first_name} onChange={handleChange} required />
               </div>

               <div className="MIDDLENAME">
                  <label>Middle Name</label>
                  <input type="text" name="middle_name" placeholder="Middle Name" value={formData.middle_name} onChange={handleChange} />
               </div>

               <div className="LASTNAME">
                  <label>Last Name</label>
                  <input type="text" name="last_name" placeholder="Last Name" value={formData.last_name} onChange={handleChange} required />
               </div>

               <div className="EXTENSION"> 
                  <label>Extension</label>
                  <input type="text" name="extension" placeholder="Extension" value={formData.extension} onChange={handleChange} />
               </div>

               <div className="EMAIL">
                  <label>Email</label>
                  <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} readOnly />
               </div>

               <div className="PASSWORD">
                  <label>Password</label>
                  <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
               </div>

               <div className="DATE_OF_BIRTH">
                  <label>Date of Birth</label>
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
               </div>

               <div className="SEXq">
                  <label>Sex</label>
                  <select name="sex" value={formData.sex} onChange={handleChange} required>
                     <option value="">Select</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                  </select>
               </div>

               <div className="HOUSENUMBER">
                  <label>House Number</label>
                  <input type="text" name="house_number" placeholder="House Number" value={formData.house_number} onChange={handleChange} required />
               </div>

               <div className="STREET">
                  <label>Street</label>
                  <input type="text" name="street" placeholder="Street" value={formData.street} onChange={handleChange} required />
               </div>

               <div className="SUBDIVISION">
                  <label>Subdivision</label>
                  <input type="text" name="subdivision" placeholder="Subdivision" value={formData.subdivision} onChange={handleChange} required />
               </div>

               <div className="BARANGAY">
                  <label>Barangay</label>
                  <input type="text" name="barangay" placeholder="Barangay" value={formData.barangay} onChange={handleChange} required />
               </div>

               <div className="CITYMUNICIPALITY">
                  <label>City/Municipality</label>
                  <input type="text" name="city_municipality" placeholder="City/Municipality" value={formData.city_municipality} onChange={handleChange} required />
               </div>

               <div className="PROVINCE">
                  <label>Province</label>
                  <input type="text" name="province" placeholder="Province" value={formData.province} onChange={handleChange} required />
               </div>

               <div className="POSTALCODE">
                  <label>Postal Code</label>
                  <input type="text" name="postal_code" placeholder="Postal Code" value={formData.postal_code} onChange={handleChange} required />
               </div>

               <div className="PROFILEPIC">
                  <label style={{fontSize: '1rem'}}>Profile Picture </label>
                  {formData.profile_pic && (
                     <div>
                        <img
                           src={formData.profile_pic}
                           alt="Selected Profile"
                           style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center' }}
                        />
                     </div>
                  )}
                  <input className='file'type="file" onChange={handleFileChange} />
               </div>
               <button className='register-button' type="submit">REGISTER ME !</button>
            </form>
         )}
         <br></br>
         <button className= 'gobacktologin'style={{padding: '15px', width: '200px', textAlign: 'center', fontFamily: 'Arial'}} onClick={() => navigate('/login')}>GO BACK TO LOGIN</button>
      </div>
   );
};

export default UserRegister;