/*
Autores:
Michael Israel Guamán Caisaluisa

Archivo: api.js
Descripción: Configuración de instancia de Axios para realizar peticiones HTTP al backend.
Propósito: Centralizar la configuración de la API, incluyendo la URL base y el manejo automático del token de autorización.
Dependencias:
    - axios: Biblioteca para realizar solicitudes HTTP desde el frontend.
*/

import axios from 'axios'; // Importa Axios para manejar solicitudes HTTP

// Creación de una instancia de Axios con la URL base de la API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // URL base del backend
});

// Interceptor de solicitudes: se ejecuta antes de enviar cada petición
api.interceptors.request.use(
  (config) => {
    // Obtiene el token guardado en localStorage
    const token = localStorage.getItem('token');
    if (token) {
      // Si existe token, se agrega a los headers de autorización
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config; // Retorna la configuración modificada
  },
  (error) => {
    // Manejo de errores en la solicitud antes de enviarla
    return Promise.reject(error); // Rechaza la promesa con el error
  }
);

// Exporta la instancia de Axios para ser utilizada en toda la aplicación
export default api;
