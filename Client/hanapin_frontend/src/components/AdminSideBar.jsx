import React from 'react';
import { List, ListItem, ListItemText, Drawer, Box } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import './AdminSideBar.css';
import HanaPINLogo from '../../../../Client/hanapin_frontend/src/assets/HanaPIN_Logo_Full_Transparent.png';

const AdminSideBar = ({ children }) => {
   const navigate = useNavigate();
   const location = useLocation();

   const handleNavigation = (path) => {
      navigate(path);
   };

   const isActive = (path) => {
      return location.pathname === path ? 'active' : '';
   };

   return (
      <Box className="admin-sidebar-container">
         <Drawer
            variant="permanent"
            anchor="left"
            classes={{ paper: 'admin-sidebar-drawer' }}
         >
            <div className="system-logo">
               <img src={HanaPINLogo} alt="System Logo" className="system-logo-image" width={'200px'}/>
            </div>
            <Box className="admin-sidebar-box">
               <List>
                  <ListItem button className={`sidebar-item ${isActive('/admin_dashboard')}`} onClick={() => handleNavigation('/admin_dashboard')}>
                     <ListItemText primary="Dashboard" />
                  </ListItem>
                  <ListItem button className={`sidebar-item ${isActive('/admin_account_management')}`} onClick={() => handleNavigation('/admin_account_management')}>
                     <ListItemText primary="Account Management" />
                  </ListItem>
                  <ListItem button className={`sidebar-item ${isActive('/admin_post_management')}`} onClick={() => handleNavigation('/admin_post_management')}>
                     <ListItemText primary="Post Management" />
                  </ListItem>
                  <ListItem button className={`sidebar-item ${isActive('/admin_logs')}`} onClick={() => handleNavigation('/admin_logs')}>
                     <ListItemText primary="Logs" />
                  </ListItem>
               </List>
            </Box>
         </Drawer>
         <Box
            component="main"
            className="admin-sidebar-main"
         >
            {children}
         </Box>
      </Box>
   );
};

export default AdminSideBar;