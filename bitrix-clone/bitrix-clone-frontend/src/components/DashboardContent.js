/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: DashboardContent.jsx
Descripción: Componente que representa el contenido principal del dashboard. Muestra información sobre proyectos, empleados, eventos, actividades y notificaciones.
Propósito: Proveer una visión centralizada de la información del usuario, incluyendo progreso de empleados, panel de notificaciones y tarjetas de proyectos, eventos y actividades.
Dependencias:
    - react: Biblioteca principal para crear componentes y manejar estado.
    - axios: Cliente HTTP para realizar peticiones al backend.
    - react-icons/fa: Iconos de la librería FontAwesome para la interfaz.
    - react-router-dom: Manejo de enlaces internos y navegación.
    - useAuth: Contexto personalizado para obtener usuario y token.
    - Componentes internos: EventCard, ProjectCard, EmployeeWorkload, ActivityFeed, NotificationPanel.
*/

import React, { useState, useEffect } from 'react'; // Hooks de React para estado y efectos
import { useAuth } from '../context/AuthContext'; // Contexto para obtener usuario y token
import axios from 'axios'; // Cliente HTTP
import { FaBell } from 'react-icons/fa'; // Icono de campana para notificaciones
import { Link } from 'react-router-dom'; // Para enlaces internos

// Componentes internos
import EventCard from './EventCard';
import ProjectCard from './ProjectCard';
import EmployeeWorkload from './EmployeeWorkload';
import ActivityFeed from './ActivityFeed';
import { NotificationPanel } from './Notifications';

// URL base del API
const API_URL = 'http://localhost:5000/api';

const DashboardContent = ({ projects, employees, events, activities, tasks }) => {
    const { user, token } = useAuth(); // Obtenemos usuario y token del contexto
    const [notifications, setNotifications] = useState([]); // Estado de notificaciones
    const [isPanelOpen, setIsPanelOpen] = useState(false); // Estado para mostrar u ocultar panel

    // Contamos notificaciones no leídas
    const unreadCount = notifications.filter(n => !n.read).length;

    // Función para obtener notificaciones desde el backend
    const fetchNotifications = async () => {
        if (!token) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_URL}/notifications`, { headers });

            // Agregamos enlaces según contenido del mensaje
            const notificationsWithLink = res.data.map(notif => {
                const message = notif.message.toLowerCase();
                let link = null;

                if (message.includes('perfil')) {
                    link = '/dashboard/employees';
                } else if (message.includes('proyecto')) {
                    link = '/dashboard/projects';
                } else if (message.includes('evento')) {
                    link = '/dashboard/calendar';
                } else if (message.includes('tarea')) {
                    link = '/dashboard/tasks';
                }

                return { ...notif, link };
            });

            setNotifications(notificationsWithLink);

        } catch (error) {
            console.error("Error al buscar notificaciones:", error);
        }
    };

    // useEffect para cargar notificaciones al montar y refrescarlas cada 15 segundos
    useEffect(() => {
        if (!token) return;
        fetchNotifications();
        const intervalId = setInterval(fetchNotifications, 15000); // Cada 15 segundos
        return () => clearInterval(intervalId);
    }, [token]);

    // Marcar todas las notificaciones como leídas
    const handleMarkAsRead = async () => {
        if (unreadCount === 0) return;
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.put(`${API_URL}/notifications/read`, {}, { headers });
            fetchNotifications(); // Refrescar después de marcar
        } catch (error) {
            console.error("Error al marcar notificaciones como leídas:", error);
        }
    };

    // Borrar todas las notificaciones
    const handleClearAllNotifications = async () => {
        try {
            const headers = { Authorization: `Bearer ${token}` };
            await axios.delete(`${API_URL}/notifications/clear`, { headers });
            fetchNotifications(); // Refrescar después de borrar
        } catch (error) {
            console.error("Error al borrar notificaciones:", error);
        }
    };

    // Abrir o cerrar panel de notificaciones
    const togglePanel = () => {
        if (!isPanelOpen && unreadCount > 0) {
            handleMarkAsRead(); // Marcar como leídas al abrir si hay no leídas
        }
        setIsPanelOpen(!isPanelOpen);
    };

    // Obtener saludo según hora del día
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Buenos días";
        if (hour < 18) return "Buenas tardes";
        return "Buenas noches";
    };

    // Si no hay usuario cargado, mostrar mensaje de carga
    if (!user) {
        return <div className="text-center text-gray-500">Cargando...</div>;
    }

    const userName = user.name || 'Invitado';

    // Configurar imagen de perfil
    let profileImageUrl = 'https://via.placeholder.com/150';
    if (user.profileImageUrl && typeof user.profileImageUrl === 'string') {
        if (user.profileImageUrl.startsWith('http')) {
            profileImageUrl = user.profileImageUrl;
        } else {
            profileImageUrl = `http://localhost:5000${user.profileImageUrl}`;
        }
    }

    return (
        <div className="p-6">
            {/* Header con saludo y notificaciones */}
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">{getGreeting()}, {userName}!</h1>
                    <p className="text-sm text-gray-500">
                        {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
                <div className="flex items-center space-x-4">
                    {/* Icono de notificaciones */}
                    <div className="relative">
                        <button onClick={togglePanel} className="text-gray-600 hover:text-red-500">
                            <FaBell size={24} />
                            {unreadCount > 0 && (
                                <span className="absolute top-0 right-0 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                            )}
                        </button>
                        {isPanelOpen && (
                            <NotificationPanel 
                                notifications={notifications} 
                                onMarkAsRead={handleMarkAsRead}
                                onClearNotifications={handleClearAllNotifications}
                                onClose={() => setIsPanelOpen(false)}
                            />
                        )}
                    </div>

                    {/* Enlace al perfil */}
                    <Link to="/dashboard/profile" title="Ir a mi perfil" className="flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-200 cursor-pointer">
                        <span className="font-semibold text-gray-700">{userName}</span>
                        <img src={profileImageUrl} alt="Perfil" className="h-10 w-10 rounded-full object-cover border-2 border-white"/>
                    </Link>
                </div>
            </header>

            {/* Contenido principal del dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Columna principal */}
                <div className="lg:col-span-2 flex flex-col space-y-6">
                    <EmployeeWorkload employees={employees} />
                    <div className="bg-white p-4 shadow-md rounded-lg">
                        <h2 className="text-lg font-semibold mb-4">Proyectos</h2>
                        {projects && projects.length > 0 ? (
                            projects.map(p => <ProjectCard key={p._id} project={p} tasks={tasks} />)
                        ) : (
                            <p className="text-gray-500">No hay proyectos que coincidan con la búsqueda.</p>
                        )}
                    </div>
                </div>

                {/* Columna lateral */}
                <div className="lg:col-span-1 flex flex-col space-y-6">
                    <EventCard events={events} />
                    <ActivityFeed activities={activities} />
                </div>
            </div>
        </div>
    );
};

// Exportamos el componente
export default DashboardContent;
