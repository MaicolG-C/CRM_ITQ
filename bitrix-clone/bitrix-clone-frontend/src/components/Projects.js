/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Projects.jsx
Descripción: Componente principal que muestra la lista de proyectos, permite añadir o editar proyectos y visualiza detalles.
Propósito:
    - Cargar proyectos y usuarios desde la API.
    - Filtrar proyectos según la búsqueda.
    - Mostrar detalles del proyecto seleccionado.
    - Abrir el modal para añadir o editar proyectos.
Dependencias:
    - react: Para manejar estados y efectos.
    - react-icons/fa: Para íconos de usuario y botones.
    - ProjectModal: Componente modal para crear o editar proyectos.
    - api: Cliente para las llamadas HTTP a la API.
Props:
    - search: String para filtrar proyectos por nombre.
    - onUpdateDashboard: Función opcional para actualizar información en un dashboard externo.
*/

import { useEffect, useState } from "react";
import api from "../api";
import ProjectModal from "./ProjectModal";
import { FaUserCircle, FaPlus } from "react-icons/fa";

const Projects = ({ search, onUpdateDashboard }) => {
    const [projects, setProjects] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    // Cargar proyectos y usuarios desde la API
    const fetchData = async () => {
        try {
            const [projectsRes, usersRes] = await Promise.all([
                api.get("/projects"),
                api.get("/employees")
            ]);

            const sortedProjects = projectsRes.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setProjects(sortedProjects);
            setAllUsers(usersRes.data);

            if (selectedProject) {
                const updatedSelectedProject = sortedProjects.find(p => p._id === selectedProject._id);
                setSelectedProject(updatedSelectedProject || null);
            }

        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Guardar proyecto (nuevo o editado)
    const handleSaveProject = async (projectData) => {
        try {
            let savedProjectResponse;
            if (isEditing) {
                const res = await api.put(`/projects/${selectedProject._id}`, projectData);
                savedProjectResponse = res.data;
            } else {
                const res = await api.post("/projects", projectData);
                savedProjectResponse = res.data;
            }

            setIsEditing(false);
            setIsModalOpen(false);
            await fetchData();
            setSelectedProject(savedProjectResponse);

            if (onUpdateDashboard) {
                onUpdateDashboard();
            }

        } catch (error) {
            console.error("Error saving project:", error);
            alert("Error al guardar el proyecto. Inténtalo de nuevo.");
        }
    };

    // Abrir modal para editar proyecto
    const handleEditClick = (project) => {
        setSelectedProject(project);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    // Obtener URL de imagen
    const getImageUrl = (url) => url ? `http://localhost:5000${url}` : null;

    // Filtrar proyectos según búsqueda
    const filtered = projects.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg mx-auto max-w-7xl">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-3xl text-gray-800">Proyectos</h3>
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setSelectedProject(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-red-600 text-white p-3 rounded-lg hover:bg-red-700 transition duration-300 font-semibold flex items-center gap-2"
                >
                    <FaPlus /> Añadir Proyectos
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Lista de Proyectos */}
                <div className="md:col-span-1">
                    <h4 className="font-bold text-xl text-gray-800 mb-4">Proyectos Actuales</h4>
                    <ul className="space-y-2 overflow-y-auto max-h-[calc(100vh-10rem)] pr-2">
                        {filtered.map((p) => (
                            <li
                                key={p._id}
                                onClick={() => setSelectedProject(p)}
                                className={`py-3 px-4 rounded-lg cursor-pointer transition-colors duration-200 ${
                                    selectedProject && selectedProject._id === p._id
                                        ? "bg-red-100 border-l-4 border-red-600"
                                        : "hover:bg-gray-100"
                                }`}
                            >
                                <div className="text-gray-500 text-sm">PN0001245</div>
                                <strong className="block text-lg font-semibold">{p.name}</strong>
                                <button className="text-sm text-red-500 mt-1 hover:underline">Ver Detalles &gt;</button>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Detalles del Proyecto Seleccionado */}
                <div className="md:col-span-2 p-6 border rounded-lg shadow-inner bg-gray-50">
                    {selectedProject ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6 border-b pb-4">
                                <div>
                                    <h4 className="font-bold text-2xl text-gray-800">{selectedProject.name}</h4>
                                    <div className="text-sm text-gray-500 mt-1">PN0001245</div>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium px-3 py-1 rounded-full bg-yellow-100 text-yellow-800">
                                        {selectedProject.status || 'Pendiente'}
                                    </span>
                                    <button onClick={() => handleEditClick(selectedProject)} className="text-gray-500 hover:text-gray-800">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232a2.5 2.5 0 013.536 3.536L6.5 21.036H3v-3.572L15.232 5.232z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Descripción */}
                                <div>
                                    <h5 className="font-semibold text-lg text-gray-700">Descripción</h5>
                                    <p className="text-gray-600 mt-2">{selectedProject.description || "Sin descripción."}</p>
                                </div>

                                {/* Info Proyecto y Encargados */}
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h5 className="font-semibold text-lg text-gray-700">Info Proyecto</h5>
                                        <ul className="space-y-2 mt-2 text-gray-600 text-sm">
                                            <li><span className="font-medium text-gray-700">Prioridad:</span> {selectedProject.priority}</li>
                                            <li><span className="font-medium text-gray-700">Inicio:</span> {new Date(selectedProject.startDate).toLocaleDateString()}</li>
                                            <li><span className="font-medium text-gray-700">Fin:</span> {new Date(selectedProject.endDate).toLocaleDateString()}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-semibold text-lg text-gray-700">Encargados</h5>
                                        <div className="flex items-center mt-2">
                                            {selectedProject.members && selectedProject.members.length > 0 ? (
                                                <div className="flex -space-x-2">
                                                    {selectedProject.members.map((member) => {
                                                        const imageUrl = getImageUrl(member.profileImageUrl);
                                                        return (
                                                            imageUrl ?
                                                            <img key={member._id} className="w-10 h-10 rounded-full border-2 border-white object-cover" src={imageUrl} alt={member.name} title={member.name} />
                                                            : <FaUserCircle key={member._id} className="w-10 h-10 rounded-full border-2 border-white text-gray-400 bg-white" title={member.name} />
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">Sin asignar</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Sección Tareas */}
                            <div className="mt-8">
                                <h5 className="font-semibold text-xl text-gray-700">Tareas</h5>
                                <p className="text-gray-500 mt-2">Aquí se mostraría la lista de tareas del proyecto.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500 text-center text-lg">Selecciona un proyecto para ver sus detalles.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Crear/Editar Proyecto */}
            <ProjectModal
                isOpen={isModalOpen}
                onRequestClose={() => setIsModalOpen(false)}
                onSave={handleSaveProject}
                initialData={isEditing ? selectedProject : null}
                allUsers={allUsers}
            />
        </div>
    );
};

export default Projects;
