import { Car, FileText, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { getServiceStatistics } from '../services/serviceOrderService';

const EmployeeDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [serviceStats, setServiceStats] = useState(null);

  // Si es admin, redirigir al dashboard de admin
  useEffect(() => {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [isAdmin, navigate]);

  // Cargar estadísticas de órdenes
  useEffect(() => {
    loadServiceStats();
  }, []);

  const loadServiceStats = async () => {
    try {
      const response = await getServiceStatistics();
      setServiceStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-shalom-gray mb-2">Panel de Empleado</h1>
        <p className="text-gray-600">Gestión rápida de servicios y clientes</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Órdenes Pendientes"
          value={serviceStats?.pending || 0}
          icon={FileText}
          color="bg-yellow-500"
        />
        <StatCard
          title="Órdenes Completadas"
          value={serviceStats?.completed || 0}
          icon={FileText}
          color="bg-green-500"
        />
        <StatCard
          title="Total Órdenes"
          value={serviceStats?.total_orders || 0}
          icon={Car}
          color="bg-blue-500"
        />
        <StatCard
          title="Ingresos Totales"
          value={`$${serviceStats?.total_revenue?.toFixed(2) || '0.00'}`}
          icon={Package}
          color="bg-purple-500"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h2 className="text-xl font-bold text-shalom-gray mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => navigate('/service-order')}
            className="btn-primary py-4 text-lg"
          >
            Nueva Orden de Servicio
          </button>
          <button 
            onClick={() => navigate('/vehicles')}
            className="btn-secondary py-4 text-lg"
          >
            Buscar Vehículo
          </button>
          <button 
            onClick={() => navigate('/service-orders')}
            className="btn-secondary py-4 text-lg"
          >
            Ver Historial de Órdenes
          </button>
          <button 
            onClick={() => navigate('/stock')}
            className="btn-secondary py-4 text-lg"
          >
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

