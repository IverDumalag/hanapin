import React from 'react';
import { List, ListItem, ListItemText, Drawer, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const AdminSideBar = ({ children }) => {
   const navigate = useNavigate();

   const handleNavigation = (path) => {
      navigate(path);
   };

   return (
      <Box sx={{ display: 'flex' }}>
         <Drawer
            variant="permanent"
            anchor="left"
            sx={{
               width: 240,
               flexShrink: 0,
               [`& .MuiDrawer-paper`]: {
                  width: 240,
                  boxSizing: 'border-box',
               },
            }}
         >
            <Box sx={{ overflow: 'auto' }}>
               <List>
                  <ListItem button onClick={() => handleNavigation('/admin_dashboard')}>
                     <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/admin_account_management')}>
                     <ListItemText primary="Account Management" />
                  </ListItem>
                  <ListItem button onClick={() => handleNavigation('/admin_post_management')}>
                     <ListItemText primary="Post Management" />
                  </ListItem>
               </List>
            </Box>
         </Drawer>
         <Box
            component="main"
            sx={{
               flexGrow: 1,
               padding: 2,
               marginLeft: 0,
            }}
         >
            {children}
         </Box>
      </Box>
   );
};

export default AdminSideBar;
