// Configuracion de la API
// En produccion, las funciones serverless viven en el mismo dominio.

const API_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const APP_URL = (
  import.meta.env.VITE_APP_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'https://b-lnk.vercel.app')
).replace(/\/$/, '');

export const API_ENDPOINTS = {
  createUrl: `${API_URL}/api/create`,
  getUrl: (slug) => `${API_URL}/api/${slug}`,
  getUsage: `${API_URL}/api/usage`,
};

export { APP_URL };
export default API_URL;
