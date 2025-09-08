/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Calendar.jsx
Descripción: Componente React que muestra un calendario interactivo con eventos y permite añadir, editar o eliminar eventos.
Propósito: Gestionar actividades, reuniones y eventos de los empleados, incluyendo asignación de participantes.
Dependencias:
    - react, useState, useEffect: Biblioteca principal y hooks de React.
    - react-big-calendar: Para mostrar un calendario con vista mensual, semanal o diaria.
    - date-fns: Para formatear fechas y usar localización en español.
    - react-modal: Para mostrar modales de creación/edición y confirmación de eliminación.
    - react-icons: Para iconos de botones (añadir, cerrar, eliminar).
    - api: Cliente Axios configurado para llamadas a backend.
*/

// -------------------- IMPORTS --------------------
import React, { useState, useEffect } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { es } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Modal from "react-modal";
import { FaPlus, FaTimes, FaTrash } from 'react-icons/fa';
import api from "../api";

// -------------------- CONFIGURACIONES --------------------
Modal.setAppElement("#root"); // Para accesibilidad

// Tipos de eventos predefinidos
const EVENT_TYPES = [
    "Reuniones de equipo", "Capacitaciones internas", "Cumpleaños del personal",
    "Proyectos asignados", "Entrega de informes", "Reuniones de comité de admisión",
    "Campaña publicitaria de admisión", "Seguimiento a posibles estudiantes",
    "Plazos de marketing", "Eventos externos de promoción",
];

// Localización y formateo de fechas
const locales = { 'es': es };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// -------------------- MODALES --------------------

