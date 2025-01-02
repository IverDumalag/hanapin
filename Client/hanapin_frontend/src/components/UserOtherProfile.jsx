import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import userSelectData from '../../../../Client/hanapin_backend/data/UserSelectData';
import UserToolBar from '../components/UserToolBar';
import UserFilterBar from '../components/UserFilterBar';
import { Box, Button, TextField, Typography, Modal } from '@mui/material';
import UserMessagePreview from '../components/UserMessagePreview';

const UserOtherProfile = () => {
   const { userId } = useParams();
   const [userData, setUserData] = useState(null);
   const [posts, setPosts] = useState([]);
   const [error, setError] = useState(null);
   const [filterCriteria, setFilterCriteria] = useState({ barangay: '', month: '', year: '' });
   const [searchQuery, setSearchQuery] = useState('');
   const [viewProfile, setViewProfile] = useState(false);

   useEffect(() => {
      const selectedUserId = userSelectData.getSelectedPostUserId();
      if (selectedUserId) {
         fetchUserData(selectedUserId);
         fetchPosts(selectedUserId);
      }
   }, [userId]);

   const fetchUserData = async (userId) => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readUserByID.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ user_id: userId }),
         });
         const data = await response.json();
         if (response.ok) {
            setUserData(data.user);
         } else {
            setError(data.message);
         }
      } catch (error) {
         setError('Failed to fetch user data');
      }
   };

   const fetchPosts = async (userId) => {
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
            const userPosts = postsWithUserDetails.filter(post => post.user_id === userId);
            const sortedPosts = userPosts.sort((a, b) => new Date(b.post_date) - new Date(a.post_date));
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
            fetchPosts(userId);
         } else {
            const error = await response.json();
            console.error(error.message);
         }
      } catch (error) {
         console.error('Error deleting post:', error);
      }
   };

   const handleFilter = (criteria) => {
      setFilterCriteria(criteria);
   };

   const handleSearch = (query) => {
      setSearchQuery(query);
   };

   const filteredPosts = posts.filter((post) => {
      const matchesBarangay = filterCriteria.barangay ? post.last_barangay === filterCriteria.barangay : true;
      const matchesMonth = filterCriteria.month ? new Date(post.post_date).getMonth() + 1 === parseInt(filterCriteria.month) : true;
      const matchesYear = filterCriteria.year ? new Date(post.post_date).getFullYear() === parseInt(filterCriteria.year) : true;
      const matchesSearch = post.content_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
         post.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         post.last_name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesBarangay && matchesMonth && matchesYear && matchesSearch;
   });

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
                        <Box sx={{ display: 'flex', gap: 1, alignSelf: 'flex-end' }}>
                        <Button
                              variant="contained"
                              color="secondary"
                              sx={{ textTransform: 'none' }}
                           >
                              Message
                           </Button>
                           <Button
                              variant="contained"
                              color="primary"
                              onClick={() => setViewProfile(true)}
                              sx={{ textTransform: 'none' }}
                           >
                              View Profile
                           </Button>
                        </Box>
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

         <Modal open={viewProfile} onClose={() => setViewProfile(false)}>
            <Box sx={{ ...modalStyle }}>
               <Typography variant="h6">User Profile</Typography>
               <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  size="small"
                  value={`${userData?.first_name || ''} ${userData?.middle_name || ''} ${userData?.last_name || ''} ${userData?.extension || ''}`.trim()}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Email"
                  variant="outlined"
                  size="small"
                  value={userData?.email || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               />
               <Box sx={{ mt: 2 }}>
                  <label>Profile Picture</label>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 1 }}>
                     <img
                        src={userData?.profile_pic || 'https://via.placeholder.com/100'}
                        alt="Profile"
                        style={{
                           width: 100,
                           height: 100,
                           borderRadius: '50%',
                           marginBottom: 10,
                        }}
                     />
                  </Box>
               </Box>
               {/* <TextField
                  fullWidth
                  label="House Number"
                  variant="outlined"
                  size="small"
                  value={userData?.house_number || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               /> */}
               {/* <TextField
                  fullWidth
                  label="Street"
                  variant="outlined"
                  size="small"
                  value={userData?.street || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               /> */}
               {/* <TextField
                  fullWidth
                  label="Subdivision"
                  variant="outlined"
                  size="small"
                  value={userData?.subdivision || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               /> */}
               <TextField
                  fullWidth
                  label="Barangay"
                  variant="outlined"
                  size="small"
                  value={userData?.barangay || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="City/Municipality"
                  variant="outlined"
                  size="small"
                  value={userData?.city_municipality || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               />
               <TextField
                  fullWidth
                  label="Province"
                  variant="outlined"
                  size="small"
                  value={userData?.province || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               />
               {/* <TextField
                  fullWidth
                  label="Postal Code"
                  variant="outlined"
                  size="small"
                  value={userData?.postal_code || ''}
                  InputProps={{
                     readOnly: true,
                  }}
                  sx={{ mt: 2 }}
               /> */}
               <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button variant="outlined" color="secondary" onClick={() => setViewProfile(false)}>
                     Close
                  </Button>
               </Box>
            </Box>
         </Modal>
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

export default UserOtherProfile;