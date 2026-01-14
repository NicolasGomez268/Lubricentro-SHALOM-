import api from './api';

export const authService = {
  // Login
  login: async (email, password) => {
    const response = await api.post('/auth/login/', { email, password });
    const { access, refresh, user } = response.data;
    
    // Guardar tokens y usuario en localStorage
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  // Logout
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  // Verificar autenticación
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check/');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Obtener usuario actual
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Verificar si hay token
  isAuthenticated: () => {
    return !!localStorage.getItem('access_token');
  },

  // Obtener perfil
  getProfile: async () => {
    const response = await api.get('/auth/profile/');
    return response.data;
  },

  // Actualizar perfil
  updateProfile: async (data) => {
    const response = await api.patch('/auth/profile/', data);
    const user = authService.getCurrentUser();
    if (user) {
      const updatedUser = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  },
};
