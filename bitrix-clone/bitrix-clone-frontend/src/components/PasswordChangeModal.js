/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: PasswordChangeModal.jsx
Descripción: Componente modal para permitir a los usuarios cambiar su contraseña.
Propósito: 
    - Permitir al usuario ingresar su contraseña actual y establecer una nueva contraseña.
    - Validar que las nuevas contraseñas coincidan.
    - Mostrar errores y mensajes de éxito.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - axios: Para realizar solicitudes HTTP al backend.
    - react-icons/fa: Para íconos de interfaz (cerrar, mostrar/ocultar contraseña).
    - useAuth (context): Para obtener el token de autenticación del usuario.
*/

import React, { useState } from 'react';
import axios from 'axios';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

// URL base del API
const API_URL = 'http://localhost:5000/api';

/*
  Componente PasswordChangeModal
  Props:
    - onClose: función para cerrar el modal
  Descripción: Modal que permite al usuario cambiar su contraseña con validación y retroalimentación visual.
*/
const PasswordChangeModal = ({ onClose }) => {
    const { token } = useAuth(); // Obtener token del usuario
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [successMessage, setSuccessMessage] = useState(''); // Mensaje de éxito

    // Manejar cambios en los inputs
    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevData => ({ ...prevData, [name]: value }));
    };

    // Alternar visibilidad de la contraseña
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    // Manejar envío del formulario
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validar que las nuevas contraseñas coincidan
        if (passwordData.newPassword !== passwordData.confirmNewPassword) {
            setPasswordError('Las nuevas contraseñas no coinciden.');
            return;
        }
        setPasswordError('');

        try {
            // Llamada al backend para actualizar contraseña
            await axios.put(`${API_URL}/profile/password`, {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            // Mostrar mensaje de éxito
            setSuccessMessage('Contraseña actualizada con éxito.');

            // Cerrar modal automáticamente después de 1.5 segundos
            setTimeout(() => {
                setSuccessMessage('');
                onClose();
            }, 1500);

        } catch (err) {
            console.error('Error al cambiar la contraseña:', err.response?.data || err.message);
            setPasswordError(err.response?.data?.msg || 'Error al cambiar la contraseña.');
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
                {/* Botón cerrar */}
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800">
                    <FaTimes size={24} />
                </button>
                <h2 className="text-2xl font-bold mb-6 text-center">Cambiar Contraseña</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Contraseña actual */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Contraseña Actual</label>
                        <input
                            type="password"
                            name="currentPassword"
                            value={passwordData.currentPassword}
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>

                    {/* Nueva contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Confirmar nueva contraseña */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Confirmar Nueva Contraseña</label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="confirmNewPassword"
                                value={passwordData.confirmNewPassword}
                                onChange={handleChange}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={togglePasswordVisibility}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </button>
                        </div>
                    </div>

                    {/* Mensaje de error */}
                    {passwordError && <p className="text-red-500 text-sm mt-2 text-center">{passwordError}</p>}

                    {/* Botón de enviar */}
                    <div className="flex justify-center mt-6">
                        <button type="submit" className="px-6 py-2 bg-red-600 text-white font-medium rounded-md hover:bg-red-700 transition">
                            Actualizar Contraseña
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

export default PasswordChangeModal;
