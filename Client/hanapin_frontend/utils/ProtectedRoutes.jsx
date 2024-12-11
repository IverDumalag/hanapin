import { Outlet, Navigate } from 'react-router-dom';
import userLoginData from '../../../Client/hanapin_backend/data/UserLoginData';

const ProtectedRoutes = () => {
   const user = userLoginData.getData('user');
   return user && Object.keys(user).length > 0 ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoutes;