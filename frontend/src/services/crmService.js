import api from './api';

/**
 * Servicio para gestionar clientes y vehículos (CRM)
 */

// ==================== CLIENTES ====================

/**
 * Obtiene todos los clientes
 * @param {Object} params - Parámetros de búsqueda y filtros
 * @returns {Promise} Lista de clientes
 */
export const getCustomers = async (params = {}) => {
    const response = await api.get('/crm/customers/', { params });
    return response.data;
};

/**
 * Obtiene un cliente por ID
 * @param {number} id - ID del cliente
 * @returns {Promise} Datos del cliente
 */
export const getCustomer = async (id) => {
    const response = await api.get(`/crm/customers/${id}/`);
    return response.data;
};

/**
 * Crea un nuevo cliente
 * @param {Object} customerData - Datos del cliente
 * @returns {Promise} Cliente creado
 */
export const createCustomer = async (customerData) => {
    const response = await api.post('/crm/customers/', customerData);
    return response.data;
};

/**
 * Actualiza un cliente existente
 * @param {number} id - ID del cliente
 * @param {Object} customerData - Datos actualizados
 * @returns {Promise} Cliente actualizado
 */
export const updateCustomer = async (id, customerData) => {
    const response = await api.put(`/crm/customers/${id}/`, customerData);
    return response.data;
};

/**
 * Elimina un cliente
 * @param {number} id - ID del cliente
 * @returns {Promise}
 */
export const deleteCustomer = async (id) => {
    await api.delete(`/crm/customers/${id}/`);
};

/**
 * Obtiene los vehículos de un cliente
 * @param {number} customerId - ID del cliente
 * @returns {Promise} Lista de vehículos
 */
export const getCustomerVehicles = async (customerId) => {
    const response = await api.get(`/crm/customers/${customerId}/vehicles/`);
    return response.data;
};

/**
 * Obtiene estadísticas de clientes
 * @returns {Promise} Estadísticas
 */
export const getCustomerStatistics = async () => {
    const response = await api.get('/crm/customers/statistics/');
    return response.data;
};

// ==================== VEHÍCULOS ====================

/**
 * Obtiene todos los vehículos
 * @param {Object} params - Parámetros de búsqueda y filtros
 * @returns {Promise} Lista de vehículos
 */
export const getVehicles = async (params = {}) => {
    const response = await api.get('/crm/vehicles/', { params });
    return response.data;
};

/**
 * Obtiene un vehículo por ID
 * @param {number} id - ID del vehículo
 * @returns {Promise} Datos del vehículo
 */
export const getVehicle = async (id) => {
    const response = await api.get(`/crm/vehicles/${id}/`);
    return response.data;
};

/**
 * Busca un vehículo por patente
 * @param {string} plate - Patente del vehículo
 * @returns {Promise} Datos del vehículo
 */
export const searchVehicleByPlate = async (plate) => {
    const response = await api.get('/crm/vehicles/search_by_plate/', {
        params: { plate }
    });
    return response.data;
};

/**
 * Crea un nuevo vehículo
 * @param {Object} vehicleData - Datos del vehículo
 * @returns {Promise} Vehículo creado
 */
export const createVehicle = async (vehicleData) => {
    const response = await api.post('/crm/vehicles/', vehicleData);
    return response.data;
};

/**
 * Actualiza un vehículo existente
 * @param {number} id - ID del vehículo
 * @param {Object} vehicleData - Datos actualizados
 * @returns {Promise} Vehículo actualizado
 */
export const updateVehicle = async (id, vehicleData) => {
    const response = await api.put(`/crm/vehicles/${id}/`, vehicleData);
    return response.data;
};

/**
 * Actualiza solo el kilometraje de un vehículo
 * @param {number} id - ID del vehículo
 * @param {number} mileage - Nuevo kilometraje
 * @returns {Promise} Vehículo actualizado
 */
export const updateVehicleMileage = async (id, mileage) => {
    const response = await api.patch(`/crm/vehicles/${id}/update_mileage/`, {
        current_mileage: mileage
    });
    return response.data;
};

/**
 * Elimina un vehículo
 * @param {number} id - ID del vehículo
 * @returns {Promise}
 */
export const deleteVehicle = async (id) => {
    await api.delete(`/crm/vehicles/${id}/`);
};

export default {
    // Clientes
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerVehicles,
    getCustomerStatistics,
    
    // Vehículos
    getVehicles,
    getVehicle,
    searchVehicleByPlate,
    createVehicle,
    updateVehicle,
    updateVehicleMileage,
    deleteVehicle,
};
