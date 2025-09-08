/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: ActivityFeed.jsx
Descripción: Componente React para mostrar un flujo de actividades de usuarios en la aplicación.
Propósito: Visualizar acciones recientes de los usuarios con su foto de perfil, descripción y tiempo transcurrido desde la acción.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - moment: Para formatear fechas y mostrar "hace X minutos".
    - moment/locale/es: Configura moment para mostrar fechas en español.
*/

import React from 'react';
import moment from 'moment';
import 'moment/locale/es'; // Configuración de idioma español

const ActivityFeed = ({ activities }) => {
    // Configuramos moment a español
    moment.locale('es');

    // Función para obtener la URL correcta de la imagen de perfil
    const getImageUrl = (url) => {
        if (url && url.startsWith('http')) {
            return url; // URL completa externa
        }
        if (url && url.startsWith('/uploads')) {
            return `http://localhost:5000${url}`; // URL local del backend
        }
        // Imagen de placeholder genérica si no hay foto
        return 'https://i.imgur.com/V4RclNb.png'; 
    };

    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            {/* Título del flujo de actividad */}
            <h2 className="text-lg font-semibold mb-4">Flujo de actividad</h2>
            <ul>
                {/* Nos aseguramos de que 'activities' sea un array antes de mapear */}
                {Array.isArray(activities) && activities.map((activity) => (
                    <li key={activity._id} className="border-b last:border-0 py-2">
                        <div className="flex items-start space-x-2">
                            {/* Mostrar imagen de perfil o placeholder */}
                            {activity.user?.profileImageUrl ? (
                                <img
                                    src={getImageUrl(activity.user.profileImageUrl)}
                                    alt={activity.user.name}
                                    className="h-8 w-8 rounded-full object-cover"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-sm text-gray-600">
                                    {activity.user?.name ? activity.user.name.charAt(0).toUpperCase() : '?'}
                                </div>
                            )}
                            <div>
                                {/* Descripción de la actividad */}
                                <p className="text-sm text-gray-700">
                                    <span className="font-semibold">{activity.user?.name || 'Usuario desconocido'}</span> {activity.description}
                                </p>
                                {/* Tiempo desde que ocurrió la actividad */}
                                <span className="text-xs text-gray-400">
                                    {moment(activity.timestamp).fromNow()}
                                </span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Exportamos el componente para usarlo en otros módulos
export default ActivityFeed;
