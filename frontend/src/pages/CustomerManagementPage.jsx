import { ArrowLeft, Car, Edit, Mail, MapPin, Phone, Plus, Search, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/common/ConfirmDialog';
import CustomerModal from '../components/crm/CustomerModal';
import VehicleModal from '../components/crm/VehicleModal';
import { useAuth } from '../context/AuthContext';
import crmService from '../services/crmService';

export default function CustomerManagementPage() {
    const { isAdmin } = useAuth();
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [filteredCustomers, setFilteredCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, customerId: null });

    useEffect(() => {
        loadCustomers();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, customers]);

    const loadCustomers = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await crmService.getCustomers();
            console.log('Clientes cargados:', data);
            // Extraer el array results si viene paginado
            const customersList = data.results || data;
            setCustomers(customersList);
        } catch (err) {
            setError('Error al cargar clientes');
            console.error('Error loading customers:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!Array.isArray(customers)) {
            setFilteredCustomers([]);
            return;
        }

        let filtered = [...customers];

        // Aplicar búsqueda
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(customer => {
                // Buscar en nombre, teléfono, email
                const matchBasicInfo = customer.full_name.toLowerCase().includes(search) ||
                    customer.phone.includes(search) ||
                    (customer.email && customer.email.toLowerCase().includes(search));
                
                // Buscar en patentes de vehículos
                const matchVehicles = customer.vehicles && customer.vehicles.some(vehicle =>
                    vehicle.plate.toLowerCase().includes(search) ||
                    vehicle.brand.toLowerCase().includes(search) ||
                    vehicle.model.toLowerCase().includes(search)
                );
                
                return matchBasicInfo || matchVehicles;
            });
        }

        setFilteredCustomers(filtered);
    };

    const handleCreateCustomer = () => {
        setSelectedCustomer(null);
        setIsModalOpen(true);
    };

    const handleEditCustomer = (customer) => {
        setSelectedCustomer(customer);
        setIsModalOpen(true);
    };

    const handleDeleteCustomer = (id) => {
        setDeleteConfirm({ isOpen: true, customerId: id });
    };

    const confirmDelete = async () => {
        try {
            await crmService.deleteCustomer(deleteConfirm.customerId);
            await loadCustomers();
            setDeleteConfirm({ isOpen: false, customerId: null });
        } catch (err) {
            alert('Error al eliminar cliente');
            console.error('Error deleting customer:', err);
            setDeleteConfirm({ isOpen: false, customerId: null });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleModalSave = async () => {
        try {
            await loadCustomers();
            setIsModalOpen(false);
            setSelectedCustomer(null);
        } catch (err) {
            console.error('Error reloading customers:', err);
            // Cerrar el modal de todas formas
            setIsModalOpen(false);
            setSelectedCustomer(null);
        }
    };

    const handleAddVehicle = (customer) => {
        setSelectedCustomer(customer);
        setIsVehicleModalOpen(true);
    };

    const handleVehicleModalClose = () => {
        setIsVehicleModalOpen(false);
        setSelectedCustomer(null);
    };

    const handleVehicleModalSave = async () => {
        try {
            await loadCustomers();
            setIsVehicleModalOpen(false);
            setSelectedCustomer(null);
        } catch (err) {
            console.error('Error reloading customers:', err);
            setIsVehicleModalOpen(false);
            setSelectedCustomer(null);
        }
    };

    return (
        <div className="space-y-6 p-6 bg-gray-800 min-h-screen">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gestión de Clientes</h1>
                    <p className="text-gray-300 mt-1">Buscar por nombre, teléfono, email o patente</p>
                </div>
                <div className="flex gap-3">
                    {!isAdmin && (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver
                        </button>
                    )}
                    <button
                        onClick={handleCreateCustomer}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus size={20} />
                        Nuevo Cliente
                    </button>
                </div>
            </div>

            {/* Búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, teléfono, email o patente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Tabla de Clientes */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Cargando clientes...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contacto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Ubicación
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehículos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredCustomers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            No se encontraron clientes
                                        </td>
                                    </tr>
                                ) : (
                                    filteredCustomers.map((customer) => (
                                        <tr key={customer.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-medium text-gray-900">
                                                    {customer.full_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Phone size={14} />
                                                        {customer.phone}
                                                    </div>
                                                    {customer.email && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                                            <Mail size={14} />
                                                            {customer.email}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {customer.city && (
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <MapPin size={14} />
                                                        {customer.city}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2 items-center">
                                                    {customer.vehicles && customer.vehicles.length > 0 ? (
                                                        customer.vehicles.map((vehicle) => (
                                                            <div key={vehicle.id} className="bg-blue-50 px-3 py-1.5 rounded-md">
                                                                <div className="text-sm font-bold text-blue-900">{vehicle.plate}</div>
                                                                <div className="text-xs text-blue-600">{vehicle.brand} {vehicle.model}</div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <span className="text-sm text-gray-400 italic">Sin vehículos</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleAddVehicle(customer)}
                                                        className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 text-green-700 hover:bg-green-200 rounded-md font-medium transition-colors"
                                                        title="Agregar vehículo"
                                                    >
                                                        <Car size={14} />
                                                        Agregar
                                                    </button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    customer.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {customer.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditCustomer(customer)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCustomer(customer.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Cliente */}
            {isModalOpen && (
                <CustomerModal
                    customer={selectedCustomer}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                />
            )}

            {/* Modal de Vehículo */}
            {isVehicleModalOpen && selectedCustomer && (
                <VehicleModal
                    vehicle={null}
                    customers={[{ id: selectedCustomer.id, full_name: selectedCustomer.full_name }]}
                    onClose={handleVehicleModalClose}
                    onSave={handleVehicleModalSave}
                />
            )}

            {/* Modal de Confirmación */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Eliminar Cliente"
                message="¿Está seguro de que desea eliminar este cliente? Esta acción no se puede deshacer."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, customerId: null })}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger={true}
            />
        </div>
    );
}
