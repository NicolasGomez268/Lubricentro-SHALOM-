import { AlertCircle, BarChart3, DollarSign, Package, TrendingUp, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/common/StatCard';
import { inventoryService } from '../services/inventoryService';
import { formatCurrency, formatNumber } from '../utils/formatters';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const productsData = await inventoryService.getProducts();
      setProducts(productsData);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const totalProducts = products.length;
    const activeProducts = products.filter(p => p.is_active).length;
    const lowStockProducts = products.filter(p => p.is_low_stock).length;
    const totalInventoryValue = products.reduce((sum, p) => 
      sum + (parseFloat(p.sale_price) * p.stock_quantity), 0
    );
    const outOfStock = products.filter(p => p.stock_quantity === 0).length;

    return {
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalInventoryValue,
      outOfStock
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-shalom-red"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-shalom-gray mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600">Métricas y gestión del negocio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Valor Total Inventario"
          value={formatCurrency(stats.totalInventoryValue)}
          icon={DollarSign}
          color="green"
        />
        <StatCard
          title="Productos Totales"
          value={formatNumber(stats.totalProducts)}
          icon={Package}
          color="blue"
        />
        <StatCard
          title="Stock Bajo"
          value={formatNumber(stats.lowStockProducts)}
          icon={AlertCircle}
          color="red"
        />
        <StatCard
          title="Sin Stock"
          value={formatNumber(stats.outOfStock)}
          icon={Package}
          color="yellow"
        />
      </div>

      {/* Alertas y Productos con Stock Bajo */}
      {stats.lowStockProducts > 0 && (
        <div className="card bg-red-50 border-l-4 border-shalom-red">
          <div className="flex items-start">
            <AlertCircle className="w-6 h-6 text-shalom-red mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-shalom-red mb-2">
                ⚠️ Alerta de Stock Bajo
              </h3>
              <p className="text-gray-700 mb-3">
                Hay {stats.lowStockProducts} producto(s) con stock bajo o agotado. 
                Es necesario realizar un pedido pronto.
              </p>
              <button 
                onClick={() => navigate('/inventory')}
                className="btn-primary text-sm"
              >
                Ver Productos con Stock Bajo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-shalom-gray mb-4">Ingresos Mensuales</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Gráfico de ingresos (Próximamente)</p>
            </div>
          </div>
        </div>

        {/* Services Chart */}
        <div className="card">
          <h3 className="text-lg font-bold text-shalom-gray mb-4">Servicios Más Solicitados</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Gráfico de servicios (Próximamente)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h3 className="text-lg font-bold text-shalom-gray mb-4">Actividad Reciente</h3>
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>No hay actividad registrada aún</p>
        </div>
      </div>

      {/* Quick Admin Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-shalom-gray mb-4">Gestión Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/inventory')}
            className="btn-primary py-3"
          >
            <Package className="w-5 h-5 inline mr-2" />
            Gestionar Inventario
          </button>
          <button 
            onClick={() => navigate('/stock')}
            className="btn-secondary py-3"
          >
            <TrendingUp className="w-5 h-5 inline mr-2" />
            Ver Movimientos
          </button>
          <button className="px-4 py-3 bg-gray-100 text-shalom-gray rounded-lg hover:bg-gray-200 transition-colors font-medium">
            <Users className="w-5 h-5 inline mr-2" />
            Gestionar Empleados
          </button>
        </div>
      </div>

      {/* Productos Destacados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Más Valiosos */}
        <div className="card">
          <h3 className="text-lg font-bold text-shalom-gray mb-4">
            Productos con Mayor Valor en Stock
          </h3>
          {products.length > 0 ? (
            <div className="space-y-3">
              {products
                .map(p => ({
                  ...p,
                  totalValue: parseFloat(p.sale_price) * p.stock_quantity
                }))
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 5)
                .map(product => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-shalom-gray">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.stock_quantity} {product.unit_display}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{formatCurrency(product.totalValue)}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(product.sale_price)} c/u</p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay productos registrados</p>
          )}
        </div>

        {/* Productos con Mejor Margen */}
        <div className="card">
          <h3 className="text-lg font-bold text-shalom-gray mb-4">
            Productos con Mejor Margen
          </h3>
          {products.length > 0 ? (
            <div className="space-y-3">
              {products
                .filter(p => p.profit_margin > 0)
                .sort((a, b) => b.profit_margin - a.profit_margin)
                .slice(0, 5)
                .map(product => (
                  <div key={product.id} className="flex items-center justify-between py-2 border-b border-gray-100">
                    <div className="flex-1">
                      <p className="font-medium text-shalom-gray">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.category_display}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">{product.profit_margin.toFixed(1)}%</p>
                      <p className="text-sm text-gray-500">
                        {formatCurrency(product.purchase_price)} → {formatCurrency(product.sale_price)}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">No hay productos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
