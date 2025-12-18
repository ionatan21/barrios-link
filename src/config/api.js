// Configuración de la API
// En desarrollo usa localhost:3000
// En producción usa el backend de Vercel

const API_URL = import.meta.env.VITE_API_URL || 'https://barrios-link-backend.vercel.app';

export const API_ENDPOINTS = {
  createUrl: `${API_URL}/api/create`,
  getUrl: (slug) => `${API_URL}/${slug}`
};

export default API_URL;
