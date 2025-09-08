/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Dashboard.jsx
Descripción: Componente principal del dashboard de la aplicación. Gestiona la visualización de proyectos, empleados, eventos, tareas, actividades y otras secciones mediante rutas.
Propósito: Permitir al usuario ver y filtrar información de manera centralizada, navegar entre secciones como tareas, proyectos, calendario, chat y perfil, y mantener los datos actualizados en tiempo real.
Dependencias:
    - react: Biblioteca principal para crear componentes y manejar estado.
    - react-router-dom: Manejo de rutas y navegación dentro de la aplicación.
    - axios: Cliente HTTP para realizar peticiones al backend.
    - useAuth: Contexto personalizado para obtener datos del usuario y token de autenticación.
    - Componentes internos: Sidebar, SearchBar, DashboardContent, Tasks, Projects, Leads, Employees, Calendar, Chat, Profile.
*/

import { useState, useEffect } from "react"; // Hooks de React para estado y efectos
import { Routes, Route } from "react-router-dom"; // Para definir rutas dentro del dashboard
import axios from 'axios'; // Cliente HTTP para solicitudes al backend
import { useAuth } from '../context/AuthContext'; // Contexto para manejar usuario y token

// Componentes del dashboard
import Sidebar from "./Sidebar"; 
import SearchBar from "./SearchBar";
import DashboardContent from "./DashboardContent";
import Tasks from "./Tasks";
import Projects from "./Projects";
import Leads from "./Leads";
import Employees from "./Employees";
import Calendar from "./Calendar";
import Chat from "./Chat";
import Profile from "./Profile";

// URL base del API
const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
    const { user, token } = useAuth(); // Obtenemos usuario y token desde el contexto de autenticación
    const [search, setSearch] = useState(""); // Estado para almacenar texto de búsqueda

    // Estados para almacenar los datos obtenidos del backend
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [events, setEvents] = useState([]);
    const [activities, setActivities] = useState([]);
    const [tasks, setTasks] = useState([]);

    const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado para forzar actualización de datos

    // Función para actualizar dashboard desde subcomponentes
    const handleDashboardUpdate = () => {
        setRefreshTrigger(prev => prev + 1); // Incrementa trigger para activar useEffect
    };

    // useEffect para cargar todos los datos al montar el componente y al cambiar refreshTrigger o token
    useEffect(() => {
        const fetchAllData = async () => {
            if (!token) return; // Si no hay token, no hacer peticiones
            try {
                const headers = { Authorization: `Bearer ${token}` }; // Configuración de headers con token
                // Realizamos peticiones concurrentes a todas las rutas necesarias
                const [projectsRes, employeesRes, eventsRes, activitiesRes, tasksRes] = await Promise.all([
                    axios.get(`${API_URL}/projects`, { headers }),
                    axios.get(`${API_URL}/employees`, { headers }),
                    axios.get(`${API_URL}/events`, { headers }),
                    axios.get(`${API_URL}/activities`, { headers }),
                    axios.get(`${API_URL}/tasks`, { headers }),
                ]);

                // Guardamos los datos obtenidos en sus respectivos estados
                setProjects(projectsRes.data);
                setActivities(activitiesRes.data);
                setEvents(eventsRes.data);
                setTasks(tasksRes.data);

                // Calculamos el progreso de cada empleado según sus tareas completadas
                const employeesWithProgress = (employeesRes.data || []).map(employee => {
                    const employeeTasks = (tasksRes.data || []).filter(task => task.assignedTo?._id === employee._id);
                    const completedTasks = employeeTasks.filter(task => task.status === 'Completada' || task.status === 'resuelto').length;
                    const totalTasks = employeeTasks.length;
                    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                    return { ...employee, progress: Math.round(progress) }; // Redondeamos progreso
                });
                setEmployees(employeesWithProgress); // Guardamos empleados con progreso

            } catch (error) {
                console.error('Error al cargar datos del dashboard:', error); // Manejo de errores
            }
        };
        fetchAllData();
    }, [token, refreshTrigger]); // Dependencias: token y trigger de actualización

    // Función para actualizar el estado de búsqueda
    const handleSearch = (query) => {
        setSearch(query); // Guardamos el texto de búsqueda ingresado
    };

    const lowercasedSearch = search.toLowerCase(); // Convertimos búsqueda a minúsculas para comparación

    // Filtrado de proyectos según texto de búsqueda
    const filteredProjects = projects.filter(project =>
        project.name.toLowerCase().includes(lowercasedSearch) ||
        project.description.toLowerCase().includes(lowercasedSearch)
    );

    // Filtrado de empleados según nombre o rol
    const filteredEmployees = employees.filter(employee =>
        employee.name.toLowerCase().includes(lowercasedSearch) ||
        employee.role.toLowerCase().includes(lowercasedSearch)
    );

    // Filtrado de eventos según título o descripción
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(lowercasedSearch) ||
        event.description.toLowerCase().includes(lowercasedSearch)
    );

    // Filtrado de actividades según nombre de usuario o descripción
    const filteredActivities = activities.filter(activity =>
        (activity.user?.name && activity.user.name.toLowerCase().includes(lowercasedSearch)) ||
        (activity.description && activity.description.toLowerCase().includes(lowercasedSearch))
    );

    return (
        <div className="flex h-screen"> {/* Contenedor principal con flex y altura completa */}
            <Sidebar /> {/* Barra lateral */}
            <div className="flex-1 p-6 bg-gray-100 overflow-y-auto relative"> {/* Contenedor del contenido principal */}
                <SearchBar onSearch={handleSearch} /> {/* Barra de búsqueda */}
                <Routes> {/* Definición de rutas del dashboard */}
                    <Route 
                        index 
                        element={<DashboardContent 
                            projects={filteredProjects}
                            employees={filteredEmployees}
                            events={filteredEvents}
                            activities={filteredActivities}
                            tasks={tasks}
                        />} 
                    />
                    <Route path="tasks" element={<Tasks search={search} onUpdateDashboard={handleDashboardUpdate} />} />
                    <Route path="projects" element={<Projects search={search} onUpdateDashboard={handleDashboardUpdate} />} />
                    <Route path="leads" element={<Leads search={search} onUpdateDashboard={handleDashboardUpdate} />} />
                    <Route path="employees" element={<Employees search={search} onUpdateDashboard={handleDashboardUpdate} />} />
                    <Route path="calendar" element={<Calendar search={search} onUpdateDashboard={handleDashboardUpdate} />} />
                    <Route path="chat" element={<Chat />} />
                    <Route path="profile" element={<Profile onUpdateDashboard={handleDashboardUpdate} />} />
                </Routes>
            </div>
        </div>
    );
};

// Exportamos el componente para usarlo en otros módulos
export default Dashboard;
