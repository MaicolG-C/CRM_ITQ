/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: ProjectCard.jsx
Descripción: Componente que renderiza la información resumida de un proyecto.
Propósito:
    - Mostrar el nombre, fecha de creación y datos estadísticos de un proyecto.
    - Mostrar la cantidad de tareas totales y activas.
    - Listar los miembros asignados al proyecto con su imagen de perfil.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-icons/fa: Para mostrar íconos de usuario cuando no hay imagen disponible.
Props:
    - project: Objeto con la información del proyecto.
    - tasks: Arreglo opcional de tareas asociadas a proyectos, por defecto vacío.
*/

import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const ProjectCard = ({ project, tasks = [] }) => {
    // Filtrar las tareas asociadas al proyecto actual
    const projectTasks = tasks.filter(task => task.project === project._id);
    const totalTasks = projectTasks.length;
    const activeTasks = projectTasks.filter(t => t.status !== 'Completado' && t.status !== 'Completada').length;

    // Obtener la URL de la imagen del miembro
    const getImageUrl = (url) => {
        if (url) return `http://localhost:5000${url}`;
        return null;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center p-4 mb-2 bg-gray-50 rounded-lg shadow-sm">
            {/* Información básica del proyecto */}
            <div className="col-span-1">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-200 flex-shrink-0"></div> 
                    <div>
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-xs text-gray-500">
                            Creado {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Datos estadísticos del proyecto */}
            <div className="col-span-1">
                <p className="text-sm text-gray-600 font-medium">Datos del proyecto</p>
                <div className="flex space-x-4 text-xs mt-1">
                    <p>Total tareas: <span className="font-bold">{totalTasks}</span></p>
                    <p>Tareas activas: <span className="font-bold">{activeTasks}</span></p>
                </div>
            </div>

            {/* Miembros asignados */}
            <div className="col-span-1">
                <p className="text-sm text-gray-600 font-medium">Encargados</p>
                <div className="flex items-center">
                    {project.members && project.members.length > 0 ? (
                        <div className="flex -space-x-2">
                            {project.members.map((member) => {
                                const imageUrl = getImageUrl(member.profileImageUrl);
                                return (
                                    imageUrl ? (
                                        <img 
                                            key={member._id}
                                            className="w-8 h-8 rounded-full border-2 border-white object-cover"
                                            src={imageUrl}
                                            alt={member.name}
                                            title={member.name}
                                        />
                                    ) : (
                                        <FaUserCircle
                                            key={member._id}
                                            className="w-8 h-8 rounded-full border-2 border-white text-gray-400 bg-white"
                                            title={member.name}
                                        />
                                    )
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-500">Sin asignar</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectCard;
