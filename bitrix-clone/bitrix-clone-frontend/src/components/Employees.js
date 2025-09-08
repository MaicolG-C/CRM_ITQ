/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Employees.jsx
Descripción: Gestión de empleados con vistas de lista y actividad.
Propósito: Permite ver, añadir, editar y eliminar empleados, así como mostrar su actividad y tareas.
Dependencias:
  - React (useState, useEffect)
  - react-icons/fa (Iconos para editar, eliminar y agregar)
  - EmployeeModal: Modal para añadir/editar empleado
  - EmployeeActivityView: Vista de actividad de empleados
  - api: Cliente Axios configurado para hacer llamadas a la API
*/

import { useEffect, useState } from "react";
import api from "../api";
import EmployeeModal from "./EmployeeModal";
import EmployeeActivityView from "./EmployeeActivityView";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Employees = ({ search, onUpdateDashboard }) => {
    // Estados principales
    const [employees, setEmployees] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState("Lista");

    // Modal de eliminación
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);

    // Función para traer empleados y tareas
    const fetchData = async () => {
        try {
            const employeesRes = await api.get("/employees");
            const tasksRes = await api.get("/tasks");
            setEmployees(employeesRes.data || []);
            setTasks(tasksRes.data || []);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            setEmployees([]);
            setTasks([]);
        }
    };

    // Fetch inicial
    useEffect(() => {
        fetchData();
    }, []);

    // Guardar empleado (crear o actualizar)
    const handleSaveEmployee = async (employeeData) => {
        try {
            if (selectedEmployee) {
                await api.put(`/employees/${selectedEmployee._id}`, employeeData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                await api.post("/employees", employeeData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }
            setIsModalOpen(false);
            setSelectedEmployee(null);
            fetchData();
            if (onUpdateDashboard) onUpdateDashboard();
        } catch (error) {
            console.error("Error al guardar el empleado:", error.response?.data?.message || "Error desconocido");
            alert("Error al guardar el empleado");
        }
    };

    // Abrir modal de edición
    const handleEditClick = (employee) => {
        setSelectedEmployee(employee);
        setIsModalOpen(true);
    };

    // Abrir modal de confirmación de eliminación
    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setDeleteModalOpen(true);
    };

    // Confirmar eliminación
    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;
        try {
            await api.delete(`/employees/${employeeToDelete._id}`);
            fetchData();
            if (onUpdateDashboard) onUpdateDashboard();
        } catch (error) {
            console.error("Error al eliminar el empleado:", error.response?.data?.message || "Error desconocido");
            alert("Error al eliminar el empleado");
        } finally {
            setDeleteModalOpen(false);
            setEmployeeToDelete(null);
        }
    };

    // Filtrar empleados según búsqueda
    const filtered = employees.filter(emp => emp && emp.name && emp.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-3xl text-gray-800">Empleados ({employees.length})</h3>
                <div className="flex items-center space-x-4">
                    {/* Botones de vista */}
                    <div className="rounded-full bg-gray-200 p-1 flex">
                        <button
                            onClick={() => setCurrentView("Lista")}
                            className={`py-1 px-4 rounded-full font-semibold transition-colors ${currentView === "Lista" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-300"}`}
                        >
                            Lista
                        </button>
                        <button
                            onClick={() => setCurrentView("Actividad")}
                            className={`py-1 px-4 rounded-full font-semibold transition-colors ${currentView === "Actividad" ? "bg-red-600 text-white" : "text-gray-600 hover:bg-gray-300"}`}
                        >
                            Actividad
                        </button>
                    </div>
                    {/* Botón añadir */}
                    <button
                        onClick={() => { setSelectedEmployee(null); setIsModalOpen(true); }}
                        className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold flex items-center gap-2"
                    >
                        <FaPlus /> Añadir Empleado
                    </button>
                </div>
            </div>

            {/* Vista Lista */}
            {currentView === "Lista" && (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map(emp => {
                        const birthday = emp.birthday ? new Date(emp.birthday) : null;
                        const age = birthday ? new Date().getFullYear() - birthday.getFullYear() : 'N/A';
                        const profileImageUrl = emp.profileImageUrl ? `http://localhost:5000${emp.profileImageUrl}` : "https://via.placeholder.com/60";

                        return (
                            <div key={emp._id} className="bg-white rounded-lg p-4 border shadow-sm flex items-center justify-between gap-4">
                                {/* Avatar y nombre */}
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <img src={profileImageUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
                                    <div className="flex flex-col truncate">
                                        <p className="font-semibold text-lg truncate">{emp.name}</p>
                                        <p className="text-gray-500 text-sm truncate">{emp.email}</p>
                                    </div>
                                </div>

                                {/* Datos adicionales */}
                                <div className="grid grid-cols-4 flex-1 text-sm text-gray-700 gap-6">
                                    <div className="flex flex-col">
                                        <span className="text-gray-400">Género</span>
                                        <span className="font-medium truncate">{emp.gender || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400">Cumpleaños</span>
                                        <span className="font-medium truncate">{birthday ? birthday.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400">Edad</span>
                                        <span className="font-medium truncate">{age}</span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gray-400">Cargo</span>
                                        <span className="font-medium truncate">{emp.role || 'N/A'}</span>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex items-center gap-2">
                                    <button onClick={() => handleEditClick(emp)} className="text-gray-500 hover:text-gray-800 p-2">
                                        <FaEdit className="h-5 w-5" />
                                    </button>
                                    <button onClick={() => handleDeleteClick(emp)} className="text-red-500 hover:text-red-700 p-2">
                                        <FaTrash className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <p className="text-gray-500 text-center py-10 col-span-full">No hay empleados para mostrar.</p>
                    )}
                </div>
            )}

            {/* Vista Actividad */}
            {currentView === "Actividad" && (
                <EmployeeActivityView employees={employees} tasks={tasks} />
            )}

            {/* Modal de añadir/editar */}
            <EmployeeModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSaveEmployee}
                onUpdateNotifications={onUpdateDashboard}
                initialData={selectedEmployee}
            />

            {/* Modal de confirmación de eliminación */}
            {deleteModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
                        <h2 className="text-xl font-bold mb-4 text-center">Confirmar Eliminación</h2>
                        <p className="text-gray-600 text-center mb-6">
                            ¿Estás seguro de que quieres eliminar <span className="font-semibold">{employeeToDelete?.name}</span>?
                        </p>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setDeleteModalOpen(false)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 font-semibold"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-semibold"
                            >
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Employees;
