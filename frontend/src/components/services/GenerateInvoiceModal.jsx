import { X } from 'lucide-react';
import { useState } from 'react';

export default function GenerateInvoiceModal({ isOpen, onClose, order, onGenerate }) {
  const [formData, setFormData] = useState({
    invoice_type: 'C',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setLoading(true);
    try {
      await onGenerate(order.id, {
        service_order: order.id,
        invoice_type: formData.invoice_type,
        notes: formData.notes
      });
      onClose();
      setFormData({ invoice_type: 'C', notes: '' });
    } catch (error) {
      console.error('Error al generar factura:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Generar Factura
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">Orden</p>
            <p className="font-semibold">#{order?.order_number}</p>
            <p className="text-sm text-gray-600 mt-2">Total</p>
            <p className="text-xl font-bold text-green-600">${parseFloat(order?.total || 0).toFixed(2)}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Tipo de Factura */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Factura *
              </label>
              <select
                value={formData.invoice_type}
                onChange={(e) => setFormData({ ...formData, invoice_type: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
                required
              >
                <option value="A">Factura A</option>
                <option value="B">Factura B</option>
                <option value="C">Factura C</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                C: Consumidor Final (defecto)
              </p>
            </div>

            {/* Observaciones */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Observaciones
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows="3"
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="Observaciones adicionales (opcional)"
              />
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
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? 'Generando...' : 'Generar Factura'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
