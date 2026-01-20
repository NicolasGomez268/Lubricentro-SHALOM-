import {
    Car,
    FileText,
    LayoutDashboard,
    Package,
    Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Sidebar = () => {
  const { user, isAdmin } = useAuth();

  const employeeMenuItems = [
    { to: '/stock', icon: Package, label: 'Consultar Stock' },
    { to: '/dashboard', icon: LayoutDashboard, label: 'Panel Principal' },
  ];

  const adminMenuItems = [
    { to: '/service-order', icon: FileText, label: 'Historial de Órdenes' },
    { to: '/admin/inventory', icon: Package, label: 'Gestión de Stock' },
    { to: '/admin/customers', icon: Users, label: 'Clientes' },
    { to: '/admin/vehicles', icon: Car, label: 'Vehículos' },
  ];

  const menuItems = isAdmin ? [...employeeMenuItems, ...adminMenuItems] : employeeMenuItems;

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col shadow-2xl">
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
