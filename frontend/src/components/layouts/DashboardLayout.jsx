import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';

const DashboardLayout = () => {
  const { isAdmin } = useAuth();
  const location = useLocation();

  // Páginas de empleado que deben tener fondo gris oscuro
  const isEmployeePage = !isAdmin && (location.pathname === '/dashboard' || 
    location.pathname === '/service-order/new' || 
    location.pathname === '/vehicles' || 
    location.pathname === '/customers' || 
    location.pathname === '/stock');

  return (
    <div className={`min-h-screen flex flex-col ${isEmployeePage ? 'bg-gray-800' : 'bg-shalom-lightGray'}`}>
      {/* Header */}
      <Header />

      <div className="flex flex-1">
        {/* Sidebar - Solo para admin */}
        {isAdmin && <Sidebar />}

        {/* Page Content */}
        <main className={`flex-1 overflow-auto ${isEmployeePage ? 'p-0' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
