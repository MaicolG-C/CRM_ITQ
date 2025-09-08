/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: TasksKanbanView.jsx
Descripción: Componente encargado de mostrar las tareas en un tablero Kanban interactivo con soporte para arrastrar y soltar.
Propósito: Permitir al usuario visualizar, mover y eliminar tareas según su estado (Pendiente, En Progreso, Completada), además de abrir detalles de una tarea al hacer clic.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-beautiful-dnd: Librería para manejar drag & drop (arrastrar y soltar) en React.
    - date-fns: Librería para formatear fechas.
    - react-icons/fa: Iconos para la interfaz (basurero para eliminar tareas).
Props:
    - tasks: Lista de tareas con al menos los campos `_id`, `title`, `description`, `priority`, `status`, `dueDate` y `assignedTo`.
    - handleOpenDetailsModal: Función para abrir el modal de detalles de la tarea seleccionada.
    - handleDeleteTask: Función para eliminar la tarea al hacer clic en el botón de borrar.
*/

import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'; // Componentes para arrastrar y soltar
import api from "../api"; // API para la comunicación con el backend
import { format } from "date-fns"; // Formateo de fechas
import { FaTrashAlt } from "react-icons/fa"; // Icono de eliminar

const TasksKanbanView = ({ tasks, handleOpenDetailsModal, handleDeleteTask }) => {
  // Estado para almacenar tareas agrupadas por estado
  const [groupedTasks, setGroupedTasks] = useState({
    'Pendiente': [],
    'En Progreso': [],
    'Completada': [],
  });

  // Función para determinar el color según la prioridad de la tarea
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta': return 'bg-red-500 text-white';
      case 'Media': return 'bg-yellow-500 text-white';
      case 'Baja': return 'bg-green-500 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  // Agrupa las tareas cada vez que cambian
  useEffect(() => {
    const newGroupedTasks = tasks.reduce((acc, task) => {
      acc[task.status] = acc[task.status] || [];
      acc[task.status].push(task);
      return acc;
    }, {
      'Pendiente': [],
      'En Progreso': [],
      'Completada': [],
    });
    setGroupedTasks(newGroupedTasks);
  }, [tasks]);

  // Función que se ejecuta al terminar de arrastrar una tarea
  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    // Si no hay destino o no se movió a otra columna, salir
    if (!destination || (source.droppableId === destination.droppableId)) {
      return;
    }

    const newGroupedTasks = { ...groupedTasks };
    const sourceColumn = newGroupedTasks[source.droppableId];
    const destinationColumn = newGroupedTasks[destination.droppableId];
    
    if (!sourceColumn || !destinationColumn) {
      console.error("Error: Una de las columnas no existe.");
      return;
    }

    // Mover la tarea en la UI
    const [movedTask] = sourceColumn.splice(source.index, 1);
    movedTask.status = destination.droppableId;
    destinationColumn.splice(destination.index, 0, movedTask);

    setGroupedTasks(newGroupedTasks);

    // Actualizar el estado de la tarea en el servidor
    try {
      await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
      console.log(`Tarea ${draggableId} movida a la columna ${destination.droppableId}`);
    } catch (error) {
      console.error("Error al actualizar el estado de la tarea en el servidor:", error);
      // Revertir cambios si falla la actualización
      const originalTasks = await api.get("/tasks");
      setGroupedTasks(originalTasks.data.reduce((acc, task) => {
        acc[task.status] = acc[task.status] || [];
        acc[task.status].push(task);
        return acc;
      }, { 'Pendiente': [], 'En Progreso': [], 'Completada': [] }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.entries(groupedTasks).map(([columnId, columnTasks]) => (
          <div key={columnId} className="bg-gray-100 p-4 rounded-lg shadow-inner min-h-[300px]">
            <h4 className="font-bold text-lg mb-4 text-gray-700">{columnId} ({columnTasks.length})</h4>
            <Droppable droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="flex flex-col gap-4"
                >
                  {columnTasks.map((task, index) => (
                    <Draggable key={task._id} draggableId={task._id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:border-red-500 transition-colors cursor-grab"
                          onClick={() => handleOpenDetailsModal(task)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="font-semibold text-gray-900 text-lg">{task.title}</h5>
                            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <span>{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : 'Sin fecha'}</span>
                          </div>
                          {task.assignedTo && (
                            <div className="flex items-center text-sm text-gray-700 mt-2">
                              <img src={`http://localhost:5000${task.assignedTo.profileImageUrl}`} alt={task.assignedTo.name} className="h-6 w-6 rounded-full mr-2 object-cover" />
                              <span>Asignado a: {task.assignedTo.name}</span>
                            </div>
                          )}
                          <div className="flex gap-2 mt-4 justify-end">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task._id);
                              }} 
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Eliminar"
                            >
                              <FaTrashAlt size={16} />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default TasksKanbanView;
