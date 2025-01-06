import React, { useEffect, useState } from 'react';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import UserToolBar from '../components/UserToolBar';
import UserFilterBar from '../components/UserFilterBar';
import { Box, Button, TextField, Typography, Modal } from '@mui/material';
import UserMessagePreview from '../components/UserMessagePreview';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import userSelectData from '../../../../Client/hanapin_backend/data/UserSelectData';

const UserHomePage = () => {
   const [userData, setUserData] = useState(userLoginData.getData('user'));
   const [filter, setFilter] = useState('ALL'); 
   const [posts, setPosts] = useState([]);
   const [open, setOpen] = useState(false);
   const [newPost, setNewPost] = useState({
      profilePic: '',
      username: '',
      content: '',
      contentPic: '',
      lastStreet: '',
      lastSubdivision: '',
      lastBarangay: '',
      contentState: 'MISSING',
   });
   const [error, setError] = useState(null);
   const [filterCriteria, setFilterCriteria] = useState({ barangay: '', month: '', year: '' });
   const [searchQuery, setSearchQuery] = useState('');
   const navigate = useNavigate();

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
      fetchPosts();
   }, []);

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

   const handleOpen = () => setOpen(true);
   const handleClose = () => {
      clearModalContent();
      setOpen(false);
   };

   const clearModalContent = () => {
      setNewPost({
         profilePic: '',
         username: '',
         content: '',
         contentPic: '',
         lastStreet: '',
         lastSubdivision: '',
         lastBarangay: '',
         contentState: 'MISSING',
      });
   };

   const handleCreatePost = async () => {
      const postData = {
         user_id: userData.user_id,
         content_text: newPost.content,
         content_picture: newPost.contentPic,
         last_street: newPost.lastStreet,
         last_subdivision: newPost.lastSubdivision,
         last_barangay: newPost.lastBarangay,
         content_state: newPost.contentState,
      };

      try {
         const response = await fetch('http://localhost/hanapin/Client/hanapin_backend/api/createUserPost.php', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(postData),
         });

         if (response.ok) {
            const result = await response.json();
            console.log(result.message);
            fetchPosts();
            handleClose();
         } else {
            const error = await response.json();
            console.error(error.message);
         }
      } catch (error) {
         console.error('Error creating post:', error);
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

            setNewPost((prevData) => ({
               ...prevData,
               contentPic: directUrl,
            }));
         } catch (error) {
            console.error('Error uploading file to Google Drive:', error);
         }
      }
   };

   const handleFilter = (criteria) => {
      setFilterCriteria(criteria);
   };

   const handleSearch = (query) => {
      setSearchQuery(query);
   };

   const filteredPosts = posts.filter((post) => {
      const matchesFilter = filter === 'ALL' ? true : post.content_state === filter;
      const matchesBarangay = filterCriteria.barangay ? post.last_barangay === filterCriteria.barangay : true;
      const matchesMonth = filterCriteria.month ? new Date(post.post_date).getMonth() + 1 === parseInt(filterCriteria.month) : true;
      const matchesYear = filterCriteria.year ? new Date(post.post_date).getFullYear() === parseInt(filterCriteria.year) : true;
      const matchesSearch = post.content_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   post.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   post.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   post.last_street.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   post.last_subdivision.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   post.last_barangay.toLowerCase().includes(searchQuery.toLowerCase())||
                   post.content_state.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesBarangay && matchesMonth && matchesYear && matchesSearch;
   });

   const isCreatePostDisabled = !newPost.content || !newPost.lastStreet || !newPost.lastSubdivision || !newPost.lastBarangay || !newPost.contentPic;

   const handleProfileClick = (userId) => {
      userSelectData.setSelectedPostUserId(userId);
      console.log('Selected post user ID:', userId);
      navigate(`/user_otherprofile`);
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
                  sx={{
                     bgcolor: 'white',
                     borderRadius: 3,
                     boxShadow: 2,
                     p: 3,
                  }}
               >
                  <Box>
                     <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <img
                           src={
                              userData?.profile_pic ||
                              'https://via.placeholder.com/40'
                           }
                           alt="Profile"
                           style={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              cursor: 'pointer',
                           }}
                           onClick={() => handleProfileClick(userData.user_id)}
                        />
                     </Box>
                     <Box
                        sx={{
                           display: 'flex',
                           justifyContent: 'space-around',
                           mt: 2,
                        }}
                     >
                        <Button
                           className="create-post-button"
                           variant="contained"
                           onClick={handleOpen}
                           >
                           Create Post
                        </Button>
                     </Box>
                  </Box>

                  {/* Missing Found Section */}
                  <Box
                     sx={{
                        display: 'flex',
                        justifyContent: 'space-around',
                        mt: 2,
                     }}
                  >
                     <Button variant="text" color="primary" onClick={() => setFilter('MISSING')}>
                        Missing
                     </Button>
                     
                     <Button variant="text" color="primary" onClick={() => setFilter('ALL')}>
                        All
                     </Button>

                     <Button variant="text" color="primary" onClick={() => setFilter('FOUND')}>
                        Found
                     </Button>
                  </Box>

                  {/* Post Content */}
                  <Box sx={{ mt: 2 }}>
                     {filteredPosts.length > 0 ? (
                        filteredPosts.map((post, index) => (
                           <div
                              key={index}
                              style={{
                                 marginTop: '16px',
                                 padding: '16px',
                                 border: '1px solid #e0e0e0',
                                 backgroundColor: 'white',
                                 borderRadius: '8px',
                              }}
                           >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                 <img
                                    src={post.profile_pic || 'https://via.placeholder.com/50'}
                                    alt="Profile"
                                    style={{ width: 50, height: 50, borderRadius: '50%', cursor: 'pointer' }}
                                    onClick={() => handleProfileClick(post.user_id)}
                                 />
                                 <Typography
                                    variant="h6"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleProfileClick(post.user_id)}
                                 >
                                    {`${post.first_name || ''} ${post.last_name || ''}`.trim()}
                                 </Typography>
                              </div>
                              
                              <div style={{ marginTop: '16px' }}>
                                 <Typography variant="body1">Status: {post.content_state}</Typography>
                                 <Typography variant="body1">{post.content_text}</Typography>
                              </div>
                              {post.content_picture && (
                                 <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'center' }}>
                                    <img
                                       src={post.content_picture.replace('uc', 'thumbnail')}
                                       alt="Post Content Thumbnail"
                                       style={{ borderRadius: '8px', width: '100%', height: 'auto', cursor: 'pointer' }}
                                       onClick={() => window.open(post.content_picture.replace('thumbnail', 'uc'), '_blank', 'noopener,noreferrer')}
                                    />
                                 </div>
                              )}

                              <div style={{ marginTop: '16px' }}>
                                 <Typography variant="body2">
                                    Last seen at: {post.last_street ? `${post.last_street}, ` : ''}{post.last_subdivision}, {post.last_barangay}
                                 </Typography>
                                 <Typography variant="body2">
                                    Posted on: {new Date(post.post_date).toLocaleString()}
                                 </Typography>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                 <Button variant="contained" color="primary" onClick={() => handleOpenCommentModal(post.post_id)}>
                                    Comment
                                 </Button>
                              </div>
                           </div>
                        ))
                     ) : (
                        <Typography variant="h6" align="center">
                           No Result Found :{`(`}
                        </Typography>
                     )}
                  </Box>
               </Box>
            </Box>
            <UserMessagePreview />
         </Box>
      </Box>

      <Modal open={open} onClose={handleClose}>
         <Box sx={{ ...modalStyle }}>
            <Typography variant="h6">Create a New Post</Typography>
            <TextField
               fullWidth
               label="Content"
               variant="outlined"
               size="small"
               value={newPost.content}
               onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
               sx={{ mt: 2 }}
            />
            <div>
               <label>Content Picture</label>
               {newPost.contentPic && (
                  <div>
                     <img
                        src={newPost.contentPic}
                        alt="Selected Content"
                        style={{ width: '100%' }}
                     />
                  </div>
               )}
               <input type="file" onChange={handleFileChange} />
            </div>
            <TextField
               fullWidth
               label="Last Street"
               variant="outlined"
               size="small"
               value={newPost.lastStreet}
               onChange={(e) => setNewPost({ ...newPost, lastStreet: e.target.value })}
               sx={{ mt: 2 }}
            />
            <TextField
               fullWidth
               label="Last Subdivision"
               variant="outlined"
               size="small"
               value={newPost.lastSubdivision}
               onChange={(e) => setNewPost({ ...newPost, lastSubdivision: e.target.value })}
               sx={{ mt: 2 }}
            />
            <TextField
               fullWidth
               label="Last Barangay"
               variant="outlined"
               size="small"
               value={newPost.lastBarangay}
               onChange={(e) => setNewPost({ ...newPost, lastBarangay: e.target.value })}
               sx={{ mt: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
               <Button variant="contained" color="primary" onClick={handleCreatePost} disabled={isCreatePostDisabled}>
                  Create
               </Button>
               <Button variant="outlined" color="secondary" onClick={handleClose}>
                  Cancel
               </Button>
            </Box>
         </Box>
      </Modal>
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
      </>
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

export default UserHomePage;