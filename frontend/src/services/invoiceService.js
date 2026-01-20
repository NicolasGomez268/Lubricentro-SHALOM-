import api from './api';

// Obtener todas las facturas
export const getInvoices = (params = {}) => {
  return api.get('/services/invoices/', { params });
};

// Obtener una factura por ID
export const getInvoice = (id) => {
  return api.get(`/services/invoices/${id}/`);
};

// Crear una nueva factura
export const createInvoice = (data) => {
  return api.post('/services/invoices/', data);
};

// Actualizar una factura
export const updateInvoice = (id, data) => {
  return api.put(`/services/invoices/${id}/`, data);
};

// Eliminar una factura
export const deleteInvoice = (id) => {
  return api.delete(`/services/invoices/${id}/`);
};

// Marcar factura como pagada
export const markInvoiceAsPaid = (id) => {
  return api.post(`/services/invoices/${id}/mark_as_paid/`);
};

// Anular factura
export const cancelInvoice = (id) => {
  return api.post(`/services/invoices/${id}/cancel/`);
};

// Obtener estadísticas de facturación
export const getInvoiceStatistics = () => {
  return api.get('/services/invoices/statistics/');
};
