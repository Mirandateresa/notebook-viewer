// src/config.js
// Configuración de la aplicación

const config = {
  // URL de la API backend
  // En desarrollo: http://localhost:8000
  // En producción: https://notebook-backend-s70c.onrender.com
  API_URL: process.env.REACT_APP_API_URL || "http://localhost:8000"
};

// Exportar la configuración
export default config;
