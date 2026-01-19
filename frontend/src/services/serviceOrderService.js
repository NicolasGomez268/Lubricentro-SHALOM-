import api from './api';

// Obtener todas las órdenes de servicio
export const getServiceOrders = (params = {}) => {
  return api.get('/services/orders/', { params });
};

// Obtener una orden de servicio por ID
export const getServiceOrder = (id) => {
  return api.get(`/services/orders/${id}/`);
};

// Crear una nueva orden de servicio
export const createServiceOrder = (data) => {
  return api.post('/services/orders/', data);
};

// Actualizar una orden de servicio
export const updateServiceOrder = (id, data) => {
  return api.put(`/services/orders/${id}/`, data);
};

// Eliminar una orden de servicio
export const deleteServiceOrder = (id) => {
  return api.delete(`/services/orders/${id}/`);
};

// Completar una orden (descuenta stock automáticamente)
export const completeServiceOrder = (id) => {
  return api.post(`/services/orders/${id}/complete/`);
};

// Cancelar una orden
export const cancelServiceOrder = (id) => {
  return api.post(`/services/orders/${id}/cancel/`);
};

// Obtener estadísticas de órdenes
export const getServiceStatistics = () => {
  return api.get('/services/orders/statistics/');
};

// Obtener historial de órdenes por vehículo
export const getVehicleOrderHistory = (vehicleId) => {
  return api.get(`/services/orders/by_vehicle/?vehicle_id=${vehicleId}`);
};

// Actualizar una orden pendiente (solo items y observaciones)
export const updatePendingOrder = (id, data) => {
  return api.patch(`/services/orders/${id}/`, data);
};
