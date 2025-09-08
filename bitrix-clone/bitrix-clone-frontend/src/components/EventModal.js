/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: EventModal.jsx
Descripción: Componente React para agregar o editar eventos mediante un modal.
Propósito: Permitir la gestión de eventos incluyendo título, descripción, fecha, tipo de evento y participantes.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-modal: Para mostrar modales accesibles.
    - react-icons/fa: Para iconos, en este caso el de cerrar modal.
*/

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";

// Configuramos el elemento raíz para accesibilidad
Modal.setAppElement("#root");

// Tipos de evento disponibles
const EVENT_TYPES = [
    "Reuniones de equipo",
    "Capacitaciones internas",
    "Cumpleaños del personal",
    "Proyectos asignados",
    "Entrega de informes",
    "Reuniones de comité de admisión",
    "Campaña publicitaria de admisión",
    "Seguimiento a posibles estudiantes",
    "Plazos de marketing",
    "Eventos externos de promoción",
];

const EventModal = ({ isOpen, onRequestClose, onSave, onSaveSuccess, initialData, employees }) => {
    // Estado del formulario
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        date: "",
        eventType: "",
        participants: [],
    });

    // Estado de errores de validación
    const [errors, setErrors] = useState({});

    // Inicializamos el formulario cuando se abre el modal o cambia initialData
    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                participants: initialData.participants || [],
            });
        } else {
            setFormData({
                title: "",
                description: "",
                date: "",
                eventType: "",
                participants: [],
            });
        }
        setErrors({});
    }, [initialData, isOpen]);

    // Manejo de cambios en inputs de texto y select
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Manejo de cambios en los participantes (checkboxes)
    const handleParticipantsChange = (e) => {
        const { value, checked } = e.target;
        const employee = employees.find(emp => emp._id === value);
        if (checked) {
            setFormData({ ...formData, participants: [...formData.participants, employee] });
        } else {
            setFormData({ ...formData, participants: formData.participants.filter(p => p._id !== value) });
        }
    };

    // Validación de formulario
    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = "El título es obligatorio.";
        if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria.";
        if (!formData.eventType) newErrors.eventType = "Debes seleccionar un tipo de evento.";
        if (!formData.date) newErrors.date = "La fecha es obligatoria.";
        if (!formData.participants.length) newErrors.participants = "Debes seleccionar al menos un participante.";

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    // Manejo del envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return; // ⚠️ No se envía si hay errores

        const dataToSend = {
            ...formData,
            participants: formData.participants.map(p => p._id) // enviar solo IDs al backend
        };

        await onSave(dataToSend);
        if (onSaveSuccess) onSaveSuccess();
        onRequestClose();
    };

    // Determina si estamos editando un evento existente
    const isEditMode = initialData && initialData._id;
    const participantsIds = formData.participants.map(p => p._id);

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={isEditMode ? "Editar Evento" : "Añadir Evento"}
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-70 z-40"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Encabezado del modal */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">{isEditMode ? "Editar Evento" : "Añadir Evento"}</h2>
                    <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Formulario del evento */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-grow">
                    {/* Título */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Título</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.title ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                        />
                        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                    </div>

                    {/* Descripción */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.description ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                            rows="3"
                        />
                        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                    </div>

                    {/* Tipo de Evento */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Tipo de Evento</label>
                        <select
                            name="eventType"
                            value={formData.eventType}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.eventType ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                        >
                            <option value="">Selecciona un tipo</option>
                            {EVENT_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                        {errors.eventType && <p className="text-red-500 text-sm mt-1">{errors.eventType}</p>}
                    </div>

                    {/* Fecha */}
                    <div className="mb-4">
                        <label className="block text-gray-700 font-semibold mb-2">Fecha</label>
                        <input
                            type="date"
                            name="date"
                            value={formData.date ? new Date(new Date(formData.date).getTime() - new Date(formData.date).getTimezoneOffset() * 60000).toISOString().substring(0, 10) : ""}
                            onChange={handleChange}
                            className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 ${errors.date ? 'border-red-500 ring-red-500' : 'border-gray-300'}`}
                        />
                        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
                    </div>

                    {/* Participantes */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Participantes</label>
                        <div className={`grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-lg ${errors.participants ? 'border-red-500' : 'border-gray-300'}`}>
                            {employees && employees.map(emp => (
                                <div key={emp._id} className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        value={emp._id}
                                        checked={participantsIds.includes(emp._id)}
                                        onChange={handleParticipantsChange}
                                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 text-sm">{emp.name}</span>
                                </div>
                            ))}
                        </div>
                        {errors.participants && <p className="text-red-500 text-sm mt-1">{errors.participants}</p>}
                    </div>

                    {/* Botones Cancelar / Guardar */}
                    <div className="flex justify-end gap-4 p-2 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onRequestClose}
                            className="bg-gray-300 text-gray-800 p-3 rounded-lg font-semibold hover:bg-gray-400 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-red-600 text-white p-3 rounded-lg font-semibold hover:bg-red-700 transition"
                        >
                            {isEditMode ? "Guardar Cambios" : "Guardar Evento"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
};

// Exportamos el componente para usarlo en otros módulos
export default EventModal;
