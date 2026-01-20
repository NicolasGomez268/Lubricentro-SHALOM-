import {
    BarChart3,
    Car,
    FileText,
    LayoutDashboard,
    Package,
    Settings,
    Users,
    Wrench,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const employeeMenuItems = [
    { to: '/workspace', icon: Wrench, label: 'Nueva Orden' },
    { to: '/service-orders', icon: FileText, label: 'Historial de Órdenes' },
    { to: '/stock', icon: Package, label: 'Consultar Stock' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
    { to: '/vehicles', icon: Car, label: 'Búsqueda de Vehículos' },
    { to: '/customers', icon: Users, label: 'Búsqueda de Clientes' },
  ];

  const adminMenuItems = [
    { to: '/admin', icon: BarChart3, label: 'Dashboard Admin' },
    { to: '/admin/inventory', icon: Package, label: 'Gestión de Stock' },
    { to: '/admin/customers', icon: Users, label: 'Clientes' },
    { to: '/admin/vehicles', icon: Car, label: 'Vehículos' },
    { to: '/admin/reports', icon: FileText, label: 'Reportes' },
    { to: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  const menuItems = isAdmin ? [...employeeMenuItems, ...adminMenuItems] : employeeMenuItems;

  return (
    <aside className="w-64 bg-shalom-gray text-white flex flex-col shadow-xl">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-shalom-red rounded-lg flex items-center justify-center">
            <Wrench className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold">Shalom Car Service</h1>
            <p className="text-xs text-gray-400">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold">
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-gray-400">
              {user?.role === 'ADMIN' ? 'Administrador' : 'Empleado'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">
          © 2026 Shalom Car Service
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
