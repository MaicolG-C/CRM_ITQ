/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Profile.jsx
Descripción: Componente que muestra la información del perfil del usuario.
Propósito: 
    - Mostrar información principal del usuario y, según su rol, información de la empresa o experiencia.
    - Permitir abrir modales para editar perfil y cambiar contraseña.
    - Actualizar los datos del dashboard al modificar el perfil.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - axios: Para realizar solicitudes HTTP al backend.
    - react-icons/fa: Para íconos de interfaz.
    - ProfileEditModal: Modal para editar la información del usuario.
    - PasswordChangeModal: Modal para cambiar la contraseña.
    - useAuth (context): Para acceder al usuario, token y actualizar datos globales.
*/

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FaUserCircle, FaEdit, FaKey } from 'react-icons/fa';
import ProfileEditModal from './ProfileEditModal';
import PasswordChangeModal from './PasswordChangeModal';

const API_URL = 'http://localhost:5000/api';

/*
  Componente Profile
  Props:
    - onUpdateDashboard: función opcional para actualizar el dashboard después de modificar el perfil
  Descripción:
    - Obtiene los datos del perfil del usuario desde el backend.
    - Muestra información del usuario y botones para editar perfil o cambiar contraseña.
    - Dependiendo del rol, muestra información adicional (empresa o experiencia).
*/
const Profile = ({ onUpdateDashboard }) => {
    const { user, token, updateUser } = useAuth(); 
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    // Obtener datos del perfil al cargar el componente
    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/profile`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setProfileData(res.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching profile data:', err.response?.data || err.message);
                setLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    // Función que se ejecuta al actualizar el perfil
    const handleProfileUpdate = (updatedUser) => {
        setProfileData(updatedUser); 
        updateUser(updatedUser);

        // Actualizar dashboard si se pasó la función
        if (onUpdateDashboard) {
            onUpdateDashboard();
        }
    };

    if (loading || !profileData) {
        return <div className="text-center py-10">Cargando perfil...</div>;
    }

    return (
        <div className="p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Mi Perfil</h1>
            
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            {/* Imagen de perfil */}
                            {profileData.profileImageUrl ? (
                                <img 
                                    src={`http://localhost:5000${profileData.profileImageUrl}`} 
                                    alt="Perfil" 
                                    className="w-24 h-24 rounded-full object-cover" 
                                />
                            ) : (
                                <FaUserCircle className="w-24 h-24 text-gray-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">{profileData.name} {profileData.lastName}</h2>
                            <p className="text-gray-500">{profileData.role}</p>
                        </div>
                    </div>

                    {/* Botones para abrir modales */}
                    <div className="flex space-x-4">
                        <button 
                            onClick={() => setIsEditModalOpen(true)} 
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            <FaEdit className="mr-2" /> Editar Perfil
                        </button>
                        <button 
                            onClick={() => setIsPasswordModalOpen(true)} 
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            <FaKey className="mr-2" /> Cambiar Contraseña
                        </button>
                    </div>
                </div>

                {/* Información del perfil */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800">Información Principal</h3>
                            <p><span className="font-medium">Email:</span> {profileData.email}</p>
                            <p><span className="font-medium">Teléfono:</span> {profileData.phone}</p>
                        </div>

                        {/* Información de empresa según rol */}
                        {(profileData.role === 'sales_rep' || profileData.role === 'administrador') && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-gray-800">Información de la Empresa</h3>
                                <p><span className="font-medium">Compañía:</span> {profileData.companyName}</p>
                                <p><span className="font-medium">Dirección:</span> {profileData.businessAddress}</p>
                                <p><span className="font-medium">Empleados:</span> {profileData.numEmployees}</p>
                            </div>
                        )}

                        {/* Información de experiencia para otros roles */}
                        {(profileData.role !== 'sales_rep' && profileData.role !== 'administrador') && (
                            <div className="mt-4">
                                <h3 className="text-lg font-semibold text-gray-800">Experiencia</h3>
                                <p>{profileData.experience ? 'Sí' : 'No'}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modales */}
            {isEditModalOpen && (
                <ProfileEditModal
                    user={profileData}
                    token={token}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdateProfile={handleProfileUpdate}
                />
            )}

            {isPasswordModalOpen && (
                <PasswordChangeModal
                    onClose={() => setIsPasswordModalOpen(false)}
                />
            )}
        </div>
    );
};

export default Profile;
