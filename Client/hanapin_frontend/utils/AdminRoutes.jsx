import { Outlet, Navigate } from 'react-router-dom';
import adminLoginData from '../../../Client/hanapin_backend/data/AdminLoginData';

const AdminRoutes = () => {
   const admin = adminLoginData.getData('admin');
   return admin && Object.keys(admin).length > 0 ? <Outlet /> : <Navigate to="/admin_login" />;
}

export default AdminRoutes;