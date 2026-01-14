import api from './api';

export const inventoryService = {
  // Productos
  getProducts: async (params = {}) => {
    const response = await api.get('/inventory/products/', { params });
    // Si la respuesta tiene paginación, devolver solo results
    return response.data.results || response.data;
  },

  getProduct: async (id) => {
    const response = await api.get(`/inventory/products/${id}/`);
    return response.data;
  },

  createProduct: async (data) => {
    const response = await api.post('/inventory/products/', data);
    return response.data;
  },

  updateProduct: async (id, data) => {
    const response = await api.patch(`/inventory/products/${id}/`, data);
    return response.data;
  },

  deleteProduct: async (id) => {
    await api.delete(`/inventory/products/${id}/`);
  },

  // Stock bajo
  getLowStockProducts: async () => {
    const response = await api.get('/inventory/products/low_stock/');
    return response.data.results || response.data;
  },

  // Categorías
  getCategories: async () => {
    const response = await api.get('/inventory/products/categories/');
    return response.data;
  },

  // Ajustar stock
  adjustStock: async (productId, data) => {
    const response = await api.post(`/inventory/products/${productId}/adjust_stock/`, data);
    return response.data;
  },

  // Movimientos
  getStockMovements: async (params = {}) => {
    const response = await api.get('/inventory/movements/', { params });
    return response.data.results || response.data;
  },
};
