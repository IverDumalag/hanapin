import React, { useState, useEffect } from 'react';
import AdminSideBar from '../components/AdminSideBar';
import AdminToolBar from '../components/AdminToolBar';
import userSelectAdminData from '../../../../Client/hanapin_backend/data/AdminLoginData';
import './AdminAccountManagement.css';
import axios from 'axios';

const AdminAccountManagement = () => {
   const [users, setUsers] = useState([]);
   const [userAdminData, setAdminUserData] = useState(userSelectAdminData.getData('admin'));
   const [showModal, setShowModal] = useState(false);
   const [showCreateModal, setShowCreateModal] = useState(false);
   const [userToDelete, setUserToDelete] = useState(null);
   const initialNewUserState = {
      first_name: '',
      middle_name: '',
      last_name: '',
      extension: '',
      email: '',
      profile_pic: '',
      password: '',
      role: '',
      date_of_birth: '',
      sex: '',
      house_number: '',
      street: '',
      subdivision: '',
      barangay: '',
      city_municipality: '',
      province: '',
      postal_code: ''
   };
   const [newUser, setNewUser] = useState(initialNewUserState);

   useEffect(() => {
      const updateListener = () => {
         setAdminUserData(userSelectAdminData.getData('admin'));
      };
      userSelectAdminData.subscribe(updateListener);
      return () => {
         userSelectAdminData.unsubscribe(updateListener);
      };
   }, []);

   useEffect(() => {
      const getUsers = async () => {
         const users = await fetchUsers();
         setUsers(users);
      };
      getUsers();
   }, []);

   const fetchUsers = async () => {
      try {
         const response = await fetch(import.meta.env.VITE_API_READ_ALL_USER);
         const data = await response.json();
         if (data.status === 200) {
            return data.users;
         } else {
            console.error('Failed to fetch users:', data.message);
            return [];
         }
      } catch (error) {
         console.error('Error fetching users:', error);
         return [];
      }
   };

   const deleteUser = async (userId) => {
      try {
         const response = await fetch(import.meta.env.VITE_API_DELETE_USER_ACCOUNT, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
         });

         if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            setUsers(users.filter(user => user.user_id !== userId));
         } else {
            const error = await response.json();
            console.error('Failed to delete user:', error.message);
         }
      } catch (error) {
         console.error('Error deleting user:', error);
      }
   };

   const createUser = async () => {
      try {
         const response = await fetch(import.meta.env.VITE_API_CREATE_USER_ACCOUNT, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(newUser),
         });

         if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            setUsers([...users, newUser]);
            setShowCreateModal(false);
            setNewUser(initialNewUserState);
         } else {
            const error = await response.json();
            console.error('Failed to create user:', error.message);
         }
      } catch (error) {
         console.error('Error creating user:', error);
      }
   };

   const handleDeleteClick = (userId) => {
      setUserToDelete(userId);
      setShowModal(true);
   };

   const handleConfirmDelete = () => {
      deleteUser(userToDelete);
      setShowModal(false);
      setUserToDelete(null);
   };

   const handleCreateClick = () => {
      setShowCreateModal(true);
   };

   const handleCreateSubmit = (e) => {
      e.preventDefault();
      createUser();
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewUser((prevData) => ({
         ...prevData,
         [name]: value,
      }));
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

            setNewUser((prevData) => ({
               ...prevData,
               profile_pic: directUrl,
            }));
         } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
         }
      }
   };

   const handleCloseCreateModal = () => {
      setShowCreateModal(false);
      setNewUser(initialNewUserState);
   };

   return (
      <>
         <AdminSideBar />
         <AdminToolBar />
         <div className="post-dashboard-welcome">
               <h1 className="post-dashboard-welcome-admin">Welcome Mr. {userAdminData.last_name}!</h1>
               <p className='post-dashboard-welcome-date'>{`Today is ${new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}</p>
            </div>

         <div className="admin-account-management-container">
            <div className="top-table">
               <h1>Account Table</h1>
               <button onClick={handleCreateClick} className='acm-btn-adduser'>Add User</button>
            </div>
            
            <table className="admin-account-management-table" cellPadding="10" cellSpacing="0">
               <thead>
                  <tr>
                     <th>User Name</th>
                     <th>Email</th>
                     <th>Role</th>
                     <th>Date Created</th>
                     <th>Date Modified</th>
                     <th>Action</th>
                  </tr>
               </thead>
               <tbody>
                  {users.map(user => (
                     <tr key={user.user_id}>
                        <td>{`${user.first_name} ${user.middle_name || ""} ${user.last_name} ${user.extension || ""}`}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>{user.created_at}</td>
                        <td>{user.updated_at}</td>
                        <td>
                           <button className='acm-btn-deleteuser' onClick={() => handleDeleteClick(user.user_id) }>Delete</button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <Modal
            show={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={handleConfirmDelete}
         />
         <CreateModal
            show={showCreateModal}
            onClose={handleCloseCreateModal}
            onSubmit={handleCreateSubmit}
            newUser={newUser}
            handleInputChange={handleInputChange}
            handleFileChange={handleFileChange}
         />
      </>
   );
};

const Modal = ({ show, onClose, onConfirm }) => {
   if (!show) {
      return null;
   }

   return (
      <div className="modal">
         <div className="modal-content">
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this user?</p>
            <button className="confirm" onClick={onConfirm}>Yes</button>
            <button className="cancel" onClick={onClose}>No</button>
         </div>
      </div>
   );
};

const CreateModal = ({ show, onClose, onSubmit, newUser, handleInputChange, handleFileChange }) => {
   if (!show) {
      return null;
   }

   return (
      <div className="modal">
         <div className="modal-content">
            <h2>Create User Account</h2>
            <form onSubmit={onSubmit}>
               <div className="form-row">
                  <div className="form-column">
                     <input type="text" name="first_name" placeholder="First Name" value={newUser.first_name} onChange={handleInputChange} required />
                     <input type="text" name="middle_name" placeholder="Middle Name" value={newUser.middle_name} onChange={handleInputChange} />
                     <input type="text" name="last_name" placeholder="Last Name" value={newUser.last_name} onChange={handleInputChange} required />
                     <input type="text" name="extension" placeholder="Extension" value={newUser.extension} onChange={handleInputChange} />
                     <input type="email" name="email" placeholder="Email" value={newUser.email} onChange={handleInputChange} required />
                     <input type="password" name="password" placeholder="Password" value={newUser.password} onChange={handleInputChange} required />
                  </div>
                  <div className="form-column">
                     <select name="role" value={newUser.role} onChange={handleInputChange} required>
                        <option value="">Select Role</option>
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                     </select>
                     <input type="date" name="date_of_birth" placeholder="Date of Birth" value={newUser.date_of_birth} onChange={handleInputChange} required />
                     <select name="sex" value={newUser.sex} onChange={handleInputChange} required>
                        <option value="">Select Sex</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                     </select>
                     <input type="text" name="house_number" placeholder="House Number" value={newUser.house_number} onChange={handleInputChange} required />
                     <input type="text" name="street" placeholder="Street" value={newUser.street} onChange={handleInputChange} required />
                     <input type="text" name="subdivision" placeholder="Subdivision" value={newUser.subdivision} onChange={handleInputChange} required />
                  </div>
                  <div className="form-column">
                     <input type="text" name="barangay" placeholder="Barangay" value={newUser.barangay} onChange={handleInputChange} required />
                     <input type="text" name="city_municipality" placeholder="City/Municipality" value={newUser.city_municipality} onChange={handleInputChange} required />
                     <input type="text" name="province" placeholder="Province" value={newUser.province} onChange={handleInputChange} required />
                     <input type="text" name="postal_code" placeholder="Postal Code" value={newUser.postal_code} onChange={handleInputChange} required />
                     <div className="profile-pic-container">
                        <label>Profile Picture</label>
                        {newUser.profile_pic && (
                           <div>
                              <img
                                 src={newUser.profile_pic}
                                 alt="Selected Profile"
                                 className="profile-pic-preview"
                              />
                           </div>
                        )}
                        <input type="file" onChange={handleFileChange} />
                     </div>
                  </div>
               </div>
               <div className="form-actions">
                  <button type="submit">Create</button>
                  <button type="button" onClick={onClose}>Cancel</button>
               </div>
            </form>
         </div>
      </div>
   );
};

export default AdminAccountManagement;