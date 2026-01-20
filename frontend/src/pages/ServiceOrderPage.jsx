import {
    AlertCircle,
    ArrowLeft,
    CheckCircle,
    Package,
    Printer,
    Save,
    Search,
    Trash2,
    Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVehicles } from '../services/crmService';
import { inventoryService } from '../services/inventoryService';
import { createServiceOrder, getServiceOrder, getServiceOrders } from '../services/serviceOrderService';

export default function ServiceOrderPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([]);
  const [observations, setObservations] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });
  const [productSearches, setProductSearches] = useState({});
  const [productSearchResults, setProductSearchResults] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadProducts();
    if (location.state?.vehicle && location.state?.customer) {
      setSelectedVehicle(location.state.vehicle);
    }
  }, [location.state]);

  useEffect(() => {
    if (!isAdmin) {
      loadRecentOrders();
    }
  }, [isAdmin]);

  const loadRecentOrders = async () => {
    try {
      setLoadingRecent(true);
      const response = await getServiceOrders({ ordering: '-created_at', page_size: 10 });
      const ordersList = response.data.results || response.data;
      setRecentOrders(Array.isArray(ordersList) ? ordersList : []);
    } catch (error) {
      console.error('Error al cargar historial de órdenes:', error);
      setRecentOrders([]);
    } finally {
      setLoadingRecent(false);
    }
  };

  const viewOrder = async (orderId) => {
    try {
      setLoadingDetail(true);
      const response = await getServiceOrder(orderId);
      setSelectedOrderDetail(response.data);
      setShowDetail(true);
    } catch (error) {
      console.error('Error al cargar detalle de orden:', error);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadProducts = async () => {
    try {
      const productsList = await inventoryService.getProducts();
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    }
  };

  const searchVehicle = async () => {
    if (!vehicleSearch.trim()) return;
    try {
      setLoading(true);
      const data = await getVehicles({ search: vehicleSearch });
      const vehiclesList = data.results || data;
      setSearchResults(Array.isArray(vehiclesList) ? vehiclesList : []);
      setShowResults(true);
    } catch (error) {
      console.error('Error al buscar vehículo:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const selectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    setShowResults(false);
    setVehicleSearch('');
  };

  const clearVehicle = () => {
    setSelectedVehicle(null);
    setVehicleSearch('');
    setSearchResults([]);
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 3000);
  };

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800'
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const addItem = (type) => {
    const newItem = {
      id: Date.now(),
      item_type: type,
      product: null,
      description: '',
      quantity: 1,
      unit_price: 0,
      subtotal: 0
    };
    setItems([...items, newItem]);
  };

  const searchProducts = (itemId, searchText) => {
    setProductSearches(prev => ({ ...prev, [itemId]: searchText }));
    if (!searchText.trim()) {
      setProductSearchResults(prev => ({ ...prev, [itemId]: [] }));
      return;
    }
    const filtered = products.filter(product =>
      product.name.toLowerCase().includes(searchText.toLowerCase()) ||
      product.sku?.toLowerCase().includes(searchText.toLowerCase())
    );
    setProductSearchResults(prev => ({ ...prev, [itemId]: filtered }));
  };

  const selectProduct = (itemId, product) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          product: product.id,
          description: product.name,
          unit_price: parseFloat(product.sale_price),
          subtotal: item.quantity * parseFloat(product.sale_price)
        };
      }
      return item;
    }));
    setProductSearches(prev => ({ ...prev, [itemId]: '' }));
    setProductSearchResults(prev => ({ ...prev, [itemId]: [] }));
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        updatedItem.subtotal = updatedItem.quantity * updatedItem.unit_price;
        return updatedItem;
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
  };

  const saveOrder = async () => {
    if (!selectedVehicle) {
      showNotification('error', 'Debe seleccionar un vehículo');
      return;
    }
    if (items.length === 0) {
      showNotification('error', 'Debe agregar al menos un item');
      return;
    }
    try {
      setLoading(true);
      const orderData = {
        vehicle: selectedVehicle.id,
        observations: observations,
        items: items.map(item => ({
          item_type: item.item_type,
          product: item.product || null,
          description: item.description,
          quantity: parseFloat(item.quantity),
          unit_price: parseFloat(item.unit_price)
        }))
      };
      const response = await createServiceOrder(orderData);
      showNotification('success', 'Orden creada exitosamente');
      setTimeout(() => {
        navigate('/service-order');
      }, 1500);
    } catch (error) {
      console.error('Error al crear orden:', error);
      showNotification('error', error.response?.data?.detail || 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  const printOrder = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const total = calculateTotal();
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Orden de Servicio - Shalom Car Service</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    h1 { text-align: center; color: #1f2937; }
    .info { margin: 20px 0; }
    .info p { margin: 5px 0; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #3b82f6; color: white; }
    .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
    @media print { button { display: none; } }
  </style>
</head>
<body>
  <h1>SHALOM CAR SERVICE</h1>
  <h2 style='text-align: center;'>Orden de Servicio</h2>
  <div class='info'>
    <p><strong>Vehículo:</strong> ${selectedVehicle?.brand || ''} ${selectedVehicle?.model || ''}</p>
    <p><strong>Patente:</strong> ${selectedVehicle?.plate || ''}</p>
    <p><strong>Cliente:</strong> ${selectedVehicle?.customer_details?.full_name || ''}</p>
    <p><strong>Teléfono:</strong> ${selectedVehicle?.customer_details?.phone || ''}</p>
    <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
  </div>
  ${observations ? `<p><strong>Observaciones:</strong> ${observations}</p>` : ''}
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
      ${items.map(item => {
        const tipo = item.item_type === 'PRODUCT' ? 'Producto' : 'Servicio';
        const cantidad = item.item_type === 'PRODUCT' ? item.quantity : '';
        return `<tr>
          <td>${tipo}</td>
          <td>${item.description}</td>
          <td>${cantidad}</td>
          <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
          <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
        </tr>`;
      }).join('')}
    </tbody>
  </table>
  <div class='total'>TOTAL: $${total.toFixed(2)}</div>
  <button onclick='window.print()' style='margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;'>Imprimir</button>
</body>
</html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Nueva Orden de Servicio</h1>
        {!isAdmin && (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
        )}
      </div>

      {/* Búsqueda de vehículo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">1. Buscar Vehículo</h2>
        
        {!selectedVehicle ? (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por patente, marca o modelo..."
                value={vehicleSearch}
                onChange={(e) => setVehicleSearch(e.target.value.toUpperCase())}
                onKeyPress={(e) => e.key === 'Enter' && searchVehicle()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={searchVehicle}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
              >
                <Search size={20} />
                Buscar
              </button>
            </div>

            {showResults && (
              <div className="mt-4 space-y-2">
                {searchResults.length > 0 ? (
                  searchResults.map(vehicle => (
                    <div
                      key={vehicle.id}
                      onClick={() => selectVehicle(vehicle)}
                      className="p-4 border border-gray-200 rounded-lg hover:bg-blue-50 cursor-pointer"
                    >
                      <p className="font-semibold">{vehicle.plate} - {vehicle.brand} {vehicle.model}</p>
                      <p className="text-sm text-gray-600">Cliente: {vehicle.customer_details?.full_name || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Tel: {vehicle.customer_details?.phone || 'N/A'}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No se encontraron vehículos</p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{selectedVehicle.plate} - {selectedVehicle.brand} {selectedVehicle.model}</p>
                <p className="text-gray-700">Cliente: {selectedVehicle.customer_details?.full_name || 'N/A'}</p>
                <p className="text-gray-600">Tel: {selectedVehicle.customer_details?.phone || 'N/A'}</p>
              </div>
              <button
                onClick={clearVehicle}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <ArrowLeft size={18} />
                Cambiar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Observaciones */}
      {selectedVehicle && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">2. Observaciones</h2>
          <textarea
            value={observations}
            onChange={(e) => setObservations(e.target.value)}
            placeholder="Descripción del trabajo a realizar..."
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Items */}
      {selectedVehicle && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">3. Items</h2>
            <div className="flex gap-2">
              <button
                onClick={() => addItem('PRODUCT')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Package size={18} />
                Producto
              </button>
              <button
                onClick={() => addItem('SERVICE')}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
              >
                <Wrench size={18} />
                Servicio
              </button>
            </div>
          </div>

          {items.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No hay items agregados</p>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4 items-start">
                    {/* Layout para PRODUCTOS */}
                    {item.item_type === 'PRODUCT' && (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Tipo</label>
                          <input
                            type="text"
                            value="Producto"
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="relative md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Producto</label>
                          {!item.product ? (
                            <>
                              <input
                                type="text"
                                placeholder="Buscar producto..."
                                value={productSearches[item.id] || ''}
                                onChange={(e) => searchProducts(item.id, e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                              {productSearchResults[item.id]?.length > 0 && (
                                <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                  {productSearchResults[item.id].map(product => (
                                    <div
                                      key={product.id}
                                      onClick={() => selectProduct(item.id, product)}
                                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0"
                                    >
                                      <p className="font-medium">{product.name}</p>
                                      <p className="text-sm text-gray-600">
                                        Stock: {product.stock} | Precio: ${parseFloat(product.sale_price).toFixed(2)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={item.description}
                                disabled
                                className="flex-1 px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                              />
                              <button
                                onClick={() => updateItem(item.id, 'product', null)}
                                className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Cambiar producto"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Precio Unit.</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    {/* Layout para SERVICIOS */}
                    {item.item_type === 'SERVICE' && (
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Tipo</label>
                          <input
                            type="text"
                            value="Servicio"
                            disabled
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium mb-1">Descripción</label>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                            placeholder="Descripción del servicio..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Precio</label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-end">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        title="Eliminar item"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-sm text-gray-600">Subtotal</span>
                    <span className="text-lg font-semibold">${parseFloat(item.subtotal || 0).toFixed(2)}</span>
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-800">
                    Total: ${calculateTotal().toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      {selectedVehicle && items.length > 0 && (
        <div className="flex justify-end gap-4">
          <button
            onClick={printOrder}
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            <Printer size={20} />
            Vista Previa / Imprimir
          </button>
          <button
            onClick={saveOrder}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Save size={20} />
            Guardar Orden
          </button>
        </div>
      )}

      {/* Historial de órdenes recientes (solo para empleados) */}
      {!isAdmin && recentOrders.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Package className="w-6 h-6" />
            Historial de Órdenes Recientes
          </h2>
          
          {loadingRecent ? (
            <p className="text-gray-500">Cargando órdenes...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vehículo</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">#{order.id}</td>
                      <td className="px-4 py-3 text-sm">
                        {order.vehicle_details?.plate || 'N/A'} - {order.vehicle_details?.brand || ''} {order.vehicle_details?.model || ''}
                      </td>
                      <td className="px-4 py-3 text-sm">{order.vehicle_details?.customer_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm">{new Date(order.created_at).toLocaleDateString('es-AR')}</td>
                      <td className="px-4 py-3 text-sm font-semibold">${parseFloat(order.total || 0).toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusBadge(order.status)}`}>
                          {order.status === 'PENDING' ? 'Pendiente' : order.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => viewOrder(order.id)}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal de detalle de orden */}
      {showDetail && selectedOrderDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Detalle de Orden #{selectedOrderDetail.id}</h2>
              <button
                onClick={() => setShowDetail(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <AlertCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Vehículo</p>
                  <p className="font-semibold">
                    {selectedOrderDetail.vehicle_details?.plate} - {selectedOrderDetail.vehicle_details?.brand} {selectedOrderDetail.vehicle_details?.model}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="font-semibold">{selectedOrderDetail.vehicle_details?.customer_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha</p>
                  <p className="font-semibold">{new Date(selectedOrderDetail.created_at).toLocaleString('es-AR')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(selectedOrderDetail.status)}`}>
                    {selectedOrderDetail.status === 'PENDING' ? 'Pendiente' : selectedOrderDetail.status === 'COMPLETED' ? 'Completada' : 'Cancelada'}
                  </span>
                </div>
              </div>

              {selectedOrderDetail.observations && (
                <div>
                  <p className="text-sm text-gray-600">Observaciones</p>
                  <p className="text-gray-800">{selectedOrderDetail.observations}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-semibold mb-2">Items</h3>
                <table className="min-w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Tipo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Descripción</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Cantidad</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Precio Unit.</th>
                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {selectedOrderDetail.items?.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">
                          {item.item_type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                        </td>
                        <td className="px-4 py-2 text-sm">{item.description}</td>
                        <td className="px-4 py-2 text-sm text-right">{item.quantity}</td>
                        <td className="px-4 py-2 text-sm text-right">${parseFloat(item.unit_price).toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm text-right font-semibold">${parseFloat(item.subtotal).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="4" className="px-4 py-3 text-right font-bold">TOTAL:</td>
                      <td className="px-4 py-3 text-right font-bold text-lg">${parseFloat(selectedOrderDetail.total).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetail(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notificación Toast */}
      {notification.show && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className={`flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
            notification.type === 'success' 
              ? 'bg-green-500 text-white' 
              : 'bg-red-500 text-white'
          }`}>
            {notification.type === 'success' ? (
              <CheckCircle size={24} />
            ) : (
              <AlertCircle size={24} />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}


    </div>
  );
}
