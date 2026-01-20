import { AlertCircle, Car, DollarSign, Package, Users, Wrench } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { inventoryService } from '../services/inventoryService';
import { formatCurrency, formatNumber } from '../utils/formatters';

const EmployeeDashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadProducts = async () => {
    try {
      const data = await inventoryService.getProducts();
      setProducts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    if (!products || products.length === 0) {
      return {
        totalProducts: 0,
        lowStockProducts: 0,
        totalInventoryValue: 0,
        outOfStock: 0
      };
    }

    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.is_low_stock || p.stock_quantity <= p.stock_min).length;
    const totalInventoryValue = products.reduce((sum, p) => 
      sum + (parseFloat(p.sale_price || 0) * (p.stock_quantity || 0)), 0
    );
    const outOfStock = products.filter(p => p.stock_quantity === 0).length;

    return {
      totalProducts,
      lowStockProducts,
      totalInventoryValue,
      outOfStock
    };
  };

  const stats = isAdmin && products.length > 0 ? calculateStats() : null;

  // Vista para ADMIN
  if (isAdmin) {
    return (
      <div className="h-full bg-gray-800 overflow-auto p-8">
        <div className="max-w-7xl w-full mx-auto space-y-8">
          {/* Métricas de Inventario */}
          {!loading && stats && products.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Valor Total Inventario */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 shadow-lg">
                <p className="text-green-100 text-xs font-medium mb-1">Valor Total Inventario</p>
                <p className="text-white text-2xl font-bold">{formatCurrency(stats.totalInventoryValue)}</p>
              </div>

              {/* Productos Totales */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 shadow-lg">
                <p className="text-blue-100 text-xs font-medium mb-1">Productos Totales</p>
                <p className="text-white text-2xl font-bold">{formatNumber(stats.totalProducts)}</p>
              </div>

              {/* Sin Stock */}
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 shadow-lg">
                <p className="text-yellow-100 text-xs font-medium mb-1">Sin Stock</p>
                <p className="text-white text-2xl font-bold">{formatNumber(stats.outOfStock)}</p>
              </div>
            </div>
          )}

          {/* Action Buttons Grid - más pequeños para admin */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/service-order/new')}
              className="group bg-white hover:bg-shalom-red p-5 rounded-xl shadow-lg transition-all duration-300 border border-gray-200 hover:border-shalom-red"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2.5 bg-shalom-red group-hover:bg-white rounded-lg transition-colors">
                  <Wrench className="w-7 h-7 text-white group-hover:text-shalom-red transition-colors" />
                </div>
                <span className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">Nueva Orden</span>
                <p className="text-xs text-gray-600 group-hover:text-white/90 transition-colors text-center">Crear nueva orden de servicio</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/vehicles')}
              className="group bg-white hover:bg-shalom-red p-5 rounded-xl shadow-lg transition-all duration-300 border border-gray-200 hover:border-shalom-red"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2.5 bg-shalom-red group-hover:bg-white rounded-lg transition-colors">
                  <Car className="w-7 h-7 text-white group-hover:text-shalom-red transition-colors" />
                </div>
                <span className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">Buscar Vehículo</span>
                <p className="text-xs text-gray-600 group-hover:text-white/90 transition-colors text-center">Consultar historial vehicular</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/customers')}
              className="group bg-white hover:bg-shalom-red p-5 rounded-xl shadow-lg transition-all duration-300 border border-gray-200 hover:border-shalom-red"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2.5 bg-shalom-red group-hover:bg-white rounded-lg transition-colors">
                  <Users className="w-7 h-7 text-white group-hover:text-shalom-red transition-colors" />
                </div>
                <span className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">Buscar Cliente</span>
                <p className="text-xs text-gray-600 group-hover:text-white/90 transition-colors text-center">Gestionar información de clientes</p>
              </div>
            </button>
            
            <button 
              onClick={() => navigate('/stock')}
              className="group bg-white hover:bg-shalom-red p-5 rounded-xl shadow-lg transition-all duration-300 border border-gray-200 hover:border-shalom-red"
            >
              <div className="flex flex-col items-center gap-2">
                <div className="p-2.5 bg-shalom-red group-hover:bg-white rounded-lg transition-colors">
                  <Package className="w-7 h-7 text-white group-hover:text-shalom-red transition-colors" />
                </div>
                <span className="text-lg font-bold text-gray-800 group-hover:text-white transition-colors">Consultar Stock</span>
                <p className="text-xs text-gray-600 group-hover:text-white/90 transition-colors text-center">Ver disponibilidad de productos</p>
              </div>
            </button>
          </div>

          {/* Alerta de Stock Bajo - Al final */}
          {!loading && stats && stats.lowStockProducts > 0 && (
            <div className="bg-red-50 border-l-4 border-shalom-red rounded-lg p-6 shadow-lg">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-shalom-red mr-3 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-shalom-red mb-2">
                    ⚠️ Alerta de Stock Bajo
                  </h3>
                  <p className="text-gray-700 mb-3">
                    Hay {stats.lowStockProducts} producto(s) con stock bajo o agotado. 
                    Es necesario realizar un pedido pronto.
                  </p>
                  <button 
                    onClick={() => navigate('/admin/inventory')}
                    className="px-4 py-2 bg-shalom-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                  >
                    Ver Productos con Stock Bajo
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vista para EMPLEADO (sin cambios)
  return (
    <div className="h-full bg-gray-800 flex items-center justify-center overflow-hidden p-8">
      <div className="max-w-6xl w-full">
        {/* Action Buttons Grid - botones grandes para empleados */}
        <div className="grid grid-cols-2 gap-6 max-w-5xl mx-auto">
          <button 
            onClick={() => navigate('/service-order/new')}
            className="group bg-white hover:bg-shalom-red p-6 rounded-xl shadow-xl transition-all duration-300 border-2 border-gray-700"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-shalom-red group-hover:bg-white rounded-xl transition-colors">
                <Wrench className="w-10 h-10 text-white group-hover:text-shalom-red transition-colors" />
              </div>
              <span className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors">Nueva Orden</span>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">Crear nueva orden de servicio</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/vehicles')}
            className="group bg-white hover:bg-shalom-red p-6 rounded-xl shadow-xl transition-all duration-300 border-2 border-gray-700"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-shalom-red group-hover:bg-white rounded-xl transition-colors">
                <Car className="w-10 h-10 text-white group-hover:text-shalom-red transition-colors" />
              </div>
              <span className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors">Buscar Vehículo</span>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">Consultar historial vehicular</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/customers')}
            className="group bg-white hover:bg-shalom-red p-6 rounded-xl shadow-xl transition-all duration-300 border-2 border-gray-700"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-shalom-red group-hover:bg-white rounded-xl transition-colors">
                <Users className="w-10 h-10 text-white group-hover:text-shalom-red transition-colors" />
              </div>
              <span className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors">Buscar Cliente</span>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">Gestionar información de clientes</p>
            </div>
          </button>
          
          <button 
            onClick={() => navigate('/stock')}
            className="group bg-white hover:bg-shalom-red p-6 rounded-xl shadow-xl transition-all duration-300 border-2 border-gray-700"
          >
            <div className="flex flex-col items-center gap-3">
              <div className="p-3 bg-shalom-red group-hover:bg-white rounded-xl transition-colors">
                <Package className="w-10 h-10 text-white group-hover:text-shalom-red transition-colors" />
              </div>
              <span className="text-2xl font-bold text-gray-800 group-hover:text-white transition-colors">Consultar Stock</span>
              <p className="text-sm text-gray-600 group-hover:text-white/90 transition-colors">Ver disponibilidad de productos</p>
            </div>
          </button>
        </div>

        {/* Alerta de Stock Bajo - Al final */}
        {isAdmin && !loading && stats && stats.lowStockProducts > 0 && (
          <div className="bg-red-50 border-l-4 border-shalom-red rounded-lg p-6 shadow-lg">
            <div className="flex items-start">
              <AlertCircle className="w-6 h-6 text-shalom-red mr-3 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-shalom-red mb-2">
                  ⚠️ Alerta de Stock Bajo
                </h3>
                <p className="text-gray-700 mb-3">
                  Hay {stats.lowStockProducts} producto(s) con stock bajo o agotado. 
                  Es necesario realizar un pedido pronto.
                </p>
                <button 
                  onClick={() => navigate('/admin/inventory')}
                  className="px-4 py-2 bg-shalom-red text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-semibold"
                >
                  Ver Productos con Stock Bajo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;

