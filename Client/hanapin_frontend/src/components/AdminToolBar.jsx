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
            return 'Dashboard';
         case '/admin_post_management':
            return 'Post Management';
         case '/admin_account_management':
            return 'Account Management';
         default:
            return '';
      }
   };

   return (
      <Box sx={{ flexGrow: 1 }}>
         <AppBar position="fixed" sx={{ top: 0, left: '240px', right: "0px", bgcolor: 'lightgrey', width: 'calc(100% - 240px)' }}>
            <Toolbar>
               <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
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
                     style={{ borderRadius: '50%', width: '40px', height: '40px' }}
                  />
               </IconButton>
               <Menu
                  id="menu-appbar"
                  anchorEl={anchorEl}
                  anchorOrigin={{
                     vertical: 'top',
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
         <Box sx={{ marginTop: '30px', padding: 2 }}>
            {children}
         </Box>
      </Box>
   );
};

export default AdminToolBar;