/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: TasksCalendarView.jsx
Descripción: Componente de calendario de tareas/eventos.
Propósito:
    - Mostrar eventos y tareas en un calendario interactivo.
    - Permitir añadir y editar eventos mediante un modal.
Dependencias:
    - react-big-calendar: calendario interactivo.
    - date-fns: para manejo de fechas y localización.
    - EventModal: componente para crear/editar eventos.
    - api: instancia de axios para llamadas a la API.
    - react-icons/fa: iconos de interfaz.
*/

import React, { useState, useEffect } from "react";
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from "../api";
import EventModal from "./EventModal";
import { FaPlus } from 'react-icons/fa';

// Configuración regional en español
const locales = { 'es': es };

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
});

const TasksCalendarView = ({ tasks }) => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [employees, setEmployees] = useState([]);

    // Obtener eventos y empleados desde la API
    const fetchEventsAndEmployees = async () => {
        try {
            const eventsRes = await api.get("/events");
            const employeesRes = await api.get("/employees");
            
            setEmployees(employeesRes.data);
            
            const formattedEvents = eventsRes.data.map(event => ({
                id: event._id,
                title: event.title,
                start: new Date(event.date),
                end: new Date(event.date),
                resource: event // Guardar el objeto completo
            }));
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    };

    useEffect(() => {
        fetchEventsAndEmployees();
    }, []);

    // Maneja la selección de un evento
    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource);
        setIsModalOpen(true);
    };

    // Abrir modal para crear un evento
    const handleAddEventClick = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    // Guardar evento (nuevo o editado)
    const handleSaveEvent = async (eventData) => {
        try {
            if (eventData._id) {
                await api.put(`/events/${eventData._id}`, {
                    ...eventData,
                    date: eventData.date,
                    assignedTo: eventData.assignedTo ? eventData.assignedTo._id : null
                });
            } else {
                await api.post("/events", {
                    ...eventData,
                    date: eventData.date,
                    assignedTo: eventData.assignedTo ? eventData.assignedTo._id : null
                });
            }
            fetchEventsAndEmployees();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error al guardar el evento:", error);
        }
    };

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-red-600">Calendario de Eventos</h3>
                <button
                    onClick={handleAddEventClick}
                    className="bg-red-600 text-white p-2 rounded-lg hover:bg-red-700 flex items-center"
                >
                    <FaPlus className="mr-2" /> Añadir Evento
                </button>
            </div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                messages={{
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
                onSelectEvent={handleSelectEvent}
            />

            <EventModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                initialData={selectedEvent}
                employees={employees}
            />
        </div>
    );
};

export default TasksCalendarView;
