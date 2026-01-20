import { AlertCircle, DollarSign, Package, TrendingUp, Users } from 'lucide-react';
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
                onClick={() => navigate('/admin/inventory')}
                className="btn-primary text-sm"
              >
                Ver Productos con Stock Bajo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Admin Actions */}
      <div className="card">
        <h3 className="text-lg font-bold text-shalom-gray mb-4">Gestión Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => navigate('/admin/inventory')}
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
          <button 
            onClick={() => navigate('/admin/customers')}
            className="px-4 py-3 bg-gray-100 text-shalom-gray rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Users className="w-5 h-5 inline mr-2" />
            Gestionar Clientes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
