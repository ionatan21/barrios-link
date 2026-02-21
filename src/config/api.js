// Configuración de la API
// En desarrollo usa localhost:3000
// En producción usa el backend de Vercel

const API_URL = import.meta.env.VITE_API_URL || 'https://barrios-link-backend.vercel.app';
const APP_URL = import.meta.env.VITE_APP_URL || 'https://ba-lnk.vercel.app/';

export const API_ENDPOINTS = {
  createUrl: `${API_URL}/api/create`,
  getUrl: (slug) => `${API_URL}/api/${slug}`,
  getUsage: `${API_URL}/api/usage`
};

export { APP_URL };
export default API_URL;
