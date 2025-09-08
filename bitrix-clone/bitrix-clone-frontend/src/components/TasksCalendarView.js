/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: TasksCalendarView.jsx
Descripción: Componente encargado de mostrar las tareas en una vista de calendario interactivo.
Propósito: Permitir al usuario visualizar las tareas según su fecha límite en un calendario, y abrir detalles de una tarea al hacer clic sobre ella.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-big-calendar: Librería para mostrar calendarios interactivos.
    - date-fns: Librería para manejo de fechas (format, parse, startOfWeek, getDay, locales).
Props:
    - tasks: Lista de tareas con al menos el campo `title` y `dueDate`.
    - handleOpenDetailsModal: Función para abrir el modal de detalles de la tarea seleccionada.
*/

import React from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'; // Componentes y localizador para el calendario
import format from 'date-fns/format'; // Formateo de fechas
import parse from 'date-fns/parse'; // Parseo de fechas desde string
import startOfWeek from 'date-fns/startOfWeek'; // Obtener el primer día de la semana
import getDay from 'date-fns/getDay'; // Obtener el día de la semana
import 'react-big-calendar/lib/css/react-big-calendar.css'; // Estilos por defecto del calendario
import { enUS } from 'date-fns/locale'; // Localización en inglés (puede ajustarse)


// Configuración de locales para el calendario
const locales = {
  'en-US': enUS,
};

// Configuración del localizador para react-big-calendar usando date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TasksCalendarView = ({ tasks, handleOpenDetailsModal }) => {
  // Transformar las tareas en eventos del calendario
  const events = tasks
    .filter(task => task.dueDate) // Solo considerar tareas con fecha límite
    .map(task => ({
      title: task.title, // Título que se mostrará en el evento
      start: new Date(task.dueDate), // Fecha de inicio del evento
      end: new Date(task.dueDate),   // Fecha de fin del evento (igual que inicio)
      resource: task                 // Guardamos la tarea completa como recurso
    }));

  // Función que se ejecuta al seleccionar un evento del calendario
  const handleSelectEvent = (event) => {
    handleOpenDetailsModal(event.resource); // Abrir modal con los datos completos de la tarea
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Calendar
        localizer={localizer} // Localización y manejo de fechas
        events={events}       // Eventos a mostrar
        startAccessor="start" // Campo de inicio
        endAccessor="end"     // Campo de fin
        style={{ height: 600 }} // Altura del calendario
        messages={{ // Traducción de botones y textos
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Agenda",
          date: "Fecha",
          time: "Hora",
          event: "Evento",
          allDay: "Todo el día",
        }}
        onSelectEvent={handleSelectEvent} // Acción al seleccionar un evento
      />
    </div>
  );
};

export default TasksCalendarView;
