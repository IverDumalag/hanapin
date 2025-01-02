import React, { useEffect, useState } from 'react';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import UserToolBar from '../components/UserToolBar';
import UserFilterBar from '../components/UserFilterBar';
import { Box, Button, TextField, Typography, Modal, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import UserMessagePreview from '../components/UserMessagePreview';
import axios from 'axios';

const UserProfile = () => {
   const [userData, setUserData] = useState(userLoginData.getData('user'));
   const [posts, setPosts] = useState([]);
   const [editProfile, setEditProfile] = useState(false);
   const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
   const [error, setError] = useState(null);
   const [filterCriteria, setFilterCriteria] = useState({ barangay: '', month: '', year: '' });
   const [searchQuery, setSearchQuery] = useState('');
   const [temporaryProfilePic, setTemporaryProfilePic] = useState(userData?.profile_pic);

   useEffect(() => {
      const updateListener = () => {
         setUserData(userLoginData.getData('user'));
      };
      userLoginData.subscribe(updateListener);
      return () => {
         userLoginData.unsubscribe(updateListener);
      };
   }, []);

   useEffect(() => {
      if (userData) {
         fetchPosts();
      }
   }, [userData]);

   const fetchPosts = async () => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readUserPost.php');
         const data = await response.json();
         if (response.ok) {
            const postsWithUserDetails = await Promise.all(data.posts.map(async (post) => {
               const userResponse = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readUserByID.php', {
                  method: 'POST',
                  headers: {
                     'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ user_id: post.user_id }),
               });
               const userData = await userResponse.json();
               if (userResponse.ok) {
                  return { ...post, ...userData.user };
               } else {
                  return post;
               }
            }));
            const sortedPosts = postsWithUserDetails.sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
            setPosts(sortedPosts);
            setError(null);
         } else {
            setError(data.message);
            setPosts([]);
         }
      } catch (error) {
         setError('Failed to fetch posts');
         setPosts([]);
      }
   };

   const handleDeletePost = async (postId) => {
      try {
         const response = await fetch(`http://localhost/hanapin/Client/hanapin_backend/api/deleteUserPost.php`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_id: postId }),
         });

         if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            fetchPosts();
         } else {
            const error = await response.json();
            console.error(error.message);
         }
      } catch (error) {
         console.error('Error deleting post:', error);
      }
   };

   const handleEditProfile = () => {
      setEditProfile(true);
   };

   const handleSaveProfile = async () => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/updateUserAccount.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
         });

         if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            setEditProfile(false);
            userLoginData.setData('user', userData); // Update local storage
         } else {
            const error = await response.json();
            console.error(error.message);
         }
      } catch (error) {
         console.error('Error updating profile:', error);
      }
   };

   const handleFilter = (criteria) => {
      setFilterCriteria(criteria);
   };

   const handleSearch = (query) => {
      setSearchQuery(query);
   };

   const filteredPosts = posts.filter((post) => {
      const isUserPost = post.user_id === userData.user_id;
      const matchesBarangay = filterCriteria.barangay ? post.last_barangay === filterCriteria.barangay : true;
      const matchesMonth = filterCriteria.month ? new Date(post.post_date).getMonth() + 1 === parseInt(filterCriteria.month) : true;
      const matchesYear = filterCriteria.year ? new Date(post.post_date).getFullYear() === parseInt(filterCriteria.year) : true;
      const matchesSearch = post.content_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
         post.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         post.last_name.toLowerCase().includes(searchQuery.toLowerCase());
      return isUserPost && matchesBarangay && matchesMonth && matchesYear && matchesSearch;
   });

   const handleConfirmSave = () => {
      setConfirmDialogOpen(true);
   };

   const handleConfirmDialogClose = (confirmed) => {
      setConfirmDialogOpen(false);
      if (confirmed) {
         handleSaveProfile();
      }
   };

   const googlePickerAccessToken = import.meta.env.VITE_GOOGLE_PICKER_ACCESS_TOKEN;
   const googleDriveFolderId = import.meta.env.VITE_GOOGLE_PICKER_FOLDER_ID;

   const handleFileChange = async (e) => {
      const file = e.target.files[0];
      if (file) {
         const tempUrl = URL.createObjectURL(file);
         setTemporaryProfilePic(tempUrl);
      }
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

            setUserData((prevData) => ({
               ...prevData,
               profile_pic: directUrl,
            }));
         } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
         }
      }
   };

   return (
      <>
         <Box sx={{ bgcolor: 'lightgrey', minHeight: '100vh' }}>
            <UserToolBar onSearch={handleSearch} />
            <Box sx={{ marginTop: '64px', display: 'flex' }}>
               <UserFilterBar onFilter={handleFilter} />
               <Box
                  sx={{
                     flex: 1,
                     padding: 2,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center',
                  }}
               >
                  <Box
                     width="70%"
                     sx={{
                        bgcolor: 'lightgrey',
                        borderRadius: 3,
                        boxShadow: 2,
                        p: 3,
                     }}
                  >
                     <Box
                        sx={{
                           bgcolor: 'white',
                           borderRadius: 3,
                           boxShadow: 2,
                           p: 3,
                           mt: 2,
                           display: 'flex',
                           flexDirection: 'column',
                           gap: 2,
                        }}
                     >
                        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                           User Profile
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                           <img
                              src={userData?.profile_pic || 'https://via.placeholder.com/100'}
                              alt="Profile"
                              style={{
                                 width: 100,
                                 height: 100,
                                 borderRadius: '50%',
                              }}
                           />
                           <Box>
                              <Typography variant="h6">
                                 {`${userData?.first_name || ''} ${userData?.middle_name || ''} ${userData?.last_name || ''} ${userData?.extension || ''}`.trim()}
                              </Typography>
                              <Typography variant="body1" color="textSecondary">
                                 {userData?.email || 'Email Address'}
                              </Typography>
                           </Box>
                        </Box>
                        <Button
                           variant="contained"
                           color="primary"
                           onClick={handleEditProfile}
                           sx={{ alignSelf: 'flex-end', textTransform: 'none' }}
                        >
                           Edit Profile
                        </Button>
                     </Box>

                     {/* Post Content */}
                     <Box sx={{ mt: 2 }}>
                        {filteredPosts.length > 0 ? (
                           filteredPosts.map((post, index) => (
                              <PostContent key={index} {...post} onDelete={handleDeletePost} />
                           ))
                        ) : (
                           <Typography variant="h6" align="center">
                              No posts found.
                           </Typography>
                        )}
                     </Box>
                  </Box>
               </Box>
               <UserMessagePreview />
            </Box>
         </Box>

         <Modal open={editProfile} onClose={() => setEditProfile(false)}>
            <Box sx={{ ...modalStyle }}>
               <Typography variant="h6">Edit Profile</Typography>
               <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  size="small"
                  value={userData.first_name}
                  onChange={(e) => setUserData({ ...userData, first_name: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Middle Name"
                  variant="outlined"
                  size="small"
                  value={userData.middle_name}
                  onChange={(e) => setUserData({ ...userData, middle_name: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  size="small"
                  value={userData.last_name}
                  onChange={(e) => setUserData({ ...userData, last_name: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Extension"
                  variant="outlined"
                  size="small"
                  value={userData.extension}
                  onChange={(e) => setUserData({ ...userData, extension: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  size="small"
                  value={userData.email}
                  onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                  sx={{ mt: 2 }}
                  InputProps={{
                     readOnly: true,
                  }}
               />
               <Box sx={{ mt: 2 }}>
                  <label>Profile Picture</label>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                     <img
                        src={temporaryProfilePic || 'https://via.placeholder.com/100'}
                        alt="Temporary Profile"
                        style={{
                           width: 100,
                           height: 100,
                           borderRadius: '50%',
                           marginBottom: 10,
                        }}
                     />
                     <input type="file" onChange={handleFileChange} />
                  </Box>
               </Box>
               <TextField
                  fullWidth
                  label="House Number"
                  variant="outlined"
                  size="small"
                  value={userData.house_number}
                  onChange={(e) => setUserData({ ...userData, house_number: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Street"
                  variant="outlined"
                  size="small"
                  value={userData.street}
                  onChange={(e) => setUserData({ ...userData, street: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Subdivision"
                  variant="outlined"
                  size="small"
                  value={userData.subdivision}
                  onChange={(e) => setUserData({ ...userData, subdivision: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Barangay"
                  variant="outlined"
                  size="small"
                  value={userData.barangay}
                  onChange={(e) => setUserData({ ...userData, barangay: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="City/Municipality"
                  variant="outlined"
                  size="small"
                  value={userData.city_municipality}
                  onChange={(e) => setUserData({ ...userData, city_municipality: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Province"
                  variant="outlined"
                  size="small"
                  value={userData.province}
                  onChange={(e) => setUserData({ ...userData, province: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Postal Code"
                  variant="outlined"
                  size="small"
                  value={userData.postal_code}
                  onChange={(e) => setUserData({ ...userData, postal_code: e.target.value })}
                  sx={{ mt: 2 }}
               />
               <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleConfirmSave}>
                     Save
                  </Button>
                  <Button variant="outlined" color="secondary" onClick={() => setEditProfile(false)}>
                     Cancel
                  </Button>
               </Box>
            </Box>
         </Modal>

         <Dialog
            open={confirmDialogOpen}
            onClose={() => handleConfirmDialogClose(false)}
         >
            <DialogTitle>Confirm Save</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure you want to save the changes to your profile?
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => handleConfirmDialogClose(false)} color="secondary">
                  Cancel
               </Button>
               <Button onClick={() => handleConfirmDialogClose(true)} color="primary">
                  Confirm
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

const PostContent = ({ profile_pic, first_name, last_name, content_text, content_picture, post_date, post_id, onDelete }) => {
   return (
      <Box
         sx={{
            mt: 4,
            p: 2,
            border: '1px solid #e0e0e0',
            bgcolor: 'white',
            borderRadius: 2,
         }}
      >
         <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <img
               src={profile_pic || 'https://via.placeholder.com/50'}
               alt="Profile"
               style={{ width: 50, height: 50, borderRadius: '50%' }}
            />
            <Typography variant="h6">{`${first_name || ''} ${last_name || ''}`.trim()}</Typography>
         </Box>

         <Box sx={{ mt: 2 }}>
            <Typography variant="body1">{content_text}</Typography>
         </Box>
         {content_picture && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
               <img
                  src={content_picture}
                  alt="Post Content"
                  style={{ borderRadius: 2, width: '100%', height: 'auto' }}
               />
            </Box>
         )}

         <Box sx={{ mt: 2 }}>
            <Typography variant="body2">Posted on: {new Date(post_date).toLocaleString()}</Typography>
         </Box>
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="primary">
               Comment
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => onDelete(post_id)}>
               Delete
            </Button>
         </Box>
      </Box>
   );
};

const modalStyle = {
   position: 'absolute',
   top: '50%',
   left: '50%',
   transform: 'translate(-50%, -50%)',
   width: 400,
   bgcolor: 'background.paper',
   border: '2px solid #000',
   boxShadow: 24,
   p: 4,
};

export default UserProfile;