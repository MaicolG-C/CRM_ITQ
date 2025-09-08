/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: TaskDetailsModal.jsx
Descripción: Modal para mostrar los detalles de una tarea específica.
Propósito:
    - Mostrar información completa de una tarea (título, prioridad, estado, fechas, asignado, descripción, notas).
Dependencias:
    - react-modal: para el modal.
    - date-fns: para formatear fechas.
    - react-icons/fa: iconos de interfaz.
*/

import React from "react";
import Modal from "react-modal";
import { FaTimes } from "react-icons/fa";
import { format } from "date-fns";

Modal.setAppElement("#root");

const TaskDetailsModal = ({ isOpen, onRequestClose, task }) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Detalles de la Tarea"
      className="fixed inset-0 bg-white rounded-lg shadow-xl m-auto max-w-3xl w-full max-h-[80vh] p-6 sm:p-8 overflow-y-auto z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Detalles de la Tarea</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800">
          <FaTimes size={24} />
        </button>
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-1 text-sm">Título</label>
          <p className="text-lg text-gray-900 break-words">{task.title}</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1 text-sm">Prioridad</label>
          <p className="text-lg text-gray-900">{task.priority}</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1 text-sm">Estado</label>
          <p className="text-lg text-gray-900">{task.status}</p>
        </div>
        <div>
          <label className="block text-gray-700 font-semibold mb-1 text-sm">Fecha límite</label>
          <p className="text-lg text-gray-900">{task.dueDate ? format(new Date(task.dueDate), "dd-MM-yyyy") : "No definida"}</p>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1 text-sm">Asignado a</label>
          <div className="flex items-center mt-1">
            {task.assignedTo ? (
              <>
                <img 
                  src={`http://localhost:5000${task.assignedTo.profileImageUrl}`} 
                  alt={task.assignedTo.name} 
                  className="h-8 w-8 rounded-full mr-2 object-cover" 
                />
                <p className="text-gray-900">{task.assignedTo.name}</p>
              </>
            ) : (
              <p className="text-gray-900">No asignado</p>
            )}
          </div>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1 text-sm">Descripción</label>
          <p className="text-gray-900 whitespace-pre-wrap">{task.description || "Sin descripción"}</p>
        </div>
        <div className="sm:col-span-2">
          <label className="block text-gray-700 font-semibold mb-1 text-sm">Notas</label>
          <p className="text-gray-900 whitespace-pre-wrap">{task.notes || "No hay notas"}</p>
        </div>
      </div>
    </Modal>
  );
};

export default TaskDetailsModal;
