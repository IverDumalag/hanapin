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
   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
   const [postToDelete, setPostToDelete] = useState(null);
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

   const handleDeletePost = (postId) => {
      setPostToDelete(postId);
      setDeleteDialogOpen(true);
   };

   const confirmDeletePost = async () => {
      try {
         const response = await fetch(`http://localhost/hanapin/Client/hanapin_backend/api/deletePost.php`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ post_id: postToDelete }),
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
      } finally {
         setDeleteDialogOpen(false);
         setPostToDelete(null);
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

   const handleDeleteDialogClose = (confirmed) => {
      setDeleteDialogOpen(false);
      if (confirmed) {
         confirmDeletePost();
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

      const [comments, setComments] = useState([]);
      const [commentModalOpen, setCommentModalOpen] = useState(false);
      const [selectedPostId, setSelectedPostId] = useState(null);
      const [newComment, setNewComment] = useState('');
   
      const handleOpenCommentModal = (postId) => {
         setSelectedPostId(postId);
         fetchComments(postId);
         setCommentModalOpen(true);
      };
   
      const handleCloseCommentModal = () => {
         setCommentModalOpen(false);
         setComments([]);
         setNewComment('');
         setFileUrl('');
      };
   
      const fetchComments = async (postId) => {
         try {
            const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/readPostComment.php', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify({ post_id: postId }),
            });
            const data = await response.json();
            if (response.ok) {
               setComments(data.comments);
            } else {
               console.error(data.message);
            }
         } catch (error) {
            console.error('Failed to fetch comments:', error);
         }
      };
   
      const handlePostComment = async () => {
         if (!newComment.trim()&& !fileUrl) return;
   
         const commentData = {
            post_id: selectedPostId,
            user_id: userData.user_id,
            comment: newComment,
            comment_image: fileUrl, 
         };
   
         try {
            console.log(commentData);
            const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/createPostComment.php', {
               method: 'POST',
               headers: {
                  'Content-Type': 'application/json',
               },
               body: JSON.stringify(commentData),
            });
   
            if (response.ok) {
               fetchComments(selectedPostId);
               setNewComment('');
               setFileUrl('');
            } else {
               const error = await response.json();
               console.error(error.message);
            }
         } catch (error) {
            console.error('Error posting comment:', error);
         }
      };

   const [fileUrl, setFileUrl] = useState('');

   const handleCommentFileChange = async (e) => {
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

            setFileUrl(directUrl);
         } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
         }
      }
   };

   const onFound = async (postId) => {
      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/updatePostToFound.php', {
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
         console.error('Error updating post to FOUND:', error);
      }
   };

   const [confirmFoundDialogOpen, setFoundConfirmDialogOpen] = useState(false);
   
   const handleFoundConfirmDialogOpen = (postId) => {
      setSelectedPostId(postId);
      setFoundConfirmDialogOpen(true);
   };
   
   const handleFoundConfirmDialogClose = async (isConfirmed) => {
      setFoundConfirmDialogOpen(false);
      if (isConfirmed && selectedPostId !== null) {
         await onFound(selectedPostId);
         setSelectedPostId(null);
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
                     width="85%"
                     
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
                     <br></br>
                     <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
                           Post
                        </Typography>
                     {/* Post Content */}
                     <Box sx={{ mt: 2 }}>
                        {filteredPosts.length > 0 ? (
                           filteredPosts.map((post, index) => (
                              <PostContent key={index} {...post} onDelete={handleDeletePost} onCommentClick={handleOpenCommentModal} onFound={handleFoundConfirmDialogOpen}/>
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
            <Box
               sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '600px',
                  bgcolor: '#fff',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  p: 4,
               }}
            >
               <Typography
                  variant="h6"
                  sx={{
                     fontSize: '24px',
                     fontWeight: 'bold',
                     mb: 2,
                  }}
               >
                  Edit Profile
               </Typography>

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
                  <label
                     style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        marginBottom: '8px',
                        display: 'block',
                     }}
                  >
                     Profile Picture
                  </label>
                  <Box
                     sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mt: 1,
                     }}
                  >
                     <img
                        src={temporaryProfilePic || 'https://via.placeholder.com/100'}
                        alt="Temporary Profile"
                        style={{
                           width: '100px',
                           height: '100px',
                           borderRadius: '50%',
                           marginBottom: '10px',
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

               <Box
                  sx={{
                     display: 'flex',
                     justifyContent: 'space-between',
                     mt: 3,
                  }}
               >
                  <Button
                     variant="contained"
                     color="primary"
                     onClick={handleConfirmSave}
                     sx={{
                        backgroundColor: '#f5b8c7',
                        color: '#fff',
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        '&:hover': {
                           backgroundColor: '#ec9aac',
                        },
                     }}
                  >
                     Save
                  </Button>
                  <Button
                     variant="outlined"
                     color="secondary"
                     onClick={() => setEditProfile(false)}
                     sx={{
                        borderColor: '#f5b8c7',
                        color: '#f5b8c7',
                        padding: '10px 20px',
                        fontSize: '16px',
                        borderRadius: '8px',
                        '&:hover': {
                           backgroundColor: '#f5b8c7',
                           color: '#fff',
                        },
                     }}
                  >
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

         <Dialog
            open={deleteDialogOpen}
            onClose={() => handleDeleteDialogClose(false)}
         >
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure you want to delete this post?
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => handleDeleteDialogClose(false)} color="secondary">
                  Cancel
               </Button>
               <Button onClick={() => handleDeleteDialogClose(true)} color="primary">
                  Confirm
               </Button>
            </DialogActions>
         </Dialog>

         <Modal open={commentModalOpen} onClose={handleCloseCommentModal}>
            <Box sx={{ ...modalStyle, width: 900 }}>
               <Typography variant="h6">Comments</Typography>
                  <Box sx={{ maxHeight: 400, overflowY: 'auto', mt: 2 }}>
                     {comments.length > 0 ? (
                     comments.map((comment, index) => (
                     <Box key={index} sx={{ mb: 2 }}>
                     <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                        {comment.first_name} {comment.last_name}
                     </Typography>
                        {comment.comment_image && (
                           <Box
                              component="img"
                              src={comment.comment_image.replace('uc', 'thumbnail')}
                              alt="Message Image"
                              sx={{ maxWidth: '100%', maxHeight: 200, marginTop: 1 }}
                           />
                           )}
                           <Typography variant="body2">{comment.comment}</Typography>
                           <Typography variant="caption" color="textSecondary">
                              {new Date(comment.comment_date).toLocaleString()}
                           </Typography>
                           </Box>
                           ))
                           ) : (
                           <Typography variant="body2" align="center">
                              No comments yet.
                           </Typography>
                           )}
                     </Box>
                  <TextField
                     fullWidth
                     variant="outlined"
                     size="small"
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                     placeholder="Write a comment..."
                     sx={{ mt: 2 }}
                  />
               <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
               {fileUrl && (
                <Box
                   component="img"
                  src={fileUrl}
                  alt="Selected File"
                  sx={{ maxWidth: '100%', maxHeight: 100, marginBottom: 2 , marginTop: 2}}
               />
               )}
               </Box>
               <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>            
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                     <Button variant="contained" component="label">
                        Add File
                     <input type="file" hidden onChange={handleCommentFileChange} />
                     </Button>
                  </Box>
                  <Button variant="contained" color="primary" onClick={handlePostComment}>
                     Post Comment
                  </Button>
               </Box>
            </Box>
         </Modal>

         <Dialog
            open={confirmFoundDialogOpen}
            onClose={() => handleFoundConfirmDialogClose(false)}
         >
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogContent>
               <DialogContentText>
                  Are you sure you want to mark this post as "Found"?
               </DialogContentText>
            </DialogContent>
            <DialogActions>
               <Button onClick={() => handleFoundConfirmDialogClose(false)} color="secondary">
                  Cancel
               </Button>
               <Button onClick={() => handleFoundConfirmDialogClose(true)} color="primary">
                  Confirm
               </Button>
            </DialogActions>
         </Dialog>
      </>
   );
};

