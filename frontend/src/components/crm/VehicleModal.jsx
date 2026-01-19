import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import crmService from '../../services/crmService';

export default function VehicleModal({ vehicle, customers, onClose, onSave }) {
    const [formData, setFormData] = useState({
        plate: '',
        brand: '',
        model: '',
        year: '',
        color: '',
        engine_type: '',
        vin: '',
        current_mileage: 0,
        customer: '',
        notes: '',
        is_active: true
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (vehicle) {
            setFormData({
                plate: vehicle.plate || '',
                brand: vehicle.brand || '',
                model: vehicle.model || '',
                year: vehicle.year || '',
                color: vehicle.color || '',
                engine_type: vehicle.engine_type || '',
                vin: vehicle.vin || '',
                current_mileage: vehicle.current_mileage || 0,
                customer: vehicle.customer || '',
                notes: vehicle.notes || '',
                is_active: vehicle.is_active ?? true
            });
        }
    }, [vehicle]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.plate.trim()) {
            newErrors.plate = 'La patente es requerida';
        } else if (!/^[A-Z]{2,3}\d{3}[A-Z]{0,2}$/.test(formData.plate.toUpperCase().replace(/\s/g, ''))) {
            newErrors.plate = 'Formato inválido (ej: ABC123 o AB123CD)';
        }

        if (!formData.brand.trim()) {
            newErrors.brand = 'La marca es requerida';
        }

        if (!formData.model.trim()) {
            newErrors.model = 'El modelo es requerido';
        }

        if (!formData.customer) {
            newErrors.customer = 'Debe seleccionar un cliente';
        }

        if (formData.year && (formData.year < 1950 || formData.year > new Date().getFullYear() + 1)) {
            newErrors.year = `El año debe estar entre 1950 y ${new Date().getFullYear() + 1}`;
        }

        if (formData.current_mileage < 0) {
            newErrors.current_mileage = 'El kilometraje no puede ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Limpiar error del campo
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const dataToSend = {
                ...formData,
                plate: formData.plate.toUpperCase().replace(/\s/g, ''),
                year: formData.year || null,
                current_mileage: parseInt(formData.current_mileage) || 0
            };

            if (vehicle) {
                await crmService.updateVehicle(vehicle.id, dataToSend);
            } else {
                await crmService.createVehicle(dataToSend);
            }
            onSave();
        } catch (err) {
            console.error('Error saving vehicle:', err);
            if (err.response?.data) {
                setErrors(err.response.data);
            } else {
                alert('Error al guardar el vehículo');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        {vehicle ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Cliente */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Cliente <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="customer"
                                value={formData.customer}
                                onChange={handleChange}
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.customer ? 'border-red-500' : 'border-gray-300'
                                }`}
                            >
                                <option value="">Seleccione un cliente</option>
                                {Array.isArray(customers) && customers.map(customer => (
                                    <option key={customer.id} value={customer.id}>
                                        {customer.full_name}
                                    </option>
                                ))}
                            </select>
                            {errors.customer && (
                                <p className="mt-1 text-sm text-red-500">{errors.customer}</p>
                            )}
                        </div>

                        {/* Patente y Marca */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Patente <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="plate"
                                    value={formData.plate}
                                    onChange={handleChange}
                                    placeholder="ABC123 o AB123CD"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono uppercase ${
                                        errors.plate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.plate && (
                                    <p className="mt-1 text-sm text-red-500">{errors.plate}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Marca <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.brand ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.brand && (
                                    <p className="mt-1 text-sm text-red-500">{errors.brand}</p>
                                )}
                            </div>
                        </div>

                        {/* Modelo y Año */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Modelo <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="model"
                                    value={formData.model}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.model ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.model && (
                                    <p className="mt-1 text-sm text-red-500">{errors.model}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Año
                                </label>
                                <input
                                    type="number"
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    min="1950"
                                    max={new Date().getFullYear() + 1}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.year ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.year && (
                                    <p className="mt-1 text-sm text-red-500">{errors.year}</p>
                                )}
                            </div>
                        </div>

                        {/* Color y Tipo de Motor */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Color
                                </label>
                                <input
                                    type="text"
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tipo de Motor
                                </label>
                                <input
                                    type="text"
                                    name="engine_type"
                                    value={formData.engine_type}
                                    onChange={handleChange}
                                    placeholder="Ej: 1.6 Nafta"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* VIN y Kilometraje */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    VIN / Nº Chasis
                                </label>
                                <input
                                    type="text"
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleChange}
                                    maxLength="17"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Kilometraje Actual
                                </label>
                                <input
                                    type="number"
                                    name="current_mileage"
                                    value={formData.current_mileage}
                                    onChange={handleChange}
                                    min="0"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.current_mileage ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.current_mileage && (
                                    <p className="mt-1 text-sm text-red-500">{errors.current_mileage}</p>
                                )}
                            </div>
                        </div>

                        {/* Notas */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notas
                            </label>
                            <textarea
                                name="notes"
                                value={formData.notes}
                                onChange={handleChange}
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Observaciones especiales del vehículo..."
                            />
                        </div>

                        {/* Estado */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-gray-900">
                                Vehículo activo
                            </label>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
