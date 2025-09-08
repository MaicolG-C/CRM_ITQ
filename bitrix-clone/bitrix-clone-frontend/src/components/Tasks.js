/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Tasks.jsx
Descripción: Componente encargado de mostrar, crear, editar y eliminar tareas dentro del dashboard de la aplicación.
Propósito: Permitir al usuario gestionar tareas mediante vistas de lista y calendario, modificar su estado, asignarlas a empleados, ver detalles, y mantener los datos sincronizados con el dashboard principal.
Dependencias:
    - react: Biblioteca principal para crear componentes y manejar estado.
    - react-icons/fa: Iconos de FontAwesome para botones de acción.
    - api: Cliente HTTP para realizar peticiones al backend.
    - Componentes internos: TaskModal, TaskDetailsModal, TasksCalendarView.
Props:
    - search: Texto de búsqueda para filtrar tareas por título.
    - onUpdateDashboard: Función que permite notificar al dashboard que se actualizó la información.
*/

import React, { useState, useEffect } from "react"; // Hooks de React para estado y efectos
import api from "../api"; // Cliente HTTP configurado para peticiones al backend
import TaskModal from "./TaskModal"; // Modal para crear o editar tareas
import TaskDetailsModal from "./TaskDetailsModal"; // Modal para ver detalles de tareas
import TasksCalendarView from "./TasksCalendarView"; // Vista de calendario de tareas
import { FaEdit, FaTrash, FaInfoCircle, FaPlus } from 'react-icons/fa'; // Iconos de acciones

const Tasks = ({ search, onUpdateDashboard }) => {
    const [tasks, setTasks] = useState([]); 
    const [employees, setEmployees] = useState([]); 
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false); 
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false); 
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); 
    const [selectedTask, setSelectedTask] = useState(null); 
    const [taskToDelete, setTaskToDelete] = useState(null); 
    const [errorModalOpen, setErrorModalOpen] = useState(false); 
    const [errorMessage, setErrorMessage] = useState(""); 
    const [currentView, setCurrentView] = useState("Lista"); 

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const tasksRes = await api.get("/tasks"); 
            const employeesRes = await api.get("/employees"); 
            setTasks(tasksRes.data); 
            setEmployees(employeesRes.data); 
        } catch (error) {
            showError("Error al cargar las tareas o empleados.");
        }
    };

    const showError = (message) => {
        setErrorMessage(message);
        setErrorModalOpen(true);
    };

    const handleStatusChange = async (taskId, newStatus) => {
        try {
            const taskToUpdate = tasks.find(task => task._id === taskId);
            if (!taskToUpdate) return;

            const assignedToId = taskToUpdate.assignedTo ? taskToUpdate.assignedTo._id : null;

            await api.put(`/tasks/${taskId}`, {
                status: newStatus,
                assignedTo: assignedToId
            });

            fetchData(); 
            if (onUpdateDashboard) onUpdateDashboard();
        } catch (error) {
            showError("Error al actualizar el estado de la tarea.");
        }
    };

    const handleSaveTask = async (taskData) => {
        try {
            if (selectedTask) {
                await api.put(`/tasks/${selectedTask._id}`, taskData); 
            } else {
                await api.post("/tasks", taskData); 
            }
            setIsTaskModalOpen(false); 
            setSelectedTask(null); 
            fetchData(); 
            if (onUpdateDashboard) onUpdateDashboard();
        } catch (error) {
            showError("Error al guardar la tarea.");
        }
    };

    const confirmDeleteTask = (task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteTask = async () => {
        if (!taskToDelete) return;
        try {
            await api.delete(`/tasks/${taskToDelete._id}`);
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
            fetchData();
            if (onUpdateDashboard) onUpdateDashboard();
        } catch (error) {
            showError("Error al eliminar la tarea.");
        }
    };

    const handleOpenDetails = (task) => {
        setSelectedTask(task);
        setIsDetailsModalOpen(true);
    };

    const handleEditClick = (task) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    const filteredTasks = tasks.filter(task => task.title.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mx-auto max-w-7xl">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-3xl text-gray-800">Tareas</h3>
                <div className="flex items-center space-x-4">
                    <div className="rounded-full bg-gray-200 p-1 flex">
                        <button
                            onClick={() => setCurrentView("Lista")}
                            className={`py-1 px-4 rounded-full font-semibold transition-colors ${currentView === "Lista" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-300"}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setCurrentView("Calendario")}
                            className={`py-1 px-4 rounded-full font-semibold transition-colors ${currentView === "Calendario" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-300"}`}
                        >
                            Calendario
                        </button>
                    </div>
                    <button
                        onClick={() => { setSelectedTask(null); setIsTaskModalOpen(true); }}
                        className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold flex items-center gap-2"
                    >
                        <FaPlus /> Añadir Tarea
                    </button>
                </div>
            </div>

            {currentView === "Lista" && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prioridad</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Límite</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Asignado a</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredTasks.map(task => (
                                    <tr key={task._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{task.title}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${task.priority === 'Alta' ? 'bg-red-100 text-red-800' :
                                                task.priority === 'Media' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-green-100 text-green-800'}`}>
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <select
                                                value={task.status}
                                                onChange={(e) => handleStatusChange(task._id, e.target.value)}
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md"
                                            >
                                                <option>Pendiente</option>
                                                <option>En Progreso</option>
                                                <option>Completada</option>
                                                <option>En Revisión</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center">
                                                {task.assignedTo ? (
                                                    <>
                                                        <img 
                                                            src={task.assignedTo.profileImageUrl ? `http://localhost:5000${task.assignedTo.profileImageUrl}` : 'https://via.placeholder.com/24'} 
                                                            alt={task.assignedTo.name} 
                                                            className="w-6 h-6 rounded-full mr-2 object-cover" 
                                                        />
                                                        <span>{task.assignedTo.name}</span>
                                                    </>
                                                ) : (
                                                    <span>No asignado</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end space-x-2">
                                                <button onClick={() => handleOpenDetails(task)} className="text-blue-600 hover:text-blue-900 p-1">
                                                    <FaInfoCircle />
                                                </button>
                                                <button onClick={() => handleEditClick(task)} className="text-gray-600 hover:text-gray-900 p-1">
                                                    <FaEdit />
                                                </button>
                                                <button onClick={() => confirmDeleteTask(task)} className="text-red-600 hover:text-red-900 p-1">
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {currentView === "Calendario" && (
                <TasksCalendarView tasks={tasks} handleOpenDetailsModal={handleOpenDetails} />
            )}

            <TaskModal
                isOpen={isTaskModalOpen}
                onRequestClose={() => setIsTaskModalOpen(false)}
                onSave={handleSaveTask}
                initialData={selectedTask}
                employees={employees}
            />
            <TaskDetailsModal
                isOpen={isDetailsModalOpen}
                onRequestClose={() => setIsDetailsModalOpen(false)}
                task={selectedTask}
            />

            {isDeleteModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3>Confirmar Eliminación</h3>
                        <p>¿Estás seguro de que deseas eliminar la tarea <strong>{taskToDelete?.title}</strong>?</p>
                        <div className="flex justify-end space-x-4">
                            <button onClick={() => setIsDeleteModalOpen(false)}>Cancelar</button>
                            <button onClick={handleDeleteTask}>Eliminar</button>
                        </div>
                    </div>
                </div>
            )}

            {errorModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-96">
                        <h3>¡Error!</h3>
                        <p>{errorMessage}</p>
                        <div className="flex justify-end">
                            <button onClick={() => setErrorModalOpen(false)}>Cerrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tasks;
