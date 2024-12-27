import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import userLoginData from '../../../../Client/hanapin_backend/data/UserLoginData';
import { useNavigate } from 'react-router-dom';
import MessageIcon from '@mui/icons-material/Message';

export default function PrimarySearchAppBar({ children }) {
   const navigate = useNavigate();
   const [anchorEl, setAnchorEl] = React.useState(null);
   const open = Boolean(anchorEl);
   const user = userLoginData.getData('user');

   const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleLogout = () => {
      userLoginData.setData('user', null);
      sessionStorage.removeItem('userData');
      navigate('/login');
   };

   return (
      <Box sx={{ flexGrow: 1, margin: 0, padding: 0 }}>
         <AppBar position="fixed" sx={{ top: 0, left: 0, right: 0, bgcolor: 'lightgrey' }}>
            <Toolbar>
               <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  sx={{ mr: 2 }}
               >
                  <img
                     src="https://via.placeholder.com/40"
                     alt="menu"
                     style={{ borderRadius: '50%', width: '40px', height: '40px' }}
                  />
               </IconButton>

               <TextField
                  variant="outlined"
                  placeholder="Search…"
                  size="small"
                  sx={{ display: { xs: 'none', sm: 'block' }, width: '100%' }}
               />

               <Box sx={{ flexGrow: 1 }} />
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                     size="large"
                     edge="end"
                     aria-label="messages"
                     color="inherit"
                     sx={{ mr: 2 }}
                  >
                     <MessageIcon />
                  </IconButton>

                  <IconButton
                     size="large"
                     edge="end"
                     aria-label="account of current user"
                     aria-controls="menu-appbar"
                     aria-haspopup="true"
                     onClick={handleMenu}
                     color="inherit"
                  >
                     <img
                        src={user?.profile_pic || 'https://via.placeholder.com/40'}
                        alt="profile"
                        style={{ borderRadius: '50%', width: '40px', height: '40px' }}
                     />
                  </IconButton>
                  <Menu
                     id="menu-appbar"
                     anchorEl={anchorEl}
                     anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                     }}
                     keepMounted
                     transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                     }}
                     open={open}
                     onClose={handleClose}
                  >
                     <MenuItem onClick={() => navigate('/profile')}>View Profile</MenuItem>
                     <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
               </Box>
            </Toolbar>
         </AppBar>
         <Box sx={{ marginTop: '64px' }}>{children}</Box>
      </Box>
   );
}
