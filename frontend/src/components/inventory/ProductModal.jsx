import { Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { inventoryService } from '../../services/inventoryService';

const ProductModal = ({ product, onClose }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: '',  // Sin valor por defecto
    brand: '',
    description: '',
    stock_quantity: 0,
    min_stock: 5,
    unit: 'UNIDAD',
    purchase_price: '',
    sale_price: '',
    is_active: true,
  });

  useEffect(() => {
    loadCategories();
    if (product) {
      setFormData({
        code: product.code,
        name: product.name,
        category: product.category,
        brand: product.brand || '',
        description: product.description || '',
        stock_quantity: product.stock_quantity,
        min_stock: product.min_stock,
        unit: product.unit,
        purchase_price: product.purchase_price,
        sale_price: product.sale_price,
        is_active: product.is_active,
      });
    }
  }, [product]);

  const loadCategories = async () => {
    try {
      console.log('🔄 Cargando categorías...');
      const data = await inventoryService.getCategories();
      console.log('✅ Categorías recibidas del backend:', data);
      console.log('📊 Cantidad de categorías:', data?.length);
      console.log('📋 Tipo de dato:', typeof data, Array.isArray(data));
      setCategories(data || []);
      // Si no hay categorías y no estamos editando, dejamos vacío
      // Si hay categorías y no estamos editando, seleccionar la primera
      if (!product && data && data.length > 0) {
        console.log('🎯 Seleccionando primera categoría:', data[0].value);
        setFormData(prev => ({ ...prev, category: data[0].value }));
      }
    } catch (error) {
      console.error('❌ Error al cargar categorías:', error);
    }
  };

  const handleAddNewCategory = async () => {
    if (!newCategoryName.trim()) {
      alert('Por favor ingresa un nombre para la categoría');
      return;
    }

    try {
      const categoryValue = newCategoryName.toUpperCase().replace(/\s+/g, '_');
      const newCategory = {
        value: categoryValue,
        label: newCategoryName
      };
      
      // Agregar la nueva categoría al estado local
      setCategories(prev => [...prev, newCategory]);
      
      // Seleccionar la nueva categoría en el formulario
      setFormData(prev => ({
        ...prev,
        category: categoryValue
      }));
      
      // Limpiar y cerrar el input
      setNewCategoryName('');
      setShowNewCategoryInput(false);
    } catch (error) {
      console.error('Error al agregar categoría:', error);
      alert('Error al agregar la categoría');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Limpiar error del campo al cambiar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es obligatorio';
    }
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es obligatorio';
    }
    if (parseFloat(formData.purchase_price) <= 0) {
      newErrors.purchase_price = 'El precio de compra debe ser mayor a 0';
    }
    if (parseFloat(formData.sale_price) <= 0) {
      newErrors.sale_price = 'El precio de venta debe ser mayor a 0';
    }
    if (parseFloat(formData.sale_price) < parseFloat(formData.purchase_price)) {
      newErrors.sale_price = 'El precio de venta debe ser mayor al precio de compra';
    }
    if (parseInt(formData.stock_quantity) < 0) {
      newErrors.stock_quantity = 'La cantidad no puede ser negativa';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (product) {
        await inventoryService.updateProduct(product.id, formData);
      } else {
        await inventoryService.createProduct(formData);
      }
      onClose();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      if (error.response?.data) {
        // Mapear errores del backend
        const backendErrors = {};
        Object.keys(error.response.data).forEach(key => {
          backendErrors[key] = Array.isArray(error.response.data[key]) 
            ? error.response.data[key][0] 
            : error.response.data[key];
        });
        setErrors(backendErrors);
        alert(`Error: ${JSON.stringify(error.response.data)}`);
      } else {
        alert('Error al guardar el producto. Por favor, verifica los datos.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-shalom-gray">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información Básica */}
          <div>
            <h3 className="text-lg font-semibold text-shalom-gray mb-4">Información Básica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`input-field ${errors.code ? 'border-red-500' : ''}`}
                  required
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  required
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoría *
                </label>
                <div className="flex gap-2">
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field flex-1"
                    required
                  >
                    <option value="">Seleccionar categoría...</option>
                    {(() => {
                      console.log('🔍 Renderizando options del select. Categories:', categories);
                      console.log('🔍 Categories.length:', categories?.length);
                      return categories.map((cat, index) => {
                        console.log(`📝 Renderizando option ${index}:`, cat);
                        return (
                          <option key={cat.value} value={cat.value}>
                            {cat.label}
                          </option>
                        );
                      });
                    })()}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategoryInput(!showNewCategoryInput)}
                    className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                    title="Agregar nueva categoría"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {showNewCategoryInput && (
                  <div className="mt-2 flex gap-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      placeholder="Nombre de la nueva categoría"
                      className="input-field flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddNewCategory();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAddNewCategory}
                      className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      Agregar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewCategoryInput(false);
                        setNewCategoryName('');
                      }}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca
                </label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Stock */}
          <div>
            <h3 className="text-lg font-semibold text-shalom-gray mb-4">Stock</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cantidad Inicial *
                </label>
                <input
                  type="number"
                  name="stock_quantity"
                  value={formData.stock_quantity}
                  onChange={handleChange}
                  min="0"
                  className={`input-field ${errors.stock_quantity ? 'border-red-500' : ''}`}
                  required
                />
                {errors.stock_quantity && <p className="text-red-500 text-sm mt-1">{errors.stock_quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stock Mínimo *
                </label>
                <input
                  type="number"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleChange}
                  min="0"
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad de Medida *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="LITRO">Litro</option>
                  <option value="UNIDAD">Unidad</option>
                  <option value="PACK">Pack</option>
                </select>
              </div>
            </div>
          </div>

          {/* Precios */}
          <div>
            <h3 className="text-lg font-semibold text-shalom-gray mb-4">Precios</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Compra *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="purchase_price"
                    value={formData.purchase_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`input-field pl-8 ${errors.purchase_price ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.purchase_price && <p className="text-red-500 text-sm mt-1">{errors.purchase_price}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Precio de Venta *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="sale_price"
                    value={formData.sale_price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className={`input-field pl-8 ${errors.sale_price ? 'border-red-500' : ''}`}
                    required
                  />
                </div>
                {errors.sale_price && <p className="text-red-500 text-sm mt-1">{errors.sale_price}</p>}
              </div>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="is_active"
              id="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-shalom-red border-gray-300 rounded focus:ring-shalom-red"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Producto Activo
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (product ? 'Actualizar' : 'Crear Producto')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
