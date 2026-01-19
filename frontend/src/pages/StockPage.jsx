import { ArrowDownCircle, ArrowUpCircle, Clock, Filter, Package, RefreshCw, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { inventoryService } from '../services/inventoryService';
import { formatDate } from '../utils/formatters';

const StockPage = () => {
  const [movements, setMovements] = useState([]);
  const [filteredMovements, setFilteredMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [movementTypeFilter, setMovementTypeFilter] = useState('ALL');

  useEffect(() => {
    loadMovements();
  }, []);

  useEffect(() => {
    filterMovements();
  }, [searchTerm, movementTypeFilter, movements]);

  const loadMovements = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getStockMovements();
      setMovements(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar movimientos:', error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const filterMovements = () => {
    let filtered = [...movements];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(movement =>
        movement.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.product_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.reference?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por tipo de movimiento
    if (movementTypeFilter !== 'ALL') {
      filtered = filtered.filter(movement => movement.movement_type === movementTypeFilter);
    }

    setFilteredMovements(filtered);
  };

  const getMovementIcon = (type) => {
    switch (type) {
      case 'ENTRADA':
        return <ArrowDownCircle className="w-5 h-5 text-green-600" />;
      case 'SALIDA':
        return <ArrowUpCircle className="w-5 h-5 text-red-600" />;
      case 'AJUSTE':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getMovementColor = (type) => {
    switch (type) {
      case 'ENTRADA':
        return 'bg-green-100 text-green-800';
      case 'SALIDA':
        return 'bg-red-100 text-red-800';
      case 'AJUSTE':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shalom-red"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-shalom-gray mb-2">Movimientos de Stock</h1>
        <p className="text-gray-600">Historial completo de entradas, salidas y ajustes de inventario</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Movimientos</p>
              <p className="text-3xl font-bold text-shalom-gray">{movements.length}</p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <Package className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Entradas</p>
              <p className="text-3xl font-bold text-green-600">
                {movements.filter(m => m.movement_type === 'ENTRADA').length}
              </p>
            </div>
            <div className="bg-green-500 p-4 rounded-lg">
              <ArrowDownCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Salidas</p>
              <p className="text-3xl font-bold text-red-600">
                {movements.filter(m => m.movement_type === 'SALIDA').length}
              </p>
            </div>
            <div className="bg-red-500 p-4 rounded-lg">
              <ArrowUpCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ajustes</p>
              <p className="text-3xl font-bold text-blue-600">
                {movements.filter(m => m.movement_type === 'AJUSTE').length}
              </p>
            </div>
            <div className="bg-blue-500 p-4 rounded-lg">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="w-4 h-4 inline mr-2" />
              Buscar Movimiento
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por producto, código o referencia..."
              className="input-field"
            />
          </div>

          {/* Filtro por Tipo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="w-4 h-4 inline mr-2" />
              Tipo de Movimiento
            </label>
            <select
              value={movementTypeFilter}
              onChange={(e) => setMovementTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="ALL">Todos</option>
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste</option>
            </select>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="mt-4 text-sm text-gray-600">
          Mostrando {filteredMovements.length} de {movements.length} movimientos
        </div>
      </div>

      {/* Movements Table */}
      <div className="card">
        <h2 className="text-xl font-bold text-shalom-gray mb-4">Historial de Movimientos</h2>

        {filteredMovements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Package className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No hay movimientos registrados</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Referencia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {formatDate(movement.created_at)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getMovementIcon(movement.movement_type)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMovementColor(movement.movement_type)}`}>
                          {movement.movement_type_display}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {movement.product_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {movement.product_code}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-semibold ${
                        movement.movement_type === 'ENTRADA' ? 'text-green-600' :
                        movement.movement_type === 'SALIDA' ? 'text-red-600' :
                        'text-blue-600'
                      }`}>
                        {movement.movement_type === 'SALIDA' ? '-' : '+'}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {movement.reason || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <User className="w-4 h-4 text-gray-400" />
                        {movement.performed_by_name || 'Sistema'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.reference || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockPage;
