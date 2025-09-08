/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: EmployeeActivityView.jsx
Descripción: Componentes para visualizar la actividad y progreso de los empleados. Incluye tarjetas de empleados con progreso de tareas y estadísticas de pendientes, en progreso y completadas.
Propósito: Permitir al usuario del dashboard ver de manera visual el desempeño y estado de las tareas asignadas a cada empleado.
Dependencias:
    - react: Biblioteca principal para crear componentes y manejar estado.
    - react-icons/fa: Iconos de FontAwesome para mostrar avatar por defecto.
    - TailwindCSS: Clases para estilos y layout responsivo.
*/

import React from 'react'; // React para componentes funcionales
import { FaUserCircle } from 'react-icons/fa'; // Icono de usuario por defecto

// Componente para mostrar un círculo de progreso
const CircleProgress = ({ completed, total }) => {
    if (total === 0) {
        // Si no hay tareas, mostrar icono genérico
        return (
            <div className="relative w-16 h-16 flex items-center justify-center">
                <FaUserCircle className="text-gray-300 w-full h-full" />
            </div>
        );
    }

    // Cálculo de progreso
    const progress = (completed / total) * 100;
    const radius = 25;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
        <div className="relative w-16 h-16">
            <svg className="w-full h-full transform -rotate-90">
                {/* Círculo de fondo */}
                <circle
                    className="text-gray-300"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                />
                {/* Círculo de progreso */}
                <circle
                    className="text-red-500 transition-all duration-500"
                    strokeWidth="6"
                    stroke="currentColor"
                    fill="transparent"
                    r={radius}
                    cx="50%"
                    cy="50%"
                    strokeLinecap="round"
                    style={{
                        strokeDasharray: circumference,
                        strokeDashoffset: strokeDashoffset,
                    }}
                />
            </svg>
            {/* Texto del porcentaje */}
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-800">
                {Math.round(progress)}%
            </span>
        </div>
    );
};

// Componente de tarjeta de empleado
const EmployeeCard = ({ employee, tasks }) => {
    // Contar tareas por estado
    const completedTasks = tasks.filter(task => task.status === 'Completada').length;
    const inProgressTasks = tasks.filter(task => task.status === 'En Progreso').length;
    const pendingTasks = tasks.filter(task => task.status === 'Pendiente').length;
    const totalTasks = tasks.length;

    return (
        <div className="bg-white rounded-lg shadow-md p-6 text-center transition-transform hover:scale-105 transform hover:z-10">
            {/* Imagen de perfil */}
            <div className="flex justify-center mb-4">
                {employee.profileImageUrl ? (
                    <img
                        src={`http://localhost:5000${employee.profileImageUrl}`}
                        alt={employee.name}
                        className="w-24 h-24 rounded-full object-cover border-2 border-red-500"
                    />
                ) : (
                    <FaUserCircle className="w-24 h-24 text-gray-400" />
                )}
            </div>

            {/* Nombre y rol */}
            <h3 className="text-xl font-bold text-gray-800">{employee.name}</h3>
            <p className="text-sm text-gray-500 mb-4">{employee.role}</p>

            {/* Círculo de progreso */}
            <div className="flex justify-around items-center mb-4">
                <CircleProgress completed={completedTasks} total={totalTasks} />
            </div>

            {/* Estadísticas de tareas */}
            <div className="grid grid-cols-3 gap-2 text-center text-sm font-semibold mt-4">
                <div className="bg-red-100 rounded-lg p-2">
                    <p className="text-xl font-bold text-red-600">{pendingTasks}</p>
                    <p className="text-xs text-red-500">Pendientes</p>
                </div>
                <div className="bg-blue-100 rounded-lg p-2">
                    <p className="text-xl font-bold text-blue-600">{inProgressTasks}</p>
                    <p className="text-xs text-blue-500">En Progreso</p>
                </div>
                <div className="bg-green-100 rounded-lg p-2">
                    <p className="text-xl font-bold text-green-600">{completedTasks}</p>
                    <p className="text-xs text-green-500">Completadas</p>
                </div>
            </div>
        </div>
    );
};

// Componente principal que muestra la actividad de los empleados
const EmployeeActivityView = ({ employees, tasks }) => {
    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-inner min-h-screen">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Actividad de Empleados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {employees.length > 0 ? (
                    employees.map(employee => (
                        <EmployeeCard
                            key={employee._id}
                            employee={employee}
                            tasks={tasks.filter(task => task.assignedTo?._id === employee._id)}
                        />
                    ))
                ) : (
                    <p className="col-span-full text-center text-gray-500">No hay empleados registrados.</p>
                )}
            </div>
        </div>
    );
};

// Exportamos el componente
export default EmployeeActivityView;