// Modal para crear o editar eventos
const EventModal = ({ isOpen, onRequestClose, onSave, onDelete, initialData, employees }) => {
    const [formData, setFormData] = useState({
        title: "", description: "", date: "", eventType: "", participants: [],
    });

    // Cargar datos cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData({
                    _id: initialData._id,
                    title: initialData.title || "",
                    description: initialData.description || "",
                    eventType: initialData.eventType || "",
                    date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : "",
                    participants: initialData.participants ? initialData.participants.map(p => p._id) : [],
                });
            } else {
                setFormData({ title: "", description: "", date: "", eventType: "", participants: [] });
            }
        }
    }, [isOpen, initialData]);

    // Manejo de cambios de inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manejo de selección de participantes
    const handleParticipantsChange = (employeeId) => {
        setFormData(prev => {
            const newParticipants = prev.participants.includes(employeeId)
                ? prev.participants.filter(id => id !== employeeId)
                : [...prev.participants, employeeId];
            return { ...prev, participants: newParticipants };
        });
    };

    // Guardar evento
    const handleSubmit = async (e) => {
        e.preventDefault();
        await onSave(formData);
        onRequestClose();
    };
    
    const isEditMode = initialData && initialData._id;

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={isEditMode ? "Editar Evento" : "Añadir Evento"}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-70 z-40"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? "Editar Evento" : "Añadir Evento"}</h2>
                    <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800"><FaTimes size={24} /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-grow">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Título */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Título</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg"/>
                        </div>
                        {/* Descripción */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-lg" rows="3"></textarea>
                        </div>
                        {/* Tipo de Evento */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Tipo de Evento</label>
                            <select name="eventType" value={formData.eventType} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg">
                                <option value="">Selecciona un tipo</option>
                                {EVENT_TYPES.map(type => (<option key={type} value={type}>{type}</option>))}
                            </select>
                        </div>
                        {/* Fecha */}
                        <div className="mb-4">
                            <label className="block text-gray-700 font-semibold mb-2">Fecha</label>
                            <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full p-3 border border-gray-300 rounded-lg"/>
                        </div>
                        {/* Participantes */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">Participantes</label>
                            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg">
                                {employees.map((emp) => (
                                    <div key={emp._id} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            value={emp._id}
                                            checked={formData.participants.includes(emp._id)}
                                            onChange={() => handleParticipantsChange(emp._id)}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-gray-700 text-sm">{emp.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>
                {/* Botones */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200">
                    {isEditMode && (
                        <button type="button" onClick={() => onDelete(formData._id)} className="bg-red-500 text-white p-3 rounded-lg font-semibold hover:bg-red-600 flex items-center gap-2">
                            <FaTrash /> Eliminar
                        </button>
                    )}
                    <button type="button" onClick={onRequestClose} className="bg-gray-300 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-400">Cancelar</button>
                    <button type="button" onClick={handleSubmit} className="bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700">
                        {isEditMode ? "Guardar Cambios" : "Guardar Evento"}
                    </button>
                </div>
            </div>
        </Modal>
    );
};

// Modal de confirmación de eliminación
const DeleteConfirmModal = ({ isOpen, onRequestClose, onConfirm }) => (
    <Modal
        isOpen={isOpen}
        onRequestClose={onRequestClose}
        contentLabel="Confirmar Eliminación"
        className="fixed inset-0 flex items-center justify-center p-4 z-50"
        overlayClassName="fixed inset-0 bg-black bg-opacity-70 z-40"
    >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">¿Estás seguro?</h2>
            <p className="mb-6 text-gray-700 text-center">Esta acción eliminará el evento de forma permanente.</p>
            <div className="flex gap-4">
                <button onClick={onRequestClose} className="px-6 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Cancelar</button>
                <button onClick={onConfirm} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Eliminar</button>
            </div>
        </div>
    </Modal>
);

// -------------------- CALENDAR COMPONENT --------------------
const Calendar = ({ search = "", onDashboardUpdate }) => {
    const [events, setEvents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [employees, setEmployees] = useState([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Obtener eventos y empleados desde la API
    const fetchEventsAndEmployees = async () => {
        try {
            const [eventsRes, employeesRes] = await Promise.all([
                api.get("/events"),
                api.get("/employees")
            ]);
            
            setEmployees(employeesRes.data);
            
            const formattedEvents = eventsRes.data.map(event => {
                const eventDate = new Date(event.date);
                const userTimezoneOffset = eventDate.getTimezoneOffset() * 60000;
                const adjustedDate = new Date(eventDate.getTime() + userTimezoneOffset);

                return {
                    id: event._id,
                    title: event.title,
                    start: adjustedDate,
                    end: adjustedDate,
                    allDay: true,
                    resource: event,
                };
            });
            setEvents(formattedEvents);
        } catch (error) {
            console.error("Error al obtener los datos:", error);
        }
    };

    useEffect(() => { fetchEventsAndEmployees(); }, []);

    // Seleccionar evento para editar
    const handleSelectEvent = (event) => {
        setSelectedEvent(event.resource);
        setIsModalOpen(true);
    };

    // Abrir modal para nuevo evento
    const handleAddEventClick = () => {
        setSelectedEvent(null);
        setIsModalOpen(true);
    };

    // Guardar evento (nuevo o editado)
    const handleSaveEvent = async (eventData) => {
        try {
            if (eventData._id) {
                await api.put(`/events/${eventData._id}`, eventData);
            } else {
                await api.post("/events", eventData);
            }
            fetchEventsAndEmployees();
            setIsModalOpen(false);
            if (onDashboardUpdate) onDashboardUpdate();
        } catch (error) {
            console.error("Error al guardar el evento:", error);
        }
    };
    
    // Preparar eliminación de evento
    const handleDeleteEvent = async (id) => {
        setIsDeleteModalOpen(true);
        setSelectedEvent(events.find(ev => ev.id === id)?.resource || null);
    };

    // Confirmar eliminación
    const confirmDeleteEvent = async () => {
        try {
            if (selectedEvent && selectedEvent._id) {
                await api.delete(`/events/${selectedEvent._id}`);
                fetchEventsAndEmployees();
                setIsDeleteModalOpen(false);
                setIsModalOpen(false);
                setSelectedEvent(null);
                if (onDashboardUpdate) onDashboardUpdate();
            }
        } catch (error) {
            console.error("Error al eliminar el evento:", error);
        }
    };

    // Filtrar eventos según búsqueda
    const filteredEvents = events.filter(event => {
        const searchTerm = search.toLowerCase();
        const titleMatch = event.title.toLowerCase().includes(searchTerm);
        const descriptionMatch = event.resource?.description?.toLowerCase().includes(searchTerm) || false;
        return titleMatch || descriptionMatch;
    });

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-xl text-gray-800">Calendario de Eventos</h3>
                <button onClick={handleAddEventClick} className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 flex items-center">
                    <FaPlus className="mr-2" /> Añadir Evento
                </button>
            </div>
            
            <BigCalendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: 600 }}
                messages={{
                    next: "Siguiente", previous: "Anterior", today: "Hoy",
                    month: "Mes", week: "Semana", day: "Día", agenda: "Agenda",
                    date: "Fecha", time: "Hora", event: "Evento", allDay: "Todo el día",
                }}
                onSelectEvent={handleSelectEvent}
            />

            <EventModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                initialData={selectedEvent}
                employees={employees}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onRequestClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteEvent}
            />
        </div>
    );
};

export default Calendar;
