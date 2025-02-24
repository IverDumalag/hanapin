import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../components/AdminSideBar';
import AdminToolBar from '../components/AdminToolBar';
import './AdminLogs.css';

const AdminLogs = () => {
   const [activityLogs, setActivityLogs] = useState([]);

   useEffect(() => {
      fetchActivityLogs();
   }, []);

   const fetchActivityLogs = async () => {
      try {
         const response = await axios.get(import.meta.env.VITE_API_READ_ACTIVITY_LOGS);
         if (response.data.status === 200) {
            const sortedLogs = response.data.logs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setActivityLogs(sortedLogs);
         } else {
            console.error('Failed to fetch activity logs:', response.data.message);
         }
      } catch (error) {
         console.error('Error fetching activity logs:', error);
      }
   };

   return (
      <AdminSideBar>
         <AdminToolBar>
            <div className="admin-logs">
               <h2>Activity Logs</h2>
               <table>
                  <thead>
                     <tr>
                        <th>User ID</th>
                        <th>Action</th>
                        <th>Target Entity</th>
                        <th>Target ID</th>
                        <th>Description</th>
                        <th>Timestamp</th>
                     </tr>
                  </thead>
                  <tbody>
                     {activityLogs.map((logs, index) => (
                        <tr key={index}>
                           <td>{logs.user_id}</td>
                           <td>{logs.action}</td>
                           <td>{logs.target_entity}</td>
                           <td>{logs.target_id}</td>
                           <td>{logs.description}</td>
                           <td>{logs.created_at}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </AdminToolBar>
      </AdminSideBar>
   );
};

export default AdminLogs;