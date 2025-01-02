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

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
        
        {/* Test */}
        

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
        
      </Routes>  
      </BrowserRouter>
    </>
  )
}

export default App
