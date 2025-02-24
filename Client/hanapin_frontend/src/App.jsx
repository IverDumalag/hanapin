import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminLogin from './Admin/AdminLogin';
import UserLogin from './User/UserLogin';
import UserRegister from './User/UserRegister';
import ProtectedRoutes from '../utils/ProtectedRoutes';
import LandingPage from './LandingPage';
import UserHomePage from './User/UserHomePage';
import UserProfile from './components/UserProfile';
import UserOtherProfile from './components/UserOtherProfile';
import UserMessages from './components/UserMessages';
import AdminRoutes from '../utils/AdminRoutes';
import AdminDashboard from './Admin/AdminDashboard';
import AdminAccountManagement from './Admin/AdminAccountManagement';
import AdminPostManagement from './Admin/AdminPostManagement';
import AdminLogs from './Admin/AdminLogs';

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin_login" element={<AdminLogin />} />
          <Route path="/login" element={<UserLogin />} />
          <Route path="/register" element={<UserRegister />} />
          
          {/* Protected */}
          <Route element={<ProtectedRoutes />}>
            <Route path="/user_home_page" element={<UserHomePage />} />
            <Route path="/user_profile" element={<UserProfile />} />
            <Route path="/user_otherprofile" element={<UserOtherProfile />} />
            <Route path="/user_messages" element={<UserMessages />} />
          </Route> 

          {/* Protected Admin */}
          <Route element={<AdminRoutes />}>
            <Route path="/admin_dashboard" element={<AdminDashboard />} />
            <Route path="/admin_account_management" element={<AdminAccountManagement />} />
            <Route path="/admin_post_management" element={<AdminPostManagement />} />
            <Route path="/admin_logs" element={<AdminLogs />} />
          </Route> 
        </Routes>  
      </BrowserRouter>
    </>
  );
}

export default App;