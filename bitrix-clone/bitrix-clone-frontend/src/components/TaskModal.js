/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: TaskModal.jsx
Descripción: Modal para crear o editar una tarea.
Propósito:
    - Permite añadir o editar tareas con campos: título, descripción, prioridad, estado, fecha límite, asignado y notas.
    - Incluye validaciones de campos obligatorios, longitud máxima y fecha límite.
Dependencias:
    - react-modal: para el modal.
    - react-icons/fa: para iconos de interfaz.
    - date-fns: para formatear fechas y validar fechas pasadas.
*/

import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";
import { format, isBefore } from "date-fns";

Modal.setAppElement("#root");

const TaskModal = ({ isOpen, onRequestClose, onSave, initialData, employees }) => {
    const defaultTask = {
        title: "",
        description: "",
        priority: "Baja",
        status: "Pendiente",
        dueDate: "",
        assignedTo: "",
        notes: "",
    };

    const [task, setTask] = useState(initialData || defaultTask);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setTask(initialData || defaultTask);
            setErrors({});
        }
    }, [isOpen, initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setTask({ ...task, [name]: value });
    };

    const handleAssignedToChange = (e) => {
        const employeeId = e.target.value;
        const employee = employees.find(emp => emp._id === employeeId);
        setTask({ ...task, assignedTo: employee || "" });
    };

    const validate = () => {
        const newErrors = {};

        // Campos obligatorios
        if (!task.title.trim()) newErrors.title = "El título es obligatorio";
        if (!task.description.trim()) newErrors.description = "La descripción es obligatoria";
        if (!task.priority) newErrors.priority = "Selecciona una prioridad";
        if (!task.status) newErrors.status = "Selecciona un estado";
        if (!task.dueDate) newErrors.dueDate = "La fecha límite es obligatoria";
        if (!task.assignedTo || !task.assignedTo._id) newErrors.assignedTo = "Debes asignar un empleado";
        if (!task.notes.trim()) newErrors.notes = "Las notas son obligatorias";

        // Validaciones adicionales
        if (task.description.length > 500) newErrors.description = "La descripción es muy larga (máx 500 caracteres)";
        if (task.notes.length > 500) newErrors.notes = "Las notas son muy largas (máx 500 caracteres)";
        if (task.dueDate) {
            const selectedDate = new Date(task.dueDate);
            if (isBefore(selectedDate, new Date())) newErrors.dueDate = "La fecha límite no puede ser pasada";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        onSave(task);
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel="Crear/Editar Tarea"
            className="fixed inset-0 flex items-center justify-center p-4 z-50"
            overlayClassName="fixed inset-0 bg-black bg-opacity-70 z-40"
        >
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]">
                {/* Encabezado */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">{initialData ? "Editar Tarea" : "Añadir Tarea"}</h2>
                    <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800">
                        <FaTimes size={24} />
                    </button>
                </div>

                {/* Contenido del formulario */}
                <div className="p-6 overflow-y-auto flex-grow">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            {/* Título */}
                            <div className="col-span-1">
                                <label className="block text-gray-700 font-medium mb-1">Título</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={task.title}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.title ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"}`}
                                />
                                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
                            </div>

                            {/* Prioridad */}
                            <div className="col-span-1">
                                <label className="block text-gray-700 font-medium mb-1">Prioridad</label>
                                <select
                                    name="priority"
                                    value={task.priority}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.priority ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"}`}
                                >
                                    <option>Baja</option>
                                    <option>Media</option>
                                    <option>Alta</option>
                                </select>
                                {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
                            </div>

                            {/* Descripción */}
                            <div className="col-span-2">
                                <label className="block text-gray-700 font-medium mb-1">Descripción</label>
                                <textarea
                                    name="description"
                                    value={task.description}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.description ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"}`}
                                    rows="3"
                                ></textarea>
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            {/* Asignado a */}
                            <div className="col-span-1">
                                <label className="block text-gray-700 font-medium mb-1">Asignado a</label>
                                <select
                                    name="assignedTo"
                                    value={task.assignedTo && task.assignedTo._id ? task.assignedTo._id : ""}
                                    onChange={handleAssignedToChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.assignedTo ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"}`}
                                >
                                    <option value="">Selecciona un empleado</option>
                                    {employees.map(emp => (
                                        <option key={emp._id} value={emp._id}>{emp.name}</option>
                                    ))}
                                </select>
                                {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
                            </div>

                            {/* Fecha límite */}
                            <div className="col-span-1">
                                <label className="block text-gray-700 font-medium mb-1">Fecha Límite</label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    value={task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : ""}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.dueDate ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"}`}
                                />
                                {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
                            </div>

                            {/* Estado */}
                            <div className="col-span-1">
                                <label className="block text-gray-700 font-medium mb-1">Estado</label>
                                <select
                                    name="status"
                                    value={task.status}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.status ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"}`}
                                >
                                    <option>Pendiente</option>
                                    <option>En Progreso</option>
                                    <option>Completada</option>
                                    <option>En Revisión</option>
                                </select>
                                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
                            </div>

                            {/* Notas */}
                            <div className="col-span-2">
                                <label className="block text-gray-700 font-medium mb-1">Notas</label>
                                <textarea
                                    name="notes"
                                    value={task.notes}
                                    onChange={handleChange}
                                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${errors.notes ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-red-500"}`}
                                    rows="3"
                                ></textarea>
                                {errors.notes && <p className="text-red-500 text-sm mt-1">{errors.notes}</p>}
                            </div>
                        </div>
                    </form>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end space-x-4 p-6 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={onRequestClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </Modal>
    );
};

export default TaskModal;
