import { Calendar, Car, Gauge, Mail, MapPin, Phone, Search, User } from 'lucide-react';
import { useState } from 'react';
import crmService from '../services/crmService';

export default function VehicleSearchPage() {
    const [plate, setPlate] = useState('');
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        
        if (!plate.trim()) {
            setError('Ingrese una patente para buscar');
            return;
        }

        setLoading(true);
        setError(null);
        setVehicle(null);

        try {
            const data = await crmService.searchVehicleByPlate(plate);
            setVehicle(data);
        } catch (err) {
            if (err.response?.status === 404) {
                setError('No se encontró ningún vehículo con esa patente');
            } else {
                setError('Error al buscar el vehículo');
            }
            console.error('Error searching vehicle:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setPlate('');
        setVehicle(null);
        setError(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Búsqueda de Vehículos</h1>
                <p className="text-gray-600 mt-1">Ingrese la patente para ver la información del vehículo y cliente</p>
            </div>

            {/* Formulario de Búsqueda */}
            <div className="bg-white p-6 rounded-lg shadow">
                <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            value={plate}
                            onChange={(e) => setPlate(e.target.value.toUpperCase())}
                            placeholder="Ingrese patente (ej: ABC123 o AB123CD)"
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-lg uppercase"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? 'Buscando...' : 'Buscar'}
                    </button>
                    {(vehicle || error) && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Limpiar
                        </button>
                    )}
                </form>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <span>{error}</span>
                </div>
            )}

            {/* Resultados */}
            {vehicle && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Información del Vehículo */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Car className="text-blue-600" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Información del Vehículo</h2>
                                <p className="text-sm text-gray-600">Detalles técnicos y características</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Patente</label>
                                <p className="text-lg font-mono font-bold text-gray-900">{vehicle.plate}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Marca</label>
                                    <p className="text-lg font-semibold text-gray-900">{vehicle.brand}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Modelo</label>
                                    <p className="text-lg font-semibold text-gray-900">{vehicle.model}</p>
                                </div>
                            </div>

                            {vehicle.year && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <Calendar size={16} />
                                            Año
                                        </label>
                                        <p className="text-lg text-gray-900">{vehicle.year}</p>
                                    </div>
                                    {vehicle.color && (
                                        <div>
                                            <label className="text-sm font-medium text-gray-500">Color</label>
                                            <p className="text-lg text-gray-900">{vehicle.color}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {vehicle.engine_type && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Tipo de Motor</label>
                                    <p className="text-lg text-gray-900">{vehicle.engine_type}</p>
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                    <Gauge size={16} />
                                    Kilometraje Actual
                                </label>
                                <p className="text-2xl font-bold text-blue-600">
                                    {vehicle.current_mileage.toLocaleString()} km
                                </p>
                            </div>

                            {vehicle.vin && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">VIN / Nº Chasis</label>
                                    <p className="text-sm font-mono text-gray-900">{vehicle.vin}</p>
                                </div>
                            )}

                            {vehicle.notes && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Observaciones</label>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{vehicle.notes}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Información del Cliente */}
                    {vehicle.customer_data && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <User className="text-green-600" size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Información del Cliente</h2>
                                    <p className="text-sm text-gray-600">Datos de contacto</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {vehicle.customer_data.full_name}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        <Phone size={16} />
                                        Teléfono
                                    </label>
                                    <p className="text-lg text-gray-900">{vehicle.customer_data.phone}</p>
                                </div>

                                {vehicle.customer_data.email && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <Mail size={16} />
                                            Email
                                        </label>
                                        <p className="text-lg text-gray-900">{vehicle.customer_data.email}</p>
                                    </div>
                                )}

                                {vehicle.customer_data.city && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                            <MapPin size={16} />
                                            Ciudad
                                        </label>
                                        <p className="text-lg text-gray-900">{vehicle.customer_data.city}</p>
                                    </div>
                                )}

                                <div className="pt-4 border-t">
                                    <label className="text-sm font-medium text-gray-500">Total de Vehículos</label>
                                    <p className="text-lg font-semibold text-gray-900">
                                        {vehicle.customer_data.vehicles_count} vehículo(s)
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Estado inicial */}
            {!vehicle && !error && !loading && (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <Car className="mx-auto text-gray-400 mb-4" size={64} />
                    <p className="text-gray-500 text-lg">
                        Ingrese una patente en el buscador para ver la información del vehículo
                    </p>
                </div>
            )}
        </div>
    );
}
