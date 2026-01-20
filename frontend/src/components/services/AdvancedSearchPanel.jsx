import { ChevronDown, ChevronUp, Filter, X } from 'lucide-react';
import { useState } from 'react';

export default function AdvancedSearchPanel({ onSearch, onReset }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    date_from: '',
    date_to: '',
    min_total: '',
    max_total: '',
    customer: '',
    plate: ''
  });

  const handleChange = (field, value) => {
    setFilters({ ...filters, [field]: value });
  };

  const handleSearch = () => {
    // Filtrar valores vacíos
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== '')
    );
    onSearch(activeFilters);
  };

  const handleReset = () => {
    setFilters({
      status: '',
      date_from: '',
      date_to: '',
      min_total: '',
      max_total: '',
      customer: '',
      plate: ''
    });
    onReset();
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Filter className="text-blue-600" size={20} />
          <span className="font-semibold text-gray-800">Búsqueda Avanzada</span>
          {activeFiltersCount > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>

      {/* Filters Panel */}
      {isExpanded && (
        <div className="p-6 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos</option>
                <option value="PENDING">Pendiente</option>
                <option value="COMPLETED">Completada</option>
                <option value="CANCELLED">Cancelada</option>
              </select>
            </div>

            {/* Fecha Desde */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Desde
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleChange('date_from', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Fecha Hasta */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha Hasta
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleChange('date_to', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Patente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patente
              </label>
              <input
                type="text"
                value={filters.plate}
                onChange={(e) => handleChange('plate', e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 uppercase"
              />
            </div>

            {/* Total Mínimo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Mínimo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.min_total}
                onChange={(e) => handleChange('min_total', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Total Máximo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Máximo
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={filters.max_total}
                onChange={(e) => handleChange('max_total', e.target.value)}
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              <X size={18} />
              Limpiar Filtros
            </button>
            <button
              onClick={handleSearch}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Filter size={18} />
              Aplicar Filtros
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
