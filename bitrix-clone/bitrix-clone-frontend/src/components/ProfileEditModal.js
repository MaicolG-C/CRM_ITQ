/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: ProfileEditModal.jsx
Descripción: Modal para editar la información del perfil del usuario.
Propósito: 
    - Permitir editar datos del usuario y la empresa según rol.
    - Subir una nueva imagen de perfil.
    - Validar campos antes de enviar la información al backend.
    - Mostrar mensaje de éxito al actualizar el perfil.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - axios: Para realizar solicitudes HTTP al backend.
    - react-icons/fa: Para íconos de interfaz (cerrar modal y cámara).
*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTimes, FaCamera } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const ProfileEditModal = ({ user, token, onClose, onUpdateProfile }) => {
  const [formData, setFormData] = useState(null); // Inicialmente null
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');

  // Inicializar formData cuando llegue el user
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
        serviceUsage: user.serviceUsage || '',
        role: user.role || '',
        experience: user.experience || false,
        companyName: user.companyName || '',
        businessAddress: user.businessAddress || '',
        numEmployees: user.numEmployees || '',
        profileImageUrl: user.profileImageUrl || '',
      });
    }
  }, [user]);

  if (!formData) return null; // Evita renderizar antes de tener datos

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Manejar selección de imagen
  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  // Validación de campos
  const validateForm = () => {
    let newErrors = {};
    if (!formData.name) newErrors.name = 'El nombre es obligatorio.';
    if (!formData.lastName) newErrors.lastName = 'El apellido es obligatorio.';
    if (!formData.email) newErrors.email = 'El email es obligatorio.';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'El formato del email no es válido.';
    if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio.';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'El teléfono debe tener 10 dígitos numéricos.';

    // Validación campos de empresa según rol
    if (formData.role === 'sales_rep' || formData.role === 'administrador') {
      if (!formData.companyName) newErrors.companyName = 'El nombre de la empresa es obligatorio.';
      if (!formData.businessAddress) newErrors.businessAddress = 'La dirección de la empresa es obligatoria.';
      if (!formData.numEmployees) newErrors.numEmployees = 'El número de empleados es obligatorio.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      let updatedUser = { ...formData };

      // Subir imagen si se seleccionó
      if (profileImage) {
        const imageFormData = new FormData();
        imageFormData.append('profileImage', profileImage);
        const uploadRes = await axios.post(`${API_URL}/profile/upload`, imageFormData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        updatedUser.profileImageUrl = uploadRes.data.profileImageUrl;
      }

      // Actualizar perfil
      const res = await axios.put(`${API_URL}/profile`, updatedUser, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      onUpdateProfile(res.data);
      setSuccessMessage('Perfil actualizado con éxito');

      // Cerrar modal automáticamente después de 1.5s
      setTimeout(() => {
        setSuccessMessage('');
        onClose();
      }, 1500);

    } catch (err) {
      console.error('Error al actualizar el perfil:', err.response?.data || err.message);
      alert('Error al actualizar el perfil. Por favor, intente de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
          <FaTimes size={24} />
        </button>
        <h2 className="text-2xl font-bold mb-6">Editar Perfil</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Imagen de perfil */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <img
                src={
                  profileImage
                    ? URL.createObjectURL(profileImage)
                    : (formData.profileImageUrl && formData.profileImageUrl.startsWith('/uploads')
                        ? `http://localhost:5000${formData.profileImageUrl}`
                        : formData.profileImageUrl || 'https://via.placeholder.com/150')
                }
                alt="Perfil"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label htmlFor="profile-image-upload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100">
                <FaCamera className="text-gray-600" />
                <input id="profile-image-upload" type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
              </label>
            </div>
            {profileImage && <p className="text-sm text-gray-500">{profileImage.name}</p>}
          </div>

          {/* Campos de nombre y apellido */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500" />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500" />
              {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
            </div>
          </div>

          {/* Email y teléfono */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500" />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500" maxLength="10" />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>
          </div>

          {/* Campos de empresa */}
          {(formData.role === 'sales_rep' || formData.role === 'administrador') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre de la Empresa</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500" />
                {errors.companyName && <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Dirección de la Empresa</label>
                <input type="text" name="businessAddress" value={formData.businessAddress} onChange={handleChange} className="mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500" />
                {errors.businessAddress && <p className="mt-1 text-sm text-red-600">{errors.businessAddress}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Número de Empleados</label>
                <select name="numEmployees" value={formData.numEmployees} onChange={handleChange} className="mt-1 block w-full border rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500">
                  <option value="">Seleccione...</option>
                  <option value="solo yo">Solo yo</option>
                  <option value="2-5">2-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-20">11-20</option>
                  <option value="21-50">21-50</option>
                  <option value="51-100">51-100</option>
                  <option value="101-500">101-500</option>
                  <option value="500+">500+</option>
                </select>
                {errors.numEmployees && <p className="mt-1 text-sm text-red-600">{errors.numEmployees}</p>}
              </div>
            </>
          )}

          {/* Checkbox experiencia */}
          {(formData.role !== 'sales_rep' && formData.role !== 'administrador') && (
            <div className="flex items-center">
              <input type="checkbox" name="experience" checked={formData.experience} onChange={handleChange} className="form-checkbox h-4 w-4 text-red-600 rounded" />
              <label className="ml-2 block text-sm text-gray-900">¿Tienes experiencia?</label>
            </div>
          )}

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition">
              Guardar Cambios
            </button>
          </div>
        </form>

        {/* Modal de éxito */}
        {successMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <p className="text-green-600 font-semibold">{successMessage}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileEditModal;
