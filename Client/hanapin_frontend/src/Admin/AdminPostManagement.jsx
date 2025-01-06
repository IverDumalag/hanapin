import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Box, Typography, Button } from '@mui/material';
import AdminSideBar from '../components/AdminSideBar';
import AdminToolBar from '../components/AdminToolBar';
import userSelectAdminData from '../../../../Client/hanapin_backend/data/AdminLoginData';
import './AdminPostManagement.css';

const AdminPostManagement = () => {
   const [posts, setPosts] = useState([]);
   const [selectedPost, setSelectedPost] = useState(null);
   const [viewModalOpen, setViewModalOpen] = useState(false);
   const [deleteModalOpen, setDeleteModalOpen] = useState(false);
   const [postToDelete, setPostToDelete] = useState(null);
   const [userAdminData, setAdminUserData] = useState(userSelectAdminData.getData('admin'));

   useEffect(() => {
      fetchPosts();
   }, []);

   const fetchPosts = async () => {
      try {
         const response = await axios.get('http://localhost/hanapin/Client/hanapin_backend/api/readUserPost.php');
         if (response.data.status === 200) {
            const postsWithUserDetails = await Promise.all(response.data.posts.map(async (post) => {
               const userResponse = await axios.post('http://localhost/hanapin/Client/hanapin_backend/api/readUserByID.php', { user_id: post.user_id });
               if (userResponse.data.status === 200) {
                  return { ...post, user_name: `${userResponse.data.user.first_name} ${userResponse.data.user.last_name}` };
               } else {
                  return { ...post, user_name: 'Unknown User' };
               }
            }));
            setPosts(postsWithUserDetails);
         } else {
            console.error('Failed to fetch posts:', response.data.message);
         }
      } catch (error) {
         console.error('Error fetching posts:', error);
      }
   };

   const handleViewPost = (post) => {
      setSelectedPost(post);
      setViewModalOpen(true);
   };

   const handleDeletePost = async () => {
      try {
         const response = await axios.post('http://localhost/hanapin/Client/hanapin_backend/api/deletePost.php', { post_id: postToDelete });
         if (response.data.status === 200) {
            setPosts(posts.filter(post => post.post_id !== postToDelete));
            setDeleteModalOpen(false);
            setPostToDelete(null);
         } else {
            console.error('Failed to delete post:', response.data.message);
         }
      } catch (error) {
         console.error('Error deleting post:', error);
      }
   };

   const handleOpenDeleteModal = (postId) => {
      setPostToDelete(postId);
      setDeleteModalOpen(true);
   };

   const handleCloseDeleteModal = () => {
      setDeleteModalOpen(false);
      setPostToDelete(null);
   };

   const handleCloseViewModal = () => {
      setViewModalOpen(false);
      setSelectedPost(null);
   };

   return (
      <AdminSideBar>
         <AdminToolBar>
            <div className="post-welcome-admin">
               <h1>Welcome Mr. {userAdminData.last_name}!</h1>
               <p>{`Today is ${new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}</p>
            </div>
            <h1>Admin Post Management</h1>
            <table className="admin-post-management-table" border="1" cellPadding="10" cellSpacing="0">
               <thead>
                  <tr>
                     <th>Post ID</th>
                     <th>User Name</th>
                     <th>Content</th>
                     <th>Last Location</th>
                     <th>State</th>
                     <th>Post Date</th>
                     <th>Actions</th>
                  </tr>
               </thead>
               <tbody>
                  {posts.map(post => (
                     <tr key={post.post_id}>
                        <td>{post.post_id}</td>
                        <td>{post.user_name}</td>
                        <td>{post.content_text}</td>
                        <td>{`${post.last_street}, ${post.last_subdivision}, ${post.last_barangay}`}</td>
                        <td>{post.content_state}</td>
                        <td>{new Date(post.post_date).toLocaleString()}</td>
                        <td>
                           <button onClick={() => handleViewPost(post)}>View</button>
                           <button onClick={() => handleOpenDeleteModal(post.post_id)}>Delete</button>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>

            <Modal open={viewModalOpen} onClose={handleCloseViewModal}>
               <Box className="modal-box">
                  {selectedPost && (
                     <>
                        <Typography variant="h6">Post Details</Typography>
                        <Typography variant="body1"><strong>Post ID:</strong> {selectedPost.post_id}</Typography>
                        <Typography variant="body1"><strong>User Name:</strong> {selectedPost.user_name}</Typography>
                        <Typography variant="body1"><strong>Content:</strong> {selectedPost.content_text}</Typography>
                        {selectedPost.content_picture && (
                           <img src={selectedPost.content_picture} alt="Post Content" className="post-content-image" />
                        )}
                        <Typography variant="body1"><strong>Last Location:</strong> {`${selectedPost.last_street}, ${selectedPost.last_subdivision}, ${selectedPost.last_barangay}`}</Typography>
                        <Typography variant="body1"><strong>State:</strong> {selectedPost.content_state}</Typography>
                        <Typography variant="body1"><strong>Post Date:</strong> {new Date(selectedPost.post_date).toLocaleString()}</Typography>
                        <Button variant="contained" color="primary" onClick={handleCloseViewModal} sx={{ mt: 2 }}>Close</Button>
                     </>
                  )}
               </Box>
            </Modal>

            <Modal open={deleteModalOpen} onClose={handleCloseDeleteModal}>
               <Box className="modal-box">
                  <Typography variant="h6">Confirm Deletion</Typography>
                  <Typography variant="body1">Are you sure you want to delete this post?</Typography>
                  <Button variant="contained" color="secondary" onClick={handleDeletePost} sx={{ mt: 2 }}>Yes</Button>
                  <Button variant="contained" onClick={handleCloseDeleteModal} sx={{ mt: 2 }}>No</Button>
               </Box>
            </Modal>
         </AdminToolBar>
      </AdminSideBar>
   );
};

export default AdminPostManagement;