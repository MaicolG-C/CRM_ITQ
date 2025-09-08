/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: EventCard.jsx
Descripción: Componente React para mostrar una lista de eventos.
Propósito: Visualizar eventos con su título y hora de realización de manera clara y estructurada.
Dependencias:
    - react: Biblioteca principal para crear componentes.
*/

import React from 'react';

const EventCard = ({ events }) => {
    return (
        <div className="bg-white p-4 shadow-md rounded-lg">
            {/* Título de la sección */}
            <h2 className="text-lg font-semibold mb-4">Eventos</h2>

            {/* Lista de eventos */}
            <ul>
                {events.map((event, index) => (
                    <li key={index} className="border-b last:border-0 py-2">
                        {/* Título del evento */}
                        <h3 className="font-medium text-gray-800">{event.title}</h3>
                        {/* Hora del evento */}
                        <p className="text-sm text-gray-500">{event.time}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

// Exportamos el componente para usarlo en otros módulos
export default EventCard;
