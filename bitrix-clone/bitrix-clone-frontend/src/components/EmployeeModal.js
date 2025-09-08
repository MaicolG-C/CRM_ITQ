/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: EmployeeModal.jsx
Descripción: Componente React para agregar o editar empleados mediante un modal.
Propósito: Permitir la gestión de información de empleados incluyendo nombre, email, contraseña, género, cumpleaños, cargo y foto de perfil.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-modal: Para mostrar modales modales accesibles.
    - date-fns: Para formatear fechas.
    - react-icons/fa: Para iconos como avatar de usuario y cerrar modal.
*/

import { useState, useEffect } from "react";
import Modal from "react-modal";
import { format } from "date-fns";
import { FaUserCircle, FaTimes } from "react-icons/fa";

// Configuramos el elemento raíz para accesibilidad
Modal.setAppElement("#root");

const EmployeeModal = ({ isOpen, onRequestClose, onSave, onSaveSuccess, initialData }) => {
  // Estado del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    birthday: "",
    role: "",
    profileImage: null,
    imagePreview: null,
  });

  // Estado de errores de validación
  const [errors, setErrors] = useState({});

  // Determina si estamos editando un empleado existente
  const isEditing = !!initialData;

  // Cuando se abre el modal, se inicializa el formulario
  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setFormData({
          ...initialData,
          birthday: initialData.birthday ? format(new Date(initialData.birthday), "yyyy-MM-dd") : "",
          imagePreview: initialData.profileImageUrl ? `http://localhost:5000${initialData.profileImageUrl}` : null,
          password: "", // No se rellena la contraseña existente
        });
      } else {
        setFormData({
          name: "",
          email: "",
          password: "",
          gender: "",
          birthday: "",
          role: "",
          profileImage: null,
          imagePreview: null,
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData, isEditing]);

  // Maneja cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profileImage" && files.length > 0) {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Validación de formulario
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = "El nombre es obligatorio";
    if (!formData.email) newErrors.email = "El email es obligatorio";
    if (!isEditing && !formData.password) newErrors.password = "La contraseña es obligatoria";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejo del envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      const formToSend = new FormData();
      formToSend.append("name", formData.name);
      formToSend.append("email", formData.email);
      if (formData.password) formToSend.append("password", formData.password);
      formToSend.append("gender", formData.gender);
      formToSend.append("birthday", formData.birthday);
      formToSend.append("role", formData.role);
      if (formData.profileImage) formToSend.append("profileImage", formData.profileImage);

      await onSave(formToSend);

      if (onSaveSuccess) onSaveSuccess();
      onRequestClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel={isEditing ? "Editar Empleado" : "Añadir Empleado"}
      className="fixed inset-0 bg-white rounded-lg shadow-xl m-auto max-w-2xl p-6 overflow-y-auto animate-fade-in z-50"
      overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in z-50"
    >
      {/* Encabezado del modal */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <h2 className="text-3xl font-bold text-gray-800">{isEditing ? "Editar Empleado" : "Añadir Empleado"}</h2>
        <button onClick={onRequestClose} className="text-gray-500 hover:text-gray-800 text-3xl">
          <FaTimes />
        </button>
      </div>

      {/* Formulario de empleado */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Sección de avatar */}
        <div className="sm:col-span-2 flex flex-col items-center gap-4 py-4">
          <label className="block text-gray-700 font-semibold text-lg text-center">Seleccionar Avatar</label>
          <div className="relative w-32 h-32 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer">
            {formData.imagePreview ? (
              <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover rounded-full" />
            ) : (
              <FaUserCircle className="h-full w-full text-gray-400" />
            )}
            <input type="file" name="profileImage" accept="image/*" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <p className="text-sm text-gray-500 text-center">Formatos disponibles: .jpg, .png</p>
        </div>

        {/* Campos del formulario */}
        <div>
          <label className="block text-gray-700 font-semibold mb-1">Nombre</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Nombre completo" className="w-full p-3 border rounded-lg" />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Email</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email del empleado" className="w-full p-3 border rounded-lg" />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Contraseña</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={isEditing ? "Dejar en blanco para no cambiar" : "Contraseña"} className="w-full p-3 border rounded-lg" />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Género</label>
          <select name="gender" value={formData.gender} onChange={handleChange} className="w-full p-3 border rounded-lg">
            <option value="">Seleccionar</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Fecha de Cumpleaños</label>
          <input type="date" name="birthday" value={formData.birthday} onChange={handleChange} className="w-full p-3 border rounded-lg" />
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-1">Cargo</label>
          <input type="text" name="role" value={formData.role} onChange={handleChange} placeholder="Ej: Supervisor, Asesor" className="w-full p-3 border rounded-lg" />
        </div>

        {/* Botón de guardar */}
        <div className="col-span-full flex justify-end mt-4">
          <button type="submit" className="bg-red-600 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:bg-red-700 transition-colors">
            {isEditing ? "Guardar Cambios" : "Guardar Empleado"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Exportamos el componente para usarlo en otros módulos
export default EmployeeModal;
