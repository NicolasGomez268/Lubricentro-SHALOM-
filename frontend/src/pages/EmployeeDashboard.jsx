import { Car, FileText, Package } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import { useAuth } from '../context/AuthContext';
import { getServiceOrders, getServiceStatistics } from '../services/serviceOrderService';

const EmployeeDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [serviceStats, setServiceStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);

  // Cargar estadísticas de órdenes
  useEffect(() => {
    loadServiceStats();
    loadRecentOrders();
  }, []);

  const loadServiceStats = async () => {
    try {
      const response = await getServiceStatistics();
      setServiceStats(response.data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  const loadRecentOrders = async () => {
    try {
      const response = await getServiceOrders({ ordering: '-created_at' });
      const orders = response.data.results || response.data;
      setRecentOrders(orders.slice(0, 5)); // Solo las últimas 5
    } catch (error) {
      console.error('Error al cargar órdenes recientes:', error);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
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

      {/* Recent Orders */}
      <div className="card">
        <h2 className="text-xl font-bold text-shalom-gray mb-4">Últimas Órdenes</h2>
        {recentOrders.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Car className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay órdenes registradas aún</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr 
                    key={order.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate('/service-orders')}
                  >
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {order.vehicle_details?.plate} - {order.vehicle_details?.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{order.customer_details?.full_name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-sm">
                      ${parseFloat(order.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

