import { LogOut } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import shalomLogo from '../../assets/shalom-logo.png';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Usar el mismo header para TODOS
  return (
    <header className="bg-gray-900 border-b-4 border-shalom-red">
      <div className="px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src={shalomLogo} alt="Shalom Logo" className="h-16 w-auto" />
          <div>
            <h1 className="text-3xl font-bold text-white">SHALOM CAR SERVICE</h1>
            <p className="text-gray-400 text-sm">Servicio Profesional Automotriz</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <h2 className="text-2xl font-bold text-white">Bienvenido, {user?.full_name?.split(' ')[0] || 'Usuario'}</h2>
            <p className="text-gray-300 capitalize text-sm">{currentDate}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-shalom-red hover:bg-red-700 text-white rounded-lg transition-all shadow-lg hover:shadow-xl"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-bold">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
