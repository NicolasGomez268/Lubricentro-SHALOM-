import { Edit, Gauge, Plus, Search, Trash2, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog';
import VehicleModal from '../components/crm/VehicleModal';
import crmService from '../services/crmService';

export default function VehicleManagementPage() {
    const [vehicles, setVehicles] = useState([]);
    const [filteredVehicles, setFilteredVehicles] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedVehicle, setSelectedVehicle] = useState(null);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, vehicleId: null });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchTerm, vehicles]);

    const loadData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [vehiclesData, customersData] = await Promise.all([
                crmService.getVehicles(),
                crmService.getCustomers()
            ]);
            // Extraer el array results si viene paginado
            setVehicles(vehiclesData.results || vehiclesData);
            setCustomers(customersData.results || customersData);
        } catch (err) {
            setError('Error al cargar datos');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!Array.isArray(vehicles)) {
            setFilteredVehicles([]);
            return;
        }

        let filtered = [...vehicles];

        // Aplicar búsqueda
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filtered = filtered.filter(vehicle =>
                vehicle.plate.toLowerCase().includes(search) ||
                vehicle.brand.toLowerCase().includes(search) ||
                vehicle.model.toLowerCase().includes(search) ||
                vehicle.customer_name.toLowerCase().includes(search)
            );
        }

        setFilteredVehicles(filtered);
    };

    const handleCreateVehicle = () => {
        setSelectedVehicle(null);
        setIsModalOpen(true);
    };

    const handleEditVehicle = (vehicle) => {
        setSelectedVehicle(vehicle);
        setIsModalOpen(true);
    };

    const handleDeleteVehicle = (id) => {
        setDeleteConfirm({ isOpen: true, vehicleId: id });
    };

    const confirmDelete = async () => {
        try {
            await crmService.deleteVehicle(deleteConfirm.vehicleId);
            await loadData();
            setDeleteConfirm({ isOpen: false, vehicleId: null });
        } catch (err) {
            alert('Error al eliminar vehículo');
            console.error('Error deleting vehicle:', err);
            setDeleteConfirm({ isOpen: false, vehicleId: null });
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
    };

    const handleModalSave = async () => {
        setIsModalOpen(false);
        setSelectedVehicle(null);
        await loadData();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Gestión de Vehículos</h1>
                <button
                    onClick={handleCreateVehicle}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={20} />
                    Nuevo Vehículo
                </button>
            </div>

            {/* Búsqueda */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por patente, marca, modelo o cliente..."
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

            {/* Tabla de Vehículos */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        <p className="mt-2 text-gray-600">Cargando vehículos...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Patente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vehículo
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kilometraje
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
                                {filteredVehicles.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                                            No se encontraron vehículos
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVehicles.map((vehicle) => (
                                        <tr key={vehicle.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-mono font-bold text-gray-900">
                                                    {vehicle.plate}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm">
                                                    <div className="font-medium text-gray-900">
                                                        {vehicle.year ? `${vehicle.year} ` : ''}{vehicle.brand}
                                                    </div>
                                                    <div className="text-gray-500">{vehicle.model}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <User size={16} />
                                                    {vehicle.customer_name}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2 text-sm text-gray-900">
                                                    <Gauge size={16} />
                                                    {vehicle.current_mileage.toLocaleString()} km
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    vehicle.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {vehicle.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleEditVehicle(vehicle)}
                                                    className="text-blue-600 hover:text-blue-900 mr-3"
                                                    title="Editar"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteVehicle(vehicle.id)}
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

            {/* Modal de Vehículo */}
            {isModalOpen && (
                <VehicleModal
                    vehicle={selectedVehicle}
                    customers={customers}
                    onClose={handleModalClose}
                    onSave={handleModalSave}
                />
            )}

            {/* Modal de Confirmación */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title="Eliminar Vehículo"
                message="¿Está seguro de que desea eliminar este vehículo? Esta acción no se puede deshacer."
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirm({ isOpen: false, vehicleId: null })}
                confirmText="Eliminar"
                cancelText="Cancelar"
                danger={true}
            />
        </div>
    );
}
