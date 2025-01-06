import React from 'react';
import AdminSideBar from '../components/AdminSideBar';
import AdminToolBar from '../components/AdminToolBar';

const AdminDashboard = () => {
   return (
      <AdminSideBar>
         <AdminToolBar>
         <h1>Admin Dashboard</h1>
         </AdminToolBar>
      </AdminSideBar>
   );
};

export default AdminDashboard;
