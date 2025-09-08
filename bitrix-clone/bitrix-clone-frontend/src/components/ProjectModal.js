/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: ProjectModal.jsx
Descripción: Componente modal para crear o editar proyectos.
Propósito:
    - Permite ingresar nombre, descripción, fechas, prioridad y miembros asignados al proyecto.
    - Valida los datos antes de enviar.
    - Muestra errores visuales si faltan campos obligatorios o las fechas son inválidas.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-modal: Para mostrar modales de manera accesible.
    - react-icons/fa: Para mostrar íconos de usuario cuando no hay imagen disponible.
Props:
    - isOpen: Boolean que controla si el modal está abierto.
    - onRequestClose: Función para cerrar el modal.
    - onSave: Función que se ejecuta al guardar los datos validados.
    - initialData: Objeto opcional con datos del proyecto para editar.
    - allUsers: Lista de usuarios disponibles para asignar al proyecto.
*/

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { FaUserCircle } from "react-icons/fa";

Modal.setAppElement("#root");

const ProjectModal = ({ isOpen, onRequestClose, onSave, initialData, allUsers = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    priority: "Media",
    members: [],
  });
  const [errors, setErrors] = useState({});

  // Inicializar datos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          name: initialData.name || "",
          description: initialData.description || "",
          priority: initialData.priority || "Media",
          startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
          endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
          members: initialData.members ? initialData.members.map(member => member._id) : [],
        });
      } else {
        setFormData({ name: "", description: "", startDate: "", endDate: "", priority: "Media", members: [] });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberToggle = (userId) => {
    setFormData(prev => {
      const members = prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId];
      return { ...prev, members };
    });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "El nombre es obligatorio.";
    if (!formData.description.trim()) newErrors.description = "La descripción es obligatoria.";
    if (!formData.startDate) newErrors.startDate = "La fecha de inicio es obligatoria.";
    if (!formData.endDate) newErrors.endDate = "La fecha de fin es obligatoria.";
    if (!formData.priority) newErrors.priority = "La prioridad es obligatoria.";
    if (formData.members.length === 0) newErrors.members = "Debes asignar al menos un miembro.";

    // Validación de fechas
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) newErrors.endDate = "La fecha de fin no puede ser anterior a la fecha de inicio.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      await onSave(formData);
      onRequestClose();
    }
  };

  const getImageUrl = (url) => (url ? `http://localhost:5000${url}` : null);

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Añadir/Editar Proyecto"
      className="fixed inset-0 bg-white rounded-lg shadow-xl m-auto max-w-lg p-8 overflow-auto animate-fade-in"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in"
    >
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{initialData ? "Editar Proyecto" : "Añadir Proyecto"}</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800 text-3xl">&times;</button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nombre */}
        <div>
          <label htmlFor="name" className="block text-gray-700 text-lg font-semibold mb-2">Nombre del Proyecto</label>
          <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : ''}`} />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        {/* Fechas */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-gray-700 text-lg font-semibold mb-2">Inicio</label>
            <input type="date" name="startDate" id="startDate" value={formData.startDate} onChange={handleChange} className={`w-full p-3 border rounded-lg ${errors.startDate ? 'border-red-500' : ''}`} />
            {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
          </div>
          <div>
            <label htmlFor="endDate" className="block text-gray-700 text-lg font-semibold mb-2">Fin</label>
            <input type="date" name="endDate" id="endDate" value={formData.endDate} onChange={handleChange} className={`w-full p-3 border rounded-lg ${errors.endDate ? 'border-red-500' : ''}`} />
            {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
          </div>
        </div>

        {/* Prioridad */}
        <div>
          <label htmlFor="priority" className="block text-gray-700 text-lg font-semibold mb-2">Prioridad</label>
          <select name="priority" id="priority" value={formData.priority} onChange={handleChange} className={`w-full p-3 border rounded-lg ${errors.priority ? 'border-red-500' : ''}`}>
            <option value="Baja">Baja</option>
            <option value="Media">Media</option>
            <option value="Alta">Alta</option>
          </select>
          {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
        </div>

        {/* Miembros */}
        <div>
          <label className="block text-gray-700 text-lg font-semibold mb-2">Encargados (Miembros)</label>
          <div className="border border-gray-300 rounded-lg p-3 max-h-48 overflow-y-auto space-y-2">
            {allUsers.length > 0 ? allUsers.map(user => {
              const imageUrl = getImageUrl(user.profileImageUrl);
              return (
                <div key={user._id} className="flex items-center">
                  <input type="checkbox" id={`member-${user._id}`} checked={formData.members.includes(user._id)} onChange={() => handleMemberToggle(user._id)} className="h-5 w-5 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer" />
                  <label htmlFor={`member-${user._id}`} className="ml-3 flex items-center cursor-pointer">
                    {imageUrl ? <img src={imageUrl} alt={user.name} className="h-8 w-8 rounded-full object-cover mr-2" /> : <FaUserCircle className="h-8 w-8 text-gray-400 mr-2" />}
                    <span className="text-gray-700">{user.name}</span>
                  </label>
                </div>
              );
            }) : <p className="text-sm text-gray-500">No hay usuarios para asignar.</p>}
          </div>
          {errors.members && <p className="text-red-500 text-sm mt-1">{errors.members}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-gray-700 text-lg font-semibold mb-2">Descripción</label>
          <textarea name="description" id="description" value={formData.description} onChange={handleChange} rows="4" className={`w-full p-3 border rounded-lg resize-y ${errors.description ? 'border-red-500' : ''}`}></textarea>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
      </form>

      {/* Botón Guardar */}
      <div className="flex justify-end mt-8 border-t pt-6">
        <button type="button" onClick={handleSubmit} className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700">
          {initialData ? "Guardar Cambios" : "Guardar Proyecto"}
        </button>
      </div>
    </Modal>
  );
};

export default ProjectModal;
