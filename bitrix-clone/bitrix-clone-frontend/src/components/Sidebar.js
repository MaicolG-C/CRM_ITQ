/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Sidebar.jsx
Descripción: Componente de barra lateral de navegación del dashboard.
Propósito:
    - Proveer enlaces de navegación a las diferentes secciones del dashboard.
    - Indicar visualmente la sección activa.
    - Permitir al usuario cerrar sesión.
Dependencias:
    - react-router-dom: para navegación y detección de la ruta activa.
    - useAuth: contexto de autenticación para manejar logout.
    - react-icons/fa: iconos para UI.
*/

import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [active, setActive] = useState(null);

  // Actualiza la ruta activa cuando cambia la ubicación
  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  // Definición de enlaces de navegación
  const linkData = [
    { to: "/dashboard", label: "Dashboard", emoji: "🏠" },
    { to: "/dashboard/tasks", label: "Tareas", emoji: "✅" },
    { to: "/dashboard/projects", label: "Proyectos", emoji: "📁" },
    { to: "/dashboard/employees", label: "Empleados", emoji: "👥" },
    { to: "/dashboard/calendar", label: "Calendario", emoji: "📅" },
    { to: "/dashboard/chat", label: "Chat", emoji: "💬" },
    { to: "/dashboard/profile", label: "Mi Perfil", emoji: "👤" },
  ];

  return (
    <div className="w-64 bg-white text-black h-screen flex flex-col p-4 shadow-xl">
      {/* Logo del dashboard */}
      <div className="mb-4 flex justify-center">
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRimgV0mzMjRj0Z8U4bTioSHu0UlcoCKETlhQgEQXVICIKv1NDeiZtCWr91gik04f8jkPg&usqp=CAU"
          alt="ITQ Logo"
          className="w-20 h-20 object-contain"
        />
      </div>

      {/* Navegación */}
      <nav className="flex flex-col gap-1 flex-grow">
        {linkData.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`flex items-center p-2 rounded-lg transition-colors duration-200 
              ${active === link.to || (link.to === "/dashboard" && active === "/")
                ? "bg-red-600 text-white"
                : "text-gray-700 hover:bg-red-100 hover:text-red-600"
              }`}
          >
            <span className="mr-3 text-lg">{link.emoji}</span>
            <span className="font-medium">{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Botón de cierre de sesión */}
      <button
        onClick={logout}
        className="mt-4 flex items-center justify-center bg-red-600 text-white p-2 rounded-lg font-medium hover:bg-red-700 transition duration-200"
      >
        <FaSignOutAlt className="mr-2" />
        Cerrar sesión
      </button>
    </div>
  );
};

export default Sidebar;
