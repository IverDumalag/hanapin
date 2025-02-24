import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminSideBar from '../components/AdminSideBar';
import AdminToolBar from '../components/AdminToolBar';
import './AdminDashboard.css';
import userSelectAdminData from '../../../../Client/hanapin_backend/data/AdminLoginData';

const AdminDashboard = () => {
   const [missingFoundData, setMissingFoundData] = useState([]);
   const [userContributions, setUserContributions] = useState([]);
   const [sexDistribution, setSexDistribution] = useState([]);
   const [mostEngagedPosts, setMostEngagedPosts] = useState([]);

   useEffect(() => {
      fetchMissingFoundData();
      fetchUserContributions();
      fetchSexDistribution();
      fetchMostEngagedPosts();
   }, []);

   const fetchMissingFoundData = async () => {
      try {
         const response = await axios.get(import.meta.env.VITE_API_JOIN_MISSING_FOUND_PER_PLACE);
         if (response.data.status === 200) {
            setMissingFoundData(response.data.results);
         } else {
            console.error('Failed to fetch missing/found data:', response.data.message);
         }
      } catch (error) {
         console.error('Error fetching missing/found data:', error);
      }
   };

   const fetchUserContributions = async () => {
      try {
         const response = await axios.get(import.meta.env.VITE_API_JOIN_USER_CONTRIBUTION);
         if (response.data.status === 200) {
            setUserContributions(response.data.contributions);
         } else {
            console.error('Failed to fetch user contributions:', response.data.message);
         }
      } catch (error) {
         console.error('Error fetching user contributions:', error);
      }
   };

   const fetchSexDistribution = async () => {
      try {
         const response = await axios.get(import.meta.env.VITE_API_JOIN_SEX_DISTRIBUTION);
         if (response.data.status === 200) {
            setSexDistribution(response.data.distribution);
         } else {
            console.error('Failed to fetch sex distribution:', response.data.message);
         }
      } catch (error) {
         console.error('Error fetching sex distribution:', error);
      }
   };

   const fetchMostEngagedPosts = async () => {
      try {
         const response = await axios.get(import.meta.env.VITE_API_JOIN_MOST_ENGAGED_POST);
         if (response.data.status === 200) {
            setMostEngagedPosts(response.data.posts);
         } else {
            console.error('Failed to fetch most engaged posts:', response.data.message);
         }
      } catch (error) {
         console.error('Error fetching most engaged posts:', error);
      }
   };

   const [userAdminData, setAdminUserData] = useState(userSelectAdminData.getData('admin'));

   return (
      <AdminSideBar>
         <AdminToolBar>
            <div className="dashboard-welcome">
               <h1 className="dashboard-welcome-admin">Welcome Mr. {userAdminData.last_name}!</h1>
               <p className='dashboard-welcome-date'>{`Today is ${new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`}</p>
            </div>
            <div className="dashboard-grid">
               <div className="dashboard-card">
                  <h2>Missing/Found Per Place</h2>
                  <table>
                     <thead>
                        <tr>
                           <th>Barangay</th>
                           <th>Subdivision</th>
                           <th>Street</th>
                           <th>State</th>
                           <th>Count</th>
                        </tr>
                     </thead>
                     <tbody>
                        {missingFoundData.map((item, index) => (
                           <tr key={index}>
                              <td>{item.last_barangay}</td>
                              <td>{item.last_subdivision}</td>
                              <td>{item.last_street}</td>
                              <td>{item.content_state}</td>
                              <td>{item.post_count}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="dashboard-card">
                  <h2>User Contributions</h2>
                  <table>
                     <thead>
                        <tr>
                           <th>User ID</th>
                           <th>First Name</th>
                           <th>Last Name</th>
                           <th>Total Posts</th>
                           <th>Total Comments</th>
                        </tr>
                     </thead>
                     <tbody>
                        {userContributions.map((item, index) => (
                           <tr key={index}>
                              <td>{item.user_id}</td>
                              <td>{item.first_name}</td>
                              <td>{item.last_name}</td>
                              <td>{item.total_posts}</td>
                              <td>{item.total_comments}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="dashboard-card">
                  <h2>Sex Distribution</h2>
                  <table>
                     <thead>
                        <tr>
                           <th>Sex</th>
                           <th>Active Users</th>
                        </tr>
                     </thead>
                     <tbody>
                        {sexDistribution.map((item, index) => (
                           <tr key={index}>
                              <td>{item.sex}</td>
                              <td>{item.active_users}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
               <div className="dashboard-card">
                  <h2>Most Engaged Posts</h2>
                  <table>
                     <thead>
                        <tr>
                           <th>Post ID</th>
                           <th>Total Comments</th>
                           <th>Total Messages</th>
                        </tr>
                     </thead>
                     <tbody>
                        {mostEngagedPosts.map((item, index) => (
                           <tr key={index}>
                              <td>{item.post_id}</td>
                              <td>{item.total_comments}</td>
                              <td>{item.total_messages}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </AdminToolBar>
      </AdminSideBar>
   );
};

export default AdminDashboard;
