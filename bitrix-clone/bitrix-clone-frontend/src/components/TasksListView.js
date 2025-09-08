/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: TasksListView.jsx
Descripción: Componente encargado de mostrar las tareas en una vista de lista con soporte para filtrado, edición, detalles y eliminación.
Propósito: Permitir al usuario visualizar todas las tareas en formato tabla, cambiar su estado, filtrar por estado, abrir detalles, editar o eliminar tareas.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-icons/fa: Iconos para la interfaz (editar, eliminar, ver detalles, filtro).
    - date-fns: Librería para formatear fechas.
Props:
    - tasks: Lista de tareas con al menos los campos `_id`, `title`, `description`, `priority`, `status`, `dueDate` y `assignedTo`.
    - employees: Lista de empleados (opcional, si se requiere para asignaciones o modales).
    - handleOpenEditModal: Función para abrir el modal de edición de una tarea.
    - handleOpenDetailsModal: Función para abrir el modal de detalles de una tarea.
    - handleDeleteTask: Función para eliminar una tarea.
    - handleStatusChange: Función para actualizar el estado de una tarea.
    - filter: Estado actual del filtro aplicado.
    - setFilter: Función para actualizar el filtro seleccionado.
    - statusOptions: Array con los posibles estados de las tareas.
*/

import React from "react";
import { FaEdit, FaTrashAlt, FaFilter, FaInfoCircle } from "react-icons/fa"; // Iconos
import { format } from "date-fns"; // Para formatear fechas

const TasksListView = ({ tasks, employees, handleOpenEditModal, handleOpenDetailsModal, handleDeleteTask, handleStatusChange, filter, setFilter, statusOptions }) => {

  // Determina el color del badge según la prioridad
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500 text-white';
      case 'Media': return 'bg-yellow-500 text-white';
      case 'Baja': return 'bg-green-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <>
      {/* Filtro de estado */}
      <div className="flex items-center gap-4 mb-6 p-4 bg-gray-100 rounded-lg">
        <FaFilter className="text-gray-600" />
        <span className="font-semibold text-gray-800">Filtrar por estado:</span>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="p-2 border border-gray-300 rounded-lg"
        >
          <option value="Todas">Todas</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Tabla de tareas */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-md">
          <thead className="bg-gray-200">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Título</th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Prioridad</th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Estado</th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha Límite</th>
              <th className="py-3 px-6 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asignado a</th>
              <th className="py-3 px-6 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task._id} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm text-gray-900 font-medium">{task.title}</td>
                <td className="py-4 px-6">
                  <span className={`px-2 py-1 text-xs rounded-full font-bold ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600 flex items-center">
                  <select 
                    value={task.status} 
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    className="border border-gray-300 rounded-lg p-1 text-sm"
                  >
                    {statusOptions.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : 'No definida'}
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">
                  {task.assignedTo ? (
                    <div className="flex items-center">
                      <img 
                        src={`http://localhost:5000${task.assignedTo.profileImageUrl}`} 
                        alt={task.assignedTo.name} 
                        className="h-8 w-8 rounded-full mr-2 object-cover" 
                      />
                      <span>{task.assignedTo.name}</span>
                    </div>
                  ) : 'No asignado'}
                </td>
                <td className="py-4 px-6 text-right text-sm">
                  <div className="flex justify-end gap-3">
                    <button 
                      onClick={() => handleOpenDetailsModal(task)} 
                      className="text-gray-500 hover:text-gray-700 transition-colors"
                      title="Ver Detalles"
                    >
                      <FaInfoCircle size={16} />
                    </button>
                    <button 
                      onClick={() => handleOpenEditModal(task)} 
                      className="text-blue-500 hover:text-blue-700 transition-colors"
                      title="Editar"
                    >
                      <FaEdit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task._id)} 
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Eliminar"
                    >
                      <FaTrashAlt size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TasksListView;
