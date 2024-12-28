import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useCookies } from 'react-cookie';
import axios from 'axios';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import useDrivePicker from 'react-google-drive-picker';

const UserRegister = () => {
   const navigate = useNavigate();
   const [openPicker, authResponse] = useDrivePicker();
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
      // setCookie('user', JSON.stringify(decoded), { path: '/' });
      // userLoginData.setData('user', decoded);
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

   const googlePickerClientId = import.meta.env.VITE_GOOGLE_PICKER_CLIENT_ID;
   const googlePickerApiKey = import.meta.env.VITE_GOOGLE_PICKER_API_KEY;
   const googlePickerAccessToken = import.meta.env.VITE_GOOGLE_PICKER_ACCESS_TOKEN;
   const googleDriveFolderId = import.meta.env.VITE_GOOGLE_PICKER_FOLDER_ID; 

   const handleOpenPicker = () => {
      openPicker({
        clientId: googlePickerClientId,
        developerKey: googlePickerApiKey,
        viewId: "DOCS_IMAGES",
        token: googlePickerAccessToken,
        showUploadView: true,
        showUploadFolders: false,
        supportDrives: true,
        multiselect: false,
        customScopes: ['https://www.googleapis.com/auth/drive.file'],

        callbackFunction: (data) => {
         if (data.action === 'picked') {
            const file = data.docs[0];
            const fileId = file.id; 
            const directUrl = `https://drive.google.com/thumbnail?id=${fileId}`; 
            uploadFileToFolder(fileId);
            setFormData((prevData) => ({
               ...prevData,
               profile_pic: directUrl,
            }));
         } else if (data.action === 'cancel') {
            console.log('User clicked cancel/close button');
         }
      },
      });
    };

    const uploadFileToFolder = async (fileId) => {
      try {
         const response = await axios.post(
            `https://www.googleapis.com/drive/v3/files/${fileId}/copy`,
            {
               parents: [googleDriveFolderId],
            },
            {
               headers: {
                  Authorization: `Bearer ${googlePickerAccessToken}`,
               },
            }
         );
         const copiedFileId = response.data.id;
         const directUrl = `https://drive.google.com/thumbnail?id=${copiedFileId}`;

         await axios.delete(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
            headers: {
               Authorization: `Bearer ${googlePickerAccessToken}`,
            },
         });

         setFormData((prevData) => ({
            ...prevData,
            profile_pic: directUrl,
         }));
         console.log('File uploaded to folder:', response.data);
         return directUrl;
      } catch (error) {
         console.error('Error uploading file to folder:', error);
         return null;
      }
   };

   return (
      <div>
         <h1>Register</h1>
         <GoogleLogin onSuccess={handleGoogleLoginSuccess} onError={handleGoogleLoginError} />
         {googleUser && (
            <form onSubmit={handleSubmit}>
               <div style={{ marginTop: '20px' }}>
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
                  <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
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
               <div>
                  <label>Profile Picture</label>
                  {formData.profile_pic && (
                     <div>
                        <img
                           src={formData.profile_pic}
                           alt="Selected Profile"
                           style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', objectPosition: 'top center' }}
                        />
                     </div>
                  )}
                  <input type="text" name="profile_pic" value={formData.profile_pic} readOnly />
                  <button type="button" onClick={handleOpenPicker}>Select Picture</button>
               </div>
               <button type="submit">Register</button>
            </form>
         )}
         <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
   );
};

export default UserRegister;