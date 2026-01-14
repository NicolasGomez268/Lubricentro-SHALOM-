import { ArrowDown, ArrowUp, Edit3, X } from 'lucide-react';
import { useState } from 'react';
import { inventoryService } from '../../services/inventoryService';

const StockAdjustmentModal = ({ product, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    movement_type: 'ENTRADA',
    quantity: '',
    reason: '',
    reference: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await inventoryService.adjustStock(product.id, formData);
      onClose();
    } catch (error) {
      console.error('Error al ajustar stock:', error);
      alert('Error al ajustar el stock');
    } finally {
      setLoading(false);
    }
  };

  const getNewStock = () => {
    const qty = parseInt(formData.quantity) || 0;
    if (formData.movement_type === 'ENTRADA') {
      return product.stock_quantity + qty;
    } else if (formData.movement_type === 'SALIDA') {
      return product.stock_quantity - qty;
    } else {
      return qty;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-shalom-gray">Ajustar Stock</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">Código: {product.code}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Stock Actual</p>
              <p className="text-2xl font-bold text-shalom-gray">
                {product.stock_quantity} {product.unit_display}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Movement Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Movimiento *
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, movement_type: 'ENTRADA' }))}
                className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                  formData.movement_type === 'ENTRADA'
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-green-300'
                }`}
              >
                <ArrowUp className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Entrada</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, movement_type: 'SALIDA' }))}
                className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                  formData.movement_type === 'SALIDA'
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-red-300'
                }`}
              >
                <ArrowDown className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Salida</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, movement_type: 'AJUSTE' }))}
                className={`p-3 rounded-lg border-2 transition-colors flex flex-col items-center ${
                  formData.movement_type === 'AJUSTE'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 hover:border-blue-300'
                }`}
              >
                <Edit3 className="w-6 h-6 mb-1" />
                <span className="text-sm font-medium">Ajuste</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {formData.movement_type === 'AJUSTE' ? 'Nueva Cantidad *' : 'Cantidad *'}
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              className="input-field"
              required
            />
            {formData.quantity && (
              <p className="mt-2 text-sm text-gray-600">
                Stock resultante: <span className="font-semibold text-shalom-gray">
                  {getNewStock()} {product.unit_display}
                </span>
              </p>
            )}
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              rows="3"
              className="input-field"
              placeholder="Ej: Compra de mercadería, Uso en orden #123, Corrección de inventario..."
            />
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Referencia
            </label>
            <input
              type="text"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="input-field"
              placeholder="Ej: Orden #123, Factura #456"
            />
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
              {loading ? 'Ajustando...' : 'Confirmar Ajuste'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
