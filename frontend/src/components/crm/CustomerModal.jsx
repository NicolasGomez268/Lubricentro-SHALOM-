import { Car, Plus, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import crmService from '../../services/crmService';

export default function CustomerModal({ customer, onClose, onSave }) {
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        address: '',
        city: '',
        notes: '',
        is_active: true
    });

    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [vehicles, setVehicles] = useState([]);
    const [newVehicle, setNewVehicle] = useState({
        plate: '',
        brand: '',
        model: '',
        year: '',
        color: ''
    });
    const [showVehicleForm, setShowVehicleForm] = useState(false);
    const [vehicleErrors, setVehicleErrors] = useState({});

    useEffect(() => {
        if (customer) {
            setFormData({
                first_name: customer.first_name || '',
                last_name: customer.last_name || '',
                phone: customer.phone || '',
                email: customer.email || '',
                address: customer.address || '',
                city: customer.city || '',
                notes: customer.notes || '',
                is_active: customer.is_active ?? true
            });
            // Cargar vehículos del cliente
            if (customer.vehicles) {
                setVehicles(customer.vehicles);
            }
        }
    }, [customer]);

    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name.trim()) {
            newErrors.first_name = 'El nombre es requerido';
        }

        if (!formData.last_name.trim()) {
            newErrors.last_name = 'El apellido es requerido';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = 'El teléfono es requerido';
        } else if (!/^\+?1?\d{9,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
            newErrors.phone = 'Formato de teléfono inválido';
        }

        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Email inválido';
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

    const handleVehicleChange = (e) => {
        const { name, value } = e.target;
        
        // Si es la patente, convertir a mayúsculas automáticamente
        const newValue = name === 'plate' ? value.toUpperCase() : value;
        
        setNewVehicle(prev => ({ ...prev, [name]: newValue }));
        
        // Limpiar error del campo
        if (vehicleErrors[name]) {
            setVehicleErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validateVehicle = () => {
        const errors = {};
        
        // Validar patente
        if (!newVehicle.plate.trim()) {
            errors.plate = 'La patente es requerida';
        } else {
            // Normalizar patente
            const normalizedPlate = newVehicle.plate.toUpperCase().replace(/\s/g, '');
            
            // Validar formato (2-3 letras + 3 números + 0-2 letras)
            const plateRegex = /^[A-Z]{2,3}\d{3}[A-Z]{0,2}$/;
            if (!plateRegex.test(normalizedPlate)) {
                errors.plate = 'Formato inválido. Use: ABC123 o AB123CD';
            } else {
                // Verificar si la patente ya existe en la lista de vehículos
                const duplicateInList = vehicles.some(v => 
                    v.plate.toUpperCase().replace(/\s/g, '') === normalizedPlate
                );
                if (duplicateInList) {
                    errors.plate = 'Esta patente ya fue agregada';
                }
            }
        }
        
        // Validar marca
        if (!newVehicle.brand.trim()) {
            errors.brand = 'La marca es requerida';
        }
        
        // Validar modelo
        if (!newVehicle.model.trim()) {
            errors.model = 'El modelo es requerido';
        }
        
        // Validar año si se ingresó
        if (newVehicle.year) {
            const year = parseInt(newVehicle.year);
            const currentYear = new Date().getFullYear();
            if (isNaN(year)) {
                errors.year = 'El año debe ser un número';
            } else if (year < 1950 || year > currentYear + 1) {
                errors.year = `El año debe estar entre 1950 y ${currentYear + 1}`;
            }
        }
        
        setVehicleErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleAddVehicle = () => {
        if (!validateVehicle()) return;
        
        // Normalizar la patente antes de agregar
        const normalizedVehicle = {
            ...newVehicle,
            plate: newVehicle.plate.toUpperCase().replace(/\s/g, ''),
            id: Date.now(),
            isNew: true
        };
        
        setVehicles(prev => [...prev, normalizedVehicle]);
        setNewVehicle({ plate: '', brand: '', model: '', year: '', color: '' });
        setShowVehicleForm(false);
        setVehicleErrors({});
    };

    const handleRemoveVehicle = (vehicleId) => {
        setVehicles(prev => prev.filter(v => v.id !== vehicleId));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            let savedCustomer;
            console.log('Guardando cliente...', formData);
            
            if (customer) {
                savedCustomer = await crmService.updateCustomer(customer.id, formData);
                console.log('Cliente actualizado:', savedCustomer);
            } else {
                savedCustomer = await crmService.createCustomer(formData);
                console.log('Cliente creado:', savedCustomer);
            }

            // Guardar vehículos nuevos (los que tienen el flag isNew)
            const newVehicles = vehicles.filter(v => v.isNew);
            console.log('Vehículos a crear:', newVehicles);
            
            for (const vehicle of newVehicles) {
                const vehicleData = {
                    plate: vehicle.plate.toUpperCase().replace(/\s/g, ''),
                    brand: vehicle.brand,
                    model: vehicle.model,
                    year: vehicle.year ? parseInt(vehicle.year) : null,
                    color: vehicle.color || '',
                    customer: savedCustomer.id,
                    current_mileage: 0,
                    engine_type: '',
                    vin: null,  // null en lugar de '' porque tiene restricción UNIQUE
                    notes: '',
                    is_active: true
                };
                console.log('Creando vehículo:', vehicleData);
                try {
                    const createdVehicle = await crmService.createVehicle(vehicleData);
                    console.log('Vehículo creado:', createdVehicle);
                } catch (vehicleErr) {
                    console.error('Error creando vehículo:', vehicleErr);
                    console.error('Response status:', vehicleErr.response?.status);
                    console.error('Response data:', vehicleErr.response?.data);
                    
                    let errorMsg = `Error al crear vehículo ${vehicle.plate}`;
                    
                    // Si hay respuesta del servidor
                    if (vehicleErr.response?.data) {
                        const errorData = vehicleErr.response.data;
                        
                        // Si es un objeto con errores de validación
                        if (typeof errorData === 'object' && !JSON.stringify(errorData).includes('DOCTYPE')) {
                            // Verificar si es error de patente duplicada
                            if (errorData.plate && Array.isArray(errorData.plate)) {
                                const plateErrors = errorData.plate.join(' ');
                                if (plateErrors.toLowerCase().includes('unique') || 
                                    plateErrors.toLowerCase().includes('already exists') ||
                                    plateErrors.toLowerCase().includes('ya existe')) {
                                    errorMsg = `La patente ${vehicle.plate} ya está registrada en el sistema`;
                                } else {
                                    errorMsg = `Patente ${vehicle.plate}: ${plateErrors}`;
                                }
                            } else {
                                // Otros errores de validación
                                const errorMessages = Object.entries(errorData)
                                    .map(([key, val]) => {
                                        const message = Array.isArray(val) ? val.join(', ') : val;
                                        return `${key}: ${message}`;
                                    })
                                    .join('\n');
                                errorMsg += ':\n' + errorMessages;
                            }
                        } else {
                            // Si es HTML o texto plano, mostrar mensaje genérico
                            errorMsg += '. Error del servidor. Verifique que todos los campos sean válidos.';
                        }
                    } else {
                        errorMsg += ': ' + vehicleErr.message;
                    }
                    
                    throw new Error(errorMsg);
                }
            }

            // Esperar un momento antes de cerrar para asegurar que el backend procese
            await new Promise(resolve => setTimeout(resolve, 300));
            onSave();
        } catch (err) {
            console.error('Error saving customer:', err);
            
            // Determinar el mensaje de error a mostrar
            let errorMessage = 'Error al guardar';
            
            if (err.message && !err.message.includes('Request failed')) {
                // Si es un error personalizado (como el de vehículos)
                errorMessage = err.message;
            } else if (err.response?.data) {
                // Si hay respuesta del servidor con datos de error
                const errorData = err.response.data;
                
                if (typeof errorData === 'object' && !JSON.stringify(errorData).includes('DOCTYPE')) {
                    // Errores de validación del backend
                    const errorMessages = Object.entries(errorData)
                        .map(([key, val]) => {
                            const message = Array.isArray(val) ? val.join(', ') : val;
                            return `${key}: ${message}`;
                        })
                        .join('\n');
                    errorMessage += ':\n' + errorMessages;
                    setErrors(errorData);
                } else {
                    // HTML o error genérico del servidor
                    errorMessage += '. Error del servidor. Verifique los datos ingresados.';
                }
            }
            
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b">
                    <h2 className="text-xl font-bold text-gray-900">
                        {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
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
                        {/* Información Personal */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.first_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.first_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.first_name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Apellido <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.last_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.last_name && (
                                    <p className="mt-1 text-sm text-red-500">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        {/* Contacto */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    placeholder="+54 9 11 1234-5678"
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.phone ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.phone && (
                                    <p className="mt-1 text-sm text-red-500">{errors.phone}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                        errors.email ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        {/* Dirección */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Dirección
                            </label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Ciudad
                            </label>
                            <input
                                type="text"
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
                            />
                        </div>

                        {/* Vehículos */}
                        <div className="border-t pt-4 mt-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Car size={20} />
                                    Vehículos
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowVehicleForm(!showVehicleForm)}
                                    className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    <Plus size={16} />
                                    Agregar Vehículo
                                </button>
                            </div>

                            {/* Lista de vehículos */}
                            {vehicles.length > 0 && (
                                <div className="space-y-2 mb-4">
                                    {vehicles.map((vehicle) => (
                                        <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <span className="font-semibold text-blue-600">{vehicle.plate}</span>
                                                    <span className="text-gray-700">{vehicle.brand} {vehicle.model}</span>
                                                    {vehicle.year && <span className="text-gray-500 text-sm">({vehicle.year})</span>}
                                                    {vehicle.color && <span className="text-gray-500 text-sm">- {vehicle.color}</span>}
                                                </div>
                                            </div>
                                            {vehicle.isNew && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveVehicle(vehicle.id)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Formulario para nuevo vehículo */}
                            {showVehicleForm && (
                                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Patente <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="plate"
                                                value={newVehicle.plate}
                                                onChange={handleVehicleChange}
                                                placeholder="ABC123"
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    vehicleErrors.plate ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {vehicleErrors.plate && (
                                                <p className="mt-1 text-sm text-red-500">{vehicleErrors.plate}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Marca <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="brand"
                                                value={newVehicle.brand}
                                                onChange={handleVehicleChange}
                                                placeholder="Toyota"
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    vehicleErrors.brand ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {vehicleErrors.brand && (
                                                <p className="mt-1 text-sm text-red-500">{vehicleErrors.brand}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Modelo <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                name="model"
                                                value={newVehicle.model}
                                                onChange={handleVehicleChange}
                                                placeholder="Corolla"
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    vehicleErrors.model ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {vehicleErrors.model && (
                                                <p className="mt-1 text-sm text-red-500">{vehicleErrors.model}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Año
                                            </label>
                                            <input
                                                type="number"
                                                name="year"
                                                value={newVehicle.year}
                                                onChange={handleVehicleChange}
                                                placeholder="2020"
                                                min="1950"
                                                max={new Date().getFullYear() + 1}
                                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                                    vehicleErrors.year ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            />
                                            {vehicleErrors.year && (
                                                <p className="mt-1 text-sm text-red-500">{vehicleErrors.year}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Color
                                            </label>
                                            <input
                                                type="text"
                                                name="color"
                                                value={newVehicle.color}
                                                onChange={handleVehicleChange}
                                                placeholder="Rojo"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowVehicleForm(false);
                                                setNewVehicle({ plate: '', brand: '', model: '', year: '', color: '' });
                                                setVehicleErrors({});
                                            }}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                        >
                                            Cancelar
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleAddVehicle}
                                            className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                                        >
                                            Agregar
                                        </button>
                                    </div>
                                </div>
                            )}
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
                                Cliente activo
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
