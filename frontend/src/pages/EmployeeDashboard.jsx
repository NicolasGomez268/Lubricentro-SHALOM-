import { Car, Package } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const EmployeeDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Si es admin, redirigir al dashboard de admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  const stats = [
    {
      title: 'Órdenes Hoy',
      value: '0',
      icon: Car,
      color: 'bg-blue-500',
    },
    {
      title: 'Vehículos Registrados',
      value: '0',
      icon: Car,
      color: 'bg-green-500',
    },
    {
      title: 'Stock Bajo',
      value: '0',
      icon: Package,
      color: 'bg-shalom-red',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-shalom-gray mb-2">Panel de Empleado</h1>
        <p className="text-gray-600">Gestión rápida de servicios y clientes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-3xl font-bold text-shalom-gray">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-lg`}>
                <stat.icon className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-shalom-gray mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button className="btn-primary py-4 text-lg">
            Nueva Orden de Servicio
          </button>
          <button className="btn-secondary py-4 text-lg">
            Buscar Vehículo
          </button>
          <button className="btn-secondary py-4 text-lg">
            Registrar Cliente
          </button>
          <button className="btn-secondary py-4 text-lg">
            Consultar Stock
          </button>
        </div>
      </div>

      {/* Recent Orders (Placeholder) */}
      <div className="card">
        <h2 className="text-xl font-bold text-shalom-gray mb-4">Últimas Órdenes</h2>
        <div className="text-center py-12 text-gray-500">
          <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No hay órdenes registradas aún</p>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
