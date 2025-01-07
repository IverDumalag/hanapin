import React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate, useLocation } from 'react-router-dom';
import adminLoginData from '../../../../Client/hanapin_backend/data/AdminLoginData';
import './AdminToolBar.css';

const AdminToolBar = ({ children }) => {
   const navigate = useNavigate();
   const location = useLocation();
   const [anchorEl, setAnchorEl] = React.useState(null);
   const open = Boolean(anchorEl);

   const handleMenu = (event) => {
      setAnchorEl(event.currentTarget);
   };

   const handleClose = () => {
      setAnchorEl(null);
   };

   const handleLogout = () => {
      adminLoginData.setData('admin', null);
      sessionStorage.removeItem('adminData');
      navigate('/admin_login');
   };

   const getPageTitle = () => {
      switch (location.pathname) {
         case '/admin_dashboard':
            return 'Admin Dashboard';
         case '/admin_post_management':
            return 'Post Management';
         case '/admin_account_management':
            return 'Account Management';
         default:
            return '';
      }
   };

   return (
      <Box className="admin-toolbar-container">
         <AppBar position="fixed" className="admin-appbar">
            <Toolbar>
               <Typography variant="h6" component="div" className="admin-toolbar-title">
                  {getPageTitle()}
               </Typography>
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
                     src={adminLoginData.getData('admin')?.profile_pic || 'https://via.placeholder.com/40'}
                     alt="profile"
                     className="admin-profile-pic"
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
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
               </Menu>
            </Toolbar>
         </AppBar>
         <Box className="admin-toolbar-content">
            {children}
         </Box>
      </Box>
   );
};

export default AdminToolBar;