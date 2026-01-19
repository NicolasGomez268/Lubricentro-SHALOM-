import {
    ArrowLeft,
    Package,
    Printer,
    Save,
    Search,
    Trash2,
    Wrench
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getVehicles } from '../services/crmService';
import { getProducts } from '../services/inventoryService';
import { createServiceOrder } from '../services/serviceOrderService';

export default function ServiceOrderPage() {
  const [vehicleSearch, setVehicleSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [products, setProducts] = useState([]);
  const [observations, setObservations] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await getProducts();
      const productsList = response.data.results || response.data;
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    }
  };

  // Buscar vehículo por patente
  const searchVehicle = async () => {
    if (!vehicleSearch.trim()) return;
    
    try {
      setLoading(true);
      const response = await getVehicles({ plate: vehicleSearch });
      const vehiclesList = response.data.results || response.data;
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

  // Agregar item (producto o servicio)
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

  // Actualizar item
  const updateItem = (id, field, value) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Si es un producto, cargar precio y descripción
        if (field === 'product' && value) {
          const product = products.find(p => p.id === parseInt(value));
          if (product) {
            updatedItem.description = product.name;
            updatedItem.unit_price = parseFloat(product.sale_price);
          }
        }
        
        // Calcular subtotal
        updatedItem.subtotal = updatedItem.quantity * updatedItem.unit_price;
        
        return updatedItem;
      }
      return item;
    }));
  };

  // Eliminar item
  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // Calcular total
  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + parseFloat(item.subtotal || 0), 0);
  };

  // Guardar orden
  const saveOrder = async () => {
    if (!selectedVehicle) {
      alert('Debe seleccionar un vehículo');
      return;
    }

    if (items.length === 0) {
      alert('Debe agregar al menos un item');
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

      await createServiceOrder(orderData);
      alert('Orden creada exitosamente');
      
      // Limpiar formulario
      clearVehicle();
      setObservations('');
      setItems([]);
      
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert(error.response?.data?.detail || 'Error al crear la orden');
    } finally {
      setLoading(false);
    }
  };

  // Imprimir orden (versión simplificada para vista previa)
  const printOrder = () => {
    const printWindow = window.open('', '', 'width=800,height=600');
    const total = calculateTotal();
    
    printWindow.document.write(`
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
            @media print {
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h1>SHALOM CAR SERVICE</h1>
          <h2 style="text-align: center;">Orden de Servicio</h2>
          
          <div class="info">
            <p><strong>Vehículo:</strong> ${selectedVehicle?.brand || ''} ${selectedVehicle?.model || ''}</p>
            <p><strong>Patente:</strong> ${selectedVehicle?.plate || ''}</p>
            <p><strong>Cliente:</strong> ${selectedVehicle?.customer_details?.name || ''}</p>
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
              ${items.map(item => `
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
            TOTAL: $${total.toFixed(2)}
          </div>
          
          <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir
          </button>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Nueva Orden de Servicio</h1>
      </div>

      {/* Búsqueda de vehículo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">1. Buscar Vehículo</h2>
        
        {!selectedVehicle ? (
          <div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Buscar por patente..."
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
                      <p className="text-sm text-gray-600">Cliente: {vehicle.customer_details?.name}</p>
                      <p className="text-sm text-gray-600">Tel: {vehicle.customer_details?.phone}</p>
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
                <p className="text-gray-700">Cliente: {selectedVehicle.customer_details?.name}</p>
                <p className="text-gray-600">Tel: {selectedVehicle.customer_details?.phone}</p>
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
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo</label>
                        <input
                          type="text"
                          value={item.item_type === 'PRODUCT' ? 'Producto' : 'Servicio'}
                          disabled
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                        />
                      </div>

                      {item.item_type === 'PRODUCT' && (
                        <div>
                          <label className="block text-sm font-medium mb-1">Producto</label>
                          <select
                            value={item.product || ''}
                            onChange={(e) => updateItem(item.id, 'product', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                          >
                            <option value="">Seleccionar...</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                {product.name} (Stock: {product.stock})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <div className={item.item_type === 'PRODUCT' ? '' : 'md:col-span-2'}>
                        <label className="block text-sm font-medium mb-1">Descripción</label>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="Descripción del item..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
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

                      <div>
                        <label className="block text-sm font-medium mb-1">Subtotal</label>
                        <input
                          type="text"
                          value={`$${parseFloat(item.subtotal || 0).toFixed(2)}`}
                          disabled
                          className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="mt-6 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={20} />
                    </button>
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
    </div>
  );
}
