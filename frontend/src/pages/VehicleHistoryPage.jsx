import { ArrowLeft, Calendar, CheckCircle, Clock, DollarSign, Wrench, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getVehicleOrderHistory } from '../services/serviceOrderService';
import { formatDate } from '../utils/formatters';

export default function VehicleHistoryPage() {
  const { vehicleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [vehicleId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await getVehicleOrderHistory(vehicleId);
      setData(response.data);
    } catch (error) {
      console.error('Error al cargar historial:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-6 h-6 text-green-600" />;
      case 'CANCELLED':
        return <XCircle className="w-6 h-6 text-red-600" />;
      case 'PENDING':
        return <Clock className="w-6 h-6 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 border-green-300';
      case 'CANCELLED':
        return 'bg-red-100 border-red-300';
      case 'PENDING':
        return 'bg-yellow-100 border-yellow-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Cargando historial...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">No se pudo cargar el historial</div>
      </div>
    );
  }

  const { statistics, orders } = data;
  const vehicle = orders[0]?.vehicle_details;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Historial del Vehículo</h1>
          {vehicle && (
            <p className="text-lg text-gray-600 mt-1">
              {vehicle.brand} {vehicle.model} - Patente: {vehicle.plate}
            </p>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Órdenes</p>
              <p className="text-3xl font-bold text-gray-800">{statistics.total_orders}</p>
            </div>
            <Wrench className="w-12 h-12 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completadas</p>
              <p className="text-3xl font-bold text-green-600">{statistics.completed_orders}</p>
            </div>
            <CheckCircle className="w-12 h-12 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pendientes</p>
              <p className="text-3xl font-bold text-yellow-600">{statistics.pending_orders}</p>
            </div>
            <Clock className="w-12 h-12 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Gastado</p>
              <p className="text-3xl font-bold text-purple-600">${statistics.total_spent.toFixed(2)}</p>
            </div>
            <DollarSign className="w-12 h-12 text-purple-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Timeline de órdenes */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Historial de Servicios</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No hay órdenes registradas para este vehículo
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order.id}
                className={`border-l-4 pl-6 pb-6 relative ${
                  index !== orders.length - 1 ? 'border-gray-300' : ''
                }`}
              >
                {/* Círculo en la línea de tiempo */}
                <div className={`absolute -left-3 top-0 w-6 h-6 rounded-full border-4 border-white ${
                  order.status === 'COMPLETED' ? 'bg-green-500' :
                  order.status === 'CANCELLED' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`} />

                {/* Contenido de la orden */}
                <div className={`border-2 rounded-lg p-4 ${getStatusColor(order.status)}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(order.status)}
                      <div>
                        <h3 className="font-bold text-lg">Orden #{order.order_number}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(order.created_at)}</span>
                          {order.completed_at && (
                            <span className="ml-4">
                              Completada: {formatDate(order.completed_at)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      order.status === 'COMPLETED' ? 'bg-green-200 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-200 text-red-800' :
                      'bg-yellow-200 text-yellow-800'
                    }`}>
                      {order.status_display}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="mt-4">
                    <p className="font-semibold text-sm text-gray-700 mb-2">Trabajos realizados:</p>
                    <ul className="space-y-1">
                      {order.items.map((item, idx) => (
                        <li key={idx} className="text-sm text-gray-700">
                          • {item.description} - Cantidad: {item.quantity} - ${parseFloat(item.subtotal).toFixed(2)}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Observaciones */}
                  {order.observations && (
                    <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                      <p className="font-semibold text-sm text-gray-700">Observaciones:</p>
                      <p className="text-sm text-gray-700 mt-1">{order.observations}</p>
                    </div>
                  )}

                  {/* Total */}
                  <div className="mt-4 text-right">
                    <span className="text-lg font-bold text-gray-800">
                      Total: ${parseFloat(order.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Última visita */}
      {statistics.last_visit && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            <strong>Última visita:</strong> {formatDate(statistics.last_visit)}
          </p>
        </div>
      )}
    </div>
  );
}
