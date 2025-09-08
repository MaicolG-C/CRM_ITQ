/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: NotificationToast.jsx / NotificationPanel.jsx
Descripción: Componentes React para mostrar notificaciones de la aplicación.
Propósito: 
    - NotificationToast: Mostrar una notificación temporal tipo "toast" con un mensaje y enlace opcional.
    - NotificationPanel: Panel de notificaciones persistente que permite marcar como leídas, limpiar todas y ver detalles.
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - react-router-dom: Para manejar enlaces internos con el componente Link.
    - react-icons/fa: Para íconos de la interfaz (alertas, cerrar, limpiar, etc.).
*/

import React from 'react';
import { Link } from 'react-router-dom';
import { FaBellSlash, FaTrashAlt } from 'react-icons/fa';

/* 
  Componente NotificationToast
  Props:
    - notification: objeto con la notificación { _id, message, link, createdAt }
    - onClose: función para cerrar el toast
  Descripción: Muestra una notificación tipo "toast" con un ícono, mensaje y enlace opcional.
*/
export const NotificationToast = ({ notification, onClose }) => {
    // Determinar si la notificación tiene un enlace activo
    const linkPath = notification.link || '#';
    const isLinkActive = notification.link && notification.link !== '#';

    return (
        <div className="bg-white rounded-lg shadow-xl p-4 m-4 w-80 animate-fade-in-right">
            <div className="flex items-start">
                <div className="flex-shrink-0">
                    {/* Icono de confirmación */}
                    <svg className="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                    <p className="text-sm font-medium text-gray-900">Nueva Notificación</p>
                    <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
                    {isLinkActive && (
                        <Link to={linkPath} className="text-sm text-blue-500 hover:underline" onClick={onClose}>
                            Ver ahora
                        </Link>
                    )}
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                    {/* Botón para cerrar el toast */}
                    <button onClick={onClose} className="bg-white rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none">
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

/* 
  Componente NotificationPanel
  Props:
    - notifications: lista de notificaciones [{ _id, message, link, read, createdAt }]
    - onMarkAsRead: función para marcar todas las notificaciones como leídas
    - onClearNotifications: función para limpiar todas las notificaciones
    - onClose: función para cerrar el panel al hacer click en un enlace
  Descripción: Panel flotante que muestra todas las notificaciones con acciones para administrar su estado.
*/
export const NotificationPanel = ({ notifications, onMarkAsRead, onClearNotifications, onClose }) => {
    // Filtramos las notificaciones no leídas
    const unreadNotifications = notifications.filter(n => !n.read);

    return (
        <div className="absolute top-16 right-0 w-80 bg-white rounded-lg shadow-lg z-20" onClick={(e) => e.stopPropagation()}>
            {/* Encabezado con título y opción para marcar todas como leídas */}
            <div className="p-4 flex justify-between items-center border-b">
                <h3 className="font-semibold">Notificaciones</h3>
                {unreadNotifications.length > 0 && (
                    <button onClick={onMarkAsRead} className="text-sm text-red-600 hover:underline">
                        Marcar todas como leídas
                    </button>
                )}
            </div>

            {/* Botón para limpiar todas las notificaciones */}
            {notifications.length > 0 && (
                <div className="p-2 border-b">
                    <button
                        onClick={onClearNotifications}
                        className="w-full text-red-500 hover:text-red-700 flex items-center justify-center space-x-2 transition-colors duration-200"
                    >
                        <FaTrashAlt />
                        <span>Limpiar todas</span>
                    </button>
                </div>
            )}

            {/* Lista de notificaciones */}
            <div className="max-h-96 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map(notif => (
                        <div key={notif._id} className={`p-4 border-b hover:bg-gray-50 ${!notif.read ? 'bg-red-50' : ''}`}>
                            {notif.link ? (
                                <Link to={notif.link} onClick={onClose} className="block">
                                    <p className="text-sm text-gray-700">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                </Link>
                            ) : (
                                <>
                                    <p className="text-sm text-gray-700">{notif.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notif.createdAt).toLocaleString()}</p>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <FaBellSlash className="mx-auto text-4xl text-gray-300 mb-2"/>
                        <p>No tienes notificaciones.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
