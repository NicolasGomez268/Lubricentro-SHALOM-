import { Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';

export default function EditOrderModal({ isOpen, onClose, order, onSave }) {
  const [formData, setFormData] = useState({
    items: [],
    observations: ''
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && order) {
      // Cargar productos
      loadProducts();
      
      // Inicializar formulario con datos de la orden
      setFormData({
        items: order.items.map(item => ({
          type: item.item_type === 'PRODUCT' ? 'product' : 'service',
          product: item.product?.id || null,
          service_description: item.service_description || '',
          quantity: item.quantity,
          unit_price: item.unit_price
        })),
        observations: order.observations || ''
      });
    }
  }, [isOpen, order]);

  const loadProducts = async () => {
    try {
      const productsList = await inventoryService.getProducts();
      setProducts(Array.isArray(productsList) ? productsList : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          type: 'product',
          product: null,
          service_description: '',
          quantity: 1,
          unit_price: 0
        }
      ]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Si cambió el tipo, resetear campos específicos
    if (field === 'type') {
      if (value === 'product') {
        newItems[index].service_description = '';
      } else {
        newItems[index].product = null;
      }
    }

    // Si cambió el producto, actualizar el precio
    if (field === 'product' && value) {
      const product = products.find(p => p.id === parseInt(value));
      if (product) {
        newItems[index].unit_price = product.price;
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que haya al menos un item
    if (formData.items.length === 0) {
      throw new Error('Debe agregar al menos un item');
    }

    // Validar cada item
    for (let item of formData.items) {
      if (item.type === 'product' && !item.product) {
        throw new Error('Debe seleccionar un producto para todos los items de tipo producto');
      }
      if (item.type === 'service' && !item.service_description) {
        throw new Error('Debe ingresar una descripción para todos los servicios');
      }
      if (item.quantity <= 0 || item.unit_price <= 0) {
        throw new Error('Cantidad y precio deben ser mayores a 0');
      }
    }

    // Transformar datos al formato del backend
    const dataToSend = {
      observations: formData.observations,
      items: formData.items.map(item => ({
        item_type: item.type === 'product' ? 'PRODUCT' : 'SERVICE',
        product: item.type === 'product' ? item.product : null,
        description: item.type === 'service' ? item.service_description : '',
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    };

    setLoading(true);
    try {
      await onSave(order.id, dataToSend);
      onClose();
    } catch (error) {
      console.error('Error al actualizar orden:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Editar Orden #{order?.id}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Items */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Items
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border border-gray-300 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex gap-4 flex-1">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipo
                          </label>
                          <select
                            value={item.type}
                            onChange={(e) => handleItemChange(index, 'type', e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2"
                            required
                          >
                            <option value="product">Producto</option>
                            <option value="service">Servicio</option>
                          </select>
                        </div>

                        {item.type === 'product' ? (
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Producto
                            </label>
                            <select
                              value={item.product || ''}
                              onChange={(e) => handleItemChange(index, 'product', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              required
                            >
                              <option value="">Seleccione un producto</option>
                              {products && products.map(product => (
                                <option key={product.id} value={product.id}>
                                  {product.name} (Stock: {product.stock_quantity})
                                </option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Descripción del Servicio
                            </label>
                            <input
                              type="text"
                              value={item.service_description}
                              onChange={(e) => handleItemChange(index, 'service_description', e.target.value)}
                              className="w-full border border-gray-300 rounded px-3 py-2"
                              required
                            />
                          </div>
                        )}
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio Unitario
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => handleItemChange(index, 'unit_price', parseFloat(e.target.value))}
                          className="w-full border border-gray-300 rounded px-3 py-2"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-2 text-right text-sm font-medium text-gray-700">
                      Subtotal: ${(item.quantity * item.unit_price).toFixed(2)}
                    </div>
                  </div>
                ))}

                {formData.items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No hay items. Haga clic en "Agregar Item" para comenzar.
                  </div>
                )}
              </div>
            </div>

            {/* Observaciones */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Ingrese observaciones adicionales..."
              />
            </div>

            {/* Total */}
            <div className="mb-6 text-right">
              <span className="text-xl font-bold text-gray-800">
                Total: $
                {formData.items.reduce((sum, item) => 
                  sum + (item.quantity * item.unit_price), 0
                ).toFixed(2)}
              </span>
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
