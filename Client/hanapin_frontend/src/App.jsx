import { BrowserRouter, Routes, Route } from 'react-router-dom';

import AdminLogin from './Admin/AdminLogin';
import UserLogin from './User/UserLogin';
import UserRegister from './User/UserRegister';
import ProtectedRoutes from '../utils/ProtectedRoutes';
import LandingPage from './LandingPage';
import UserHomePage from './User/UserHomePage';

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
        </Route> 
        
      </Routes>  
      </BrowserRouter>
    </>
  )
}

export default App
