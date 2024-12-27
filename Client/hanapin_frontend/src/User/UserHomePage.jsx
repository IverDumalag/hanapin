import React, { useEffect, useState } from 'react';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import UserToolBar from '../components/UserToolBar';
import UserFilterBar from '../components/UserFilterBar';
import { Box, Button, TextField, Typography } from '@mui/material';
import UserMessagePreview from '../components/UserMessagePreview';

const UserHomePage = () => {
   const [userData, setUserData] = useState(userLoginData.getData('user'));

   useEffect(() => {
      const updateListener = () => {
         setUserData(userLoginData.getData('user'));
      };
      userLoginData.subscribe(updateListener);
      return () => {
         userLoginData.unsubscribe(updateListener);
      };
   }, []);

   return (
      <>
         <Box sx={{ bgcolor: 'lightgrey', minHeight: '100vh' }}>
            <UserToolBar />
            <Box sx={{ marginTop: '64px', display: 'flex' }}>
               <UserFilterBar onFilter={() => {}} />
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
                     {/* Create Post Section */}
                     <Box
                        sx={{
                           p: 2,
                           border: '1px solid #e0e0e0',
                           bgcolor: 'white',
                           borderRadius: 2,
                        }}
                     >
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
                              }}
                           />
                           <TextField
                              fullWidth
                              placeholder="What's on your mind?"
                              variant="outlined"
                              size="small"
                              sx={{
                                 backgroundColor: '#f5f5f5',
                                 borderRadius: 2,
                                 '.MuiOutlinedInput-notchedOutline': {
                                    border: 'none',
                                 },
                              }}
                           />
                        </Box>
                        <Box
                           sx={{
                              display: 'flex',
                              justifyContent: 'space-around',
                              mt: 2,
                           }}
                        >
                           <Button variant="contained" color="primary">
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
                        <Button variant="text" color="primary">
                           Missing
                        </Button>
                        <Button variant="text" color="primary">
                           Found
                        </Button>
                     </Box>

                     {/* Post Content Example */}
                     <Box sx={{ mt: 2 }}>
                        <Typography variant="h6" align='center'>
                           Welcome, {userData?.email || 'User'}!
                        </Typography>
                        <PostContent
                           profilePic="https://via.placeholder.com/40"
                           username="Cat Lady"
                           content="Send Help! My cat is Missing!"
                           contentPic="https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png"
                        />
                        <PostContent
                           profilePic="https://via.placeholder.com/40"
                           username="Cat Lady"
                           content="Send Help! My cat is Missing!"
                           contentPic="https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png"
                        />
                        <PostContent
                           profilePic="https://via.placeholder.com/40"
                           username="Cat Lady"
                           content="Send Help! My cat is Missing!"
                           contentPic="https://icatcare.org/app/uploads/2018/07/Thinking-of-getting-a-cat.png"
                        />
                     </Box>
                  </Box>
               </Box>
               <UserMessagePreview />
            </Box>
         </Box>
      </>
   );
};

const PostContent = ({ profilePic, username, content, contentPic }) => {
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
               src={profilePic || 'https://via.placeholder.com/50'}
               alt="Profile"
               style={{ width: 50, height: 50, borderRadius: '50%' }}
            />
            <Typography variant="h6">{username || 'Username'}</Typography>
         </Box>
         <Box sx={{ mt: 2 }}>
            <Typography variant="body1">
               {content ||
                  'This is the post content. It can be text or any other content that the user wants to share.'}
            </Typography>
         </Box>
         {contentPic && (
            <Box sx={{ mt: 2 }}>
               <img
                  src={contentPic}
                  alt="Post Content"
                  style={{ width: '100%', borderRadius: 2 }}
               />
            </Box>
         )}
         <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="contained" color="primary">
               Comment
            </Button>
         </Box>
      </Box>
   );
};

export default UserHomePage;
