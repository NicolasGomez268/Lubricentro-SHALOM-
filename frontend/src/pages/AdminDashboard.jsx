import { BarChart3, DollarSign, Package, TrendingUp, Users } from 'lucide-react';

const AdminDashboard = () => {
  const stats = [
    {
      title: 'Ingresos del Mes',
      value: '$0',
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+0%',
    },
    {
      title: 'Órdenes Completadas',
      value: '0',
      icon: BarChart3,
      color: 'bg-blue-500',
      change: '+0%',
    },
    {
      title: 'Productos en Stock',
      value: '0',
      icon: Package,
      color: 'bg-purple-500',
      change: '0',
    },
    {
      title: 'Clientes Totales',
      value: '0',
      icon: Users,
      color: 'bg-shalom-red',
      change: '+0',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-shalom-gray mb-2">Dashboard Administrativo</h1>
        <p className="text-gray-600">Métricas y gestión del negocio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <div className="flex items-center justify-between mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className="text-sm font-medium text-green-600">{stat.change}</span>
            </div>
            <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
            <p className="text-2xl font-bold text-shalom-gray">{stat.value}</p>
          </div>
        ))}
      </div>

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
          <button className="btn-primary py-3">
            Gestionar Stock
          </button>
          <button className="btn-secondary py-3">
            Ver Reportes
          </button>
          <button className="btn-secondary py-3">
            Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
