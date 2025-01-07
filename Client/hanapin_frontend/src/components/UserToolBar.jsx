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
import HomeIcon from '@mui/icons-material/Home';

export default function PrimarySearchAppBar({ children, onSearch }) {
   const navigate = useNavigate();
   const [anchorEl, setAnchorEl] = React.useState(null);
   const [searchQuery, setSearchQuery] = React.useState('');
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

   const handleHomeRedirect = () => {
      navigate('/user_home_page');
   };

   const handleSearchChange = (event) => {
      setSearchQuery(event.target.value);
   };

   const handleSearchKeyPress = (event) => {
      if (event.key === 'Enter') {
         onSearch(searchQuery);
      }
   };

   const handlUserProfileRedirect = () => {
      navigate('/user_profile');
   };

   const handlUserMessagesRedirect = () => {
      navigate('/user_messages');
   };

   return (
      <Box sx={{ flexGrow: 1, margin: 0, padding: 0 , borderRadius: '2px'}}>
         <AppBar position="fixed" sx={{ top: 0, left: 0, right: 0, bgcolor: '#AFB0CE' }}>
            <Toolbar>
               <IconButton
                  size="medium"
                  edge="start"
                  color="inherit"
                  aria-label="home"
                  sx={{ mr: 2 }}
                  onClick={handleHomeRedirect}
               >
                  <HomeIcon />
               </IconButton>

               <TextField
                  className='search-bar'
                  variant="outlined"
                  placeholder="Search"
                  size="small"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyPress}
                  fullWidth
                  sx={{
                     display: { xs: 'none', sm: 'block' },
                     width: '20%',
                     bgcolor: '#FFFFFF',
                     borderRadius: '5px',
                     boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                     '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                        borderColor: '#AFB0CE', // Default border
                        },
                        '&:hover fieldset': {
                        borderColor: '#BA96DD', // Hover state
                        },
                        '&.Mui-focused fieldset': {
                        borderColor: '#F0D5E3', // Focused state
                        },
                     },
                  }}
                  />

               <Box sx={{ flexGrow: 1 }} />
               <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton
                     size="large"
                     edge="end"
                     aria-label="messages"
                     color="inherit"
                     sx={{ mr: 2 }}
                     onClick={handlUserMessagesRedirect}
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
                     <MenuItem onClick={() => navigate('/user_profile')}>View Profile</MenuItem>
                     <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
               </Box>
            </Toolbar>
         </AppBar>
         <Box sx={{ marginTop: '64px' }}>{children}</Box>
      </Box>
   );
}