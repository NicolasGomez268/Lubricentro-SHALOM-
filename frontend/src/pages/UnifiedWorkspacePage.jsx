import { Car, Plus, Search, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import crmService from '../services/crmService';
import { inventoryService } from '../services/inventoryService';

export default function UnifiedWorkspacePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await inventoryService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error al cargar productos:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert('Ingrese una patente, nombre de cliente o marca de vehículo');
      return;
    }

    setLoading(true);
    try {
      // Buscar vehículos
      const vehiclesData = await crmService.getVehicles({ search: searchTerm });
      const vehicles = vehiclesData.results || vehiclesData;
      
      // Buscar clientes
      const customersData = await crmService.getCustomers();
      const allCustomers = customersData.results || customersData;
      
      // Filtrar clientes por búsqueda
      const filteredCustomers = allCustomers.filter(customer => {
        const search = searchTerm.toLowerCase();
        const matchBasic = customer.full_name.toLowerCase().includes(search) ||
          customer.phone.includes(search);
        const matchVehicles = customer.vehicles && customer.vehicles.some(v =>
          v.plate.toLowerCase().includes(search) ||
          v.brand.toLowerCase().includes(search) ||
          v.model.toLowerCase().includes(search)
        );
        return matchBasic || matchVehicles;
      });

      setSearchResults({
        vehicles: vehicles || [],
        customers: filteredCustomers || []
      });
    } catch (error) {
      console.error('Error en búsqueda:', error);
      alert('Error al buscar');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectVehicle = (vehicle, customer) => {
    setSelectedVehicle(vehicle);
    setSelectedCustomer(customer);
  };

  const handleCreateOrder = () => {
    if (!selectedVehicle || !selectedCustomer) {
      alert('Debe seleccionar un vehículo primero');
      return;
    }

    // Navegar a crear orden con datos precargados
    navigate('/service-order', {
      state: {
        vehicle: selectedVehicle,
        customer: selectedCustomer
      }
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Servicio</h1>
        <p className="text-gray-600 mt-1">Busque el vehículo por patente y cree una orden</p>
      </div>

      {/* Buscador Principal */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Buscar Vehículo o Cliente
        </label>
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              placeholder="Ingrese PATENTE, nombre del cliente o marca del vehículo..."
              className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              autoFocus
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
          >
            <Search size={20} />
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </div>
      </div>

      {/* Vehículo Seleccionado */}
      {selectedVehicle && selectedCustomer && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-900 mb-3">Vehículo Seleccionado</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Patente</p>
                  <p className="text-2xl font-bold text-green-900">{selectedVehicle.plate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Vehículo</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedVehicle.brand} {selectedVehicle.model} {selectedVehicle.year}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Cliente</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCustomer.full_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedCustomer.phone}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleCreateOrder}
              className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Plus size={20} />
              Crear Orden
            </button>
          </div>
        </div>
      )}

      {/* Resultados de Búsqueda */}
      {searchResults.customers && searchResults.customers.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h3 className="text-lg font-bold text-gray-900">Resultados de Búsqueda</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {searchResults.customers.map((customer) => (
              <div key={customer.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-900">{customer.full_name}</h4>
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                      {customer.city && <p className="text-sm text-gray-500">{customer.city}</p>}
                    </div>
                  </div>
                </div>

                {/* Vehículos del Cliente */}
                {customer.vehicles && customer.vehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {customer.vehicles.map((vehicle) => (
                      <button
                        key={vehicle.id}
                        onClick={() => handleSelectVehicle(vehicle, customer)}
                        className="flex items-center gap-3 p-4 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-500 rounded-lg text-left transition-all"
                      >
                        <Car className="text-blue-600 flex-shrink-0" size={24} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xl font-bold text-blue-900">{vehicle.plate}</p>
                          <p className="text-sm text-blue-700 truncate">
                            {vehicle.brand} {vehicle.model}
                          </p>
                          {vehicle.year && (
                            <p className="text-xs text-blue-600">{vehicle.year}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">Este cliente no tiene vehículos registrados</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sin Resultados */}
      {searchResults.customers && searchResults.customers.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Car className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No se encontraron resultados</h3>
          <p className="text-gray-600 mb-6">
            No hay vehículos o clientes que coincidan con "{searchTerm}"
          </p>
          <button
            onClick={() => navigate('/customers')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Registrar Nuevo Cliente/Vehículo
          </button>
        </div>
      )}
    </div>
  );
}
