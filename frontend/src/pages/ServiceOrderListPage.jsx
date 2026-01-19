import {
    CheckCircle,
    Eye,
    Filter,
    Printer,
    Search,
    XCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import {
    cancelServiceOrder,
    completeServiceOrder,
    getServiceOrders
} from '../services/serviceOrderService';

export default function ServiceOrderListPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchPlate, setSearchPlate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [confirmAction, setConfirmAction] = useState({ isOpen: false, orderId: null, action: null });

  useEffect(() => {
    loadOrders();
  }, [filterStatus, searchPlate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (searchPlate) params.plate = searchPlate;
      
      const response = await getServiceOrders(params);
      const ordersList = response.data.results || response.data;
      setOrders(Array.isArray(ordersList) ? ordersList : []);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      await completeServiceOrder(confirmAction.orderId);
      alert('Orden completada exitosamente. El stock ha sido descontado.');
      loadOrders();
      setShowDetail(false);
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al completar la orden');
    } finally {
      setConfirmAction({ isOpen: false, orderId: null, action: null });
    }
  };

  const handleCancel = async () => {
    try {
      await cancelServiceOrder(confirmAction.orderId);
      alert('Orden cancelada exitosamente');
      loadOrders();
      setShowDetail(false);
    } catch (error) {
      alert(error.response?.data?.detail || 'Error al cancelar la orden');
    } finally {
      setConfirmAction({ isOpen: false, orderId: null, action: null });
    }
  };

  const viewDetail = (order) => {
    setSelectedOrder(order);
    setShowDetail(true);
  };

  const printOrder = (order) => {
    const printWindow = window.open('', '', 'width=800,height=600');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Orden #${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { text-align: center; color: #1f2937; }
            .info { margin: 20px 0; }
            .info p { margin: 5px 0; }
            .status { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
            .status-PENDING { background: #fef3c7; color: #92400e; }
            .status-COMPLETED { background: #d1fae5; color: #065f46; }
            .status-CANCELLED { background: #fee2e2; color: #991b1b; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <h1>SHALOM CAR SERVICE</h1>
          <h2 style="text-align: center;">Orden de Servicio #${order.order_number}</h2>
          
          <div class="info">
            <p><strong>Estado:</strong> <span class="status status-${order.status}">${order.status_display}</span></p>
            <p><strong>Fecha:</strong> ${new Date(order.created_at).toLocaleDateString('es-AR')}</p>
            ${order.completed_at ? `<p><strong>Fecha de Finalización:</strong> ${new Date(order.completed_at).toLocaleDateString('es-AR')}</p>` : ''}
            <p><strong>Vehículo:</strong> ${order.vehicle_details?.brand || ''} ${order.vehicle_details?.model || ''}</p>
            <p><strong>Patente:</strong> ${order.vehicle_details?.plate || ''}</p>
            <p><strong>Cliente:</strong> ${order.customer_details?.name || ''}</p>
            <p><strong>Teléfono:</strong> ${order.customer_details?.phone || ''}</p>
          </div>
          
          ${order.observations ? `<p><strong>Observaciones:</strong> ${order.observations}</p>` : ''}
          
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>${item.item_type === 'PRODUCT' ? 'Producto' : 'Servicio'}</td>
                  <td>${item.description}</td>
                  <td>${item.quantity}</td>
                  <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
                  <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            TOTAL: $${parseFloat(order.total).toFixed(2)}
          </div>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
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
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Historial de Órdenes</h1>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              <Filter size={16} className="inline mr-2" />
              Estado
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos</option>
              <option value="PENDING">Pendiente</option>
              <option value="COMPLETED">Completada</option>
              <option value="CANCELLED">Cancelada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              <Search size={16} className="inline mr-2" />
              Buscar por Patente
            </label>
            <input
              type="text"
              value={searchPlate}
              onChange={(e) => setSearchPlate(e.target.value.toUpperCase())}
              placeholder="Ej: ABC123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={loadOrders}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Cargando...' : 'Buscar'}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Cargando órdenes...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No se encontraron órdenes</div>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">#{order.order_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(order.created_at).toLocaleDateString('es-AR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.vehicle_details?.plate} - {order.vehicle_details?.brand}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{order.customer_details?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.status)}`}>
                        {order.status_display}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">${parseFloat(order.total).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDetail(order)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Ver detalle"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => printOrder(order)}
                          className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                          title="Imprimir"
                        >
                          <Printer size={18} />
                        </button>
                        {order.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => setConfirmAction({ isOpen: true, orderId: order.id, action: 'complete' })}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                              title="Completar"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => setConfirmAction({ isOpen: true, orderId: order.id, action: 'cancel' })}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Cancelar"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showDetail && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">Orden #{selectedOrder.order_number}</h2>
                  <span className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status_display}
                  </span>
                </div>
                <button
                  onClick={() => setShowDetail(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Fecha de Creación</p>
                  <p className="font-medium">{new Date(selectedOrder.created_at).toLocaleString('es-AR')}</p>
                </div>
                {selectedOrder.completed_at && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Finalización</p>
                    <p className="font-medium">{new Date(selectedOrder.completed_at).toLocaleString('es-AR')}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Vehículo</p>
                  <p className="font-medium">
                    {selectedOrder.vehicle_details?.plate} - {selectedOrder.vehicle_details?.brand} {selectedOrder.vehicle_details?.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-medium">{selectedOrder.customer_details?.name}</p>
                  <p className="text-sm">{selectedOrder.customer_details?.phone}</p>
                </div>
              </div>

              {selectedOrder.observations && (
                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-1">Observaciones</p>
                  <p className="p-3 bg-gray-50 rounded-lg">{selectedOrder.observations}</p>
                </div>
              )}

              <div className="mb-6">
                <h3 className="font-semibold mb-3">Items</h3>
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs">Descripción</th>
                      <th className="px-4 py-2 text-right text-xs">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs">P. Unit.</th>
                      <th className="px-4 py-2 text-right text-xs">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2">
                          <span className={`text-xs px-2 py-1 rounded ${item.item_type === 'PRODUCT' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                            {item.item_type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                          </span>
                        </td>
                        <td className="px-4 py-2">{item.description}</td>
                        <td className="px-4 py-2 text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-2 text-right font-medium">${parseFloat(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-2xl font-bold">
                  Total: ${parseFloat(selectedOrder.total).toFixed(2)}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => printOrder(selectedOrder)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
                  >
                    <Printer size={18} />
                    Imprimir
                  </button>
                  {selectedOrder.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => setConfirmAction({ isOpen: true, orderId: selectedOrder.id, action: 'complete' })}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <CheckCircle size={18} />
                        Completar
                      </button>
                      <button
                        onClick={() => setConfirmAction({ isOpen: true, orderId: selectedOrder.id, action: 'cancel' })}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                      >
                        <XCircle size={18} />
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de confirmación */}
      <ConfirmDialog
        isOpen={confirmAction.isOpen}
        title={confirmAction.action === 'complete' ? 'Completar Orden' : 'Cancelar Orden'}
        message={
          confirmAction.action === 'complete' 
            ? '¿Está seguro que desea completar esta orden? Se descontará el stock de los productos automáticamente.'
            : '¿Está seguro que desea cancelar esta orden? Esta acción no se puede deshacer.'
        }
        onConfirm={confirmAction.action === 'complete' ? handleComplete : handleCancel}
        onCancel={() => setConfirmAction({ isOpen: false, orderId: null, action: null })}
        confirmText={confirmAction.action === 'complete' ? 'Completar' : 'Cancelar Orden'}
        danger={confirmAction.action === 'cancel'}
      />
    </div>
  );
}
