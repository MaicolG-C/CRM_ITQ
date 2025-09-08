/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: EmployeeWorkload.jsx
Descripción: Componente React para mostrar la carga de trabajo de los empleados.
Propósito: Visualizar información de cada empleado incluyendo su foto de perfil, nombre, cargo y porcentaje de progreso en tareas.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-icons/fa: Para iconos de avatar de usuario.
*/

import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const EmployeeWorkload = ({ employees }) => {
  // Función para obtener la URL correcta de la imagen de perfil
  const getImageUrl = (url) => {
    if (url && url.startsWith('/uploads')) {
      return `http://localhost:5000${url}`; // URL local del backend
    }
    return url || 'https://via.placeholder.com/150'; // Imagen de placeholder si no hay foto
  };

  return (
    <div className="bg-white p-6 shadow-md rounded-lg">
      {/* Título de la sección */}
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Carga de trabajo</h2>

      <div className="flex flex-wrap gap-6">
        {/* Verificamos si hay empleados para mostrar */}
        {employees.length > 0 ? (
          employees.map((employee) => (
            <div
              key={employee._id}
              className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              {/* Imagen de perfil o icono placeholder */}
              {employee.profileImageUrl ? (
                <img
                  src={getImageUrl(employee.profileImageUrl)}
                  alt={employee.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-red-500"
                />
              ) : (
                <FaUserCircle className="w-20 h-20 text-gray-400" />
              )}

              {/* Nombre y cargo del empleado */}
              <h3 className="mt-2 font-semibold text-gray-800">{employee.name}</h3>
              <p className="text-sm text-gray-500 capitalize">{employee.role.replace('_', ' ')}</p>

              {/* Indicador circular de progreso */}
              <div className="relative w-16 h-16 mt-2">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Círculo de fondo */}
                  <circle
                    className="text-gray-200"
                    strokeWidth="5"
                    stroke="currentColor"
                    fill="transparent"
                    r="25"
                    cx="32"
                    cy="32"
                  />
                  {/* Círculo de progreso */}
                  <circle
                    className="text-red-500"
                    strokeWidth="5"
                    strokeDasharray={25 * 2 * Math.PI}
                    strokeDashoffset={25 * 2 * Math.PI * (1 - employee.progress / 100)}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="25"
                    cx="32"
                    cy="32"
                  />
                </svg>

                {/* Porcentaje de progreso en el centro */}
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-gray-700">
                  {employee.progress}%
                </div>
              </div>
            </div>
          ))
        ) : (
          // Mensaje si no hay empleados
          <p className="text-gray-500">No hay empleados para mostrar.</p>
        )}
      </div>
    </div>
  );
};

// Exportamos el componente para usarlo en otros módulos
export default EmployeeWorkload;