const PostContent = ({ profile_pic, first_name, last_name, content_text, content_picture, last_street, last_subdivision, last_barangay, content_state, post_date, user_id, post_id, onProfileClick, onCommentClick, onDelete, onFound}) => {
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
               style={{ width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}
               onClick={() => onProfileClick(user_id)}
            />
            <Typography
               variant="h6"
               sx={{ cursor: 'pointer' }}
               onClick={() => onProfileClick(user_id)}
            >
               {`${first_name || ''} ${last_name || ''}`.trim()}
            </Typography>
         </Box>
         
         <Box sx={{ mt: 2 }}>
            <Typography variant="body1">Status: {content_state}</Typography>
            <Typography variant="body1">{content_text}</Typography>
         </Box>
         {content_picture && (
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
               <img
                  src={content_picture.replace('uc', 'thumbnail')}
                  alt="Post Content Thumbnail"
                  style={{ borderRadius: 2, width: '100%', height: 'auto', cursor: 'pointer' }}
                  onClick={() => window.open(content_picture.replace('thumbnail', 'uc'), '_blank', 'noopener,noreferrer')}
               />
            </Box>
         )}

         <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
               Last seen at: {last_street ? `${last_street}, ` : ''}{last_subdivision}, {last_barangay}
            </Typography>
            <Typography variant="body2">
               Posted on: {new Date(post_date).toLocaleString()}
            </Typography>
         </Box>
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
         <Button
            variant="contained"
            color="primary"
            onClick={() => onCommentClick(post_id)}
            sx={{
               backgroundColor: '#AFB0CE',
               color: '#fff',
               padding: '8px 16px',
               fontSize: '14px',
               borderRadius: '5px',
               textTransform: 'none',
               boxShadow: 'none',
               '&:hover': {
                  backgroundColor: '#1565c0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
               },
            }}
         >
            COMMENT
         </Button>
         <Button
               variant="text"
               color="secondary"
               onClick={() => onDelete(post_id)}
               sx={{
                  borderColor: '#d32f2f',
                  color: '#d32f2f',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  borderRadius: '8px',
                  textTransform: 'none',
                  '&:hover': {
                     backgroundColor: '#f8d7da',
                     borderColor: '#c62828',
                     color: '#AFB0CE',
                  },
               }}
            >
               Delete
            </Button>
            <Button
                  variant="text"
                  onClick={() => onFound(post_id)}
                  sx={{
                     padding: '8px 16px',
                     fontSize: '14px',
                     fontWeight: 'bold',
                     borderRadius: '8px',
                     textTransform: 'none'
                  }}
               >
                  Set To Found
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