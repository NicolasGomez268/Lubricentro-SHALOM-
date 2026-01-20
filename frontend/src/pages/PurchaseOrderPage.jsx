import { Plus, Printer, Save, ShoppingCart, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';

const PurchaseOrderPage = () => {
  const [products, setProducts] = useState([]);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [orderDetails, setOrderDetails] = useState({
    customer: '',
    reference: '',
    notes: '',
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await inventoryService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleAddItem = () => {
    if (!selectedProduct || !quantity || quantity <= 0) {
      alert('Selecciona un producto y una cantidad válida');
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProduct));
    if (!product) return;

    // Verificar si el producto ya está en la orden
    const existingItemIndex = orderItems.findIndex(item => item.product.id === product.id);

    if (existingItemIndex !== -1) {
      // Actualizar cantidad si ya existe
      const updatedItems = [...orderItems];
      updatedItems[existingItemIndex].quantity += parseInt(quantity);
      setOrderItems(updatedItems);
    } else {
      // Agregar nuevo item
      setOrderItems([...orderItems, {
        product,
        quantity: parseInt(quantity),
      }]);
    }

    // Limpiar campos
    setSelectedProduct('');
    setQuantity('');
  };

  const handleRemoveItem = (index) => {
    setOrderItems(orderItems.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, newQuantity) => {
    const updatedItems = [...orderItems];
    updatedItems[index].quantity = parseInt(newQuantity) || 0;
    setOrderItems(updatedItems);
  };

  const getTotalAmount = () => {
    return orderItems.reduce((sum, item) => 
      sum + (item.product.sale_price * item.quantity), 0
    );
  };

  const handleSaveOrder = async () => {
    if (orderItems.length === 0) {
      return;
    }

    setLoading(true);
    try {
      // Procesar cada item como una venta
      for (const item of orderItems) {
        await inventoryService.adjustStock(item.product.id, {
          movement_type: 'VENTA',
          quantity: item.quantity,
          reason: `Orden de venta${orderDetails.customer ? ` - Cliente: ${orderDetails.customer}` : ''}${orderDetails.notes ? ` - ${orderDetails.notes}` : ''}`,
          reference: orderDetails.reference || `Orden ${new Date().toISOString().split('T')[0]}`,
        });
      }

      // Limpiar formulario
      setOrderItems([]);
      setOrderDetails({ supplier: '', reference: '', notes: '' });
      loadProducts(); // Recargar productos para actualizar stock
    } catch (error) {
      console.error('Error al procesar orden:', error);
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Error al procesar la orden de compra';
      console.error('Detalle del error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Orden de Venta</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1f2937; border-bottom: 3px solid #dc2626; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
            .total { font-weight: bold; font-size: 18px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h1>Shalom Car Service - Orden de Venta</h1>
          <p><strong>Fecha:</strong> ${new Date().toLocaleDateString()}</p>
          <p><strong>Cliente:</strong> ${orderDetails.customer || 'N/A'}</p>
          <p><strong>Referencia:</strong> ${orderDetails.reference || 'N/A'}</p>
          <table>
            <thead>
              <tr>
                <th>Código</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${orderItems.map(item => `
                <tr>
                  <td>${item.product.code}</td>
                  <td>${item.product.name}</td>
                  <td>${item.quantity} ${item.product.unit_display}</td>
                  <td>$${item.product.sale_price}</td>
                  <td>$${(item.product.sale_price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <p class="total">Total: $${getTotalAmount().toFixed(2)}</p>
          <p><strong>Notas:</strong> ${orderDetails.notes || 'N/A'}</p>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-shalom-gray to-gray-700 rounded-lg shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Orden de Venta</h1>
            <p className="text-gray-200">Registra ventas de productos a clientes</p>
          </div>
          <ShoppingCart className="w-16 h-16 opacity-50" />
        </div>
      </div>

      {/* Mensaje de éxito */}
      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel de selección de productos */}
        <div className="lg:col-span-2 space-y-6">
          {/* Agregar productos */}
          <div className="card">
            <h2 className="text-xl font-bold text-shalom-gray mb-4">Agregar Productos</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Producto
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="input-field"
                >
                  <option value="">Seleccionar producto...</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.code} - {product.name} (Stock: {product.stock_quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="input-field"
                    placeholder="0"
                  />
                  <button
                    onClick={handleAddItem}
                    className="btn-primary whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Lista de productos en la orden */}
          <div className="card">
            <h2 className="text-xl font-bold text-shalom-gray mb-4">
              Productos en la Orden ({orderItems.length})
            </h2>

            {orderItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No hay productos en la orden</p>
                <p className="text-sm mt-2">Agrega productos usando el formulario de arriba</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cantidad</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">P. Venta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orderItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {item.product.code}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {item.product.name}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(index, e.target.value)}
                            min="1"
                            className="w-20 input-field"
                          />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          ${item.product.sale_price}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                          ${(item.product.sale_price * item.quantity).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Panel lateral - Detalles y Resumen */}
        <div className="space-y-6">
          {/* Detalles de la orden */}
          <div className="card">
            <h2 className="text-xl font-bold text-shalom-gray mb-4">Detalles de la Orden</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente
                </label>
                <input
                  type="text"
                  value={orderDetails.customer}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, customer: e.target.value }))}
                  className="input-field"
                  placeholder="Nombre del cliente"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referencia
                </label>
                <input
                  type="text"
                  value={orderDetails.reference}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, reference: e.target.value }))}
                  className="input-field"
                  placeholder="Ej: Factura #123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={orderDetails.notes}
                  onChange={(e) => setOrderDetails(prev => ({ ...prev, notes: e.target.value }))}
                  className="input-field"
                  rows="3"
                  placeholder="Observaciones adicionales..."
                />
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div className="card bg-gray-50">
            <h2 className="text-xl font-bold text-shalom-gray mb-4">Resumen</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Productos:</span>
                <span className="font-semibold">{orderItems.length}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Unidades totales:</span>
                <span className="font-semibold">
                  {orderItems.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              </div>

              <div className="border-t border-gray-300 pt-3 mt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-shalom-red">
                    ${getTotalAmount().toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <button
                onClick={handleSaveOrder}
                disabled={loading || orderItems.length === 0}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Procesando...' : 'Registrar Venta'}
              </button>

              <button
                onClick={handlePrint}
                disabled={orderItems.length === 0}
                className="btn-secondary w-full flex items-center justify-center gap-2"
              >
                <Printer className="w-5 h-5" />
                Imprimir Orden
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchaseOrderPage;
