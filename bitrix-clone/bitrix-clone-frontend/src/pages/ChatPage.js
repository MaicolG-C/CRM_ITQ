/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: ChatPage.jsx
Descripción: Página principal de chat de la aplicación.
Propósito: Mostrar la interfaz de chat completa, incluyendo la barra lateral (Sidebar) y el área de conversación (Chat).
Dependencias:
    - react: Biblioteca principal para crear componentes.
    - Sidebar: Componente que representa la barra lateral de navegación o funcionalidades adicionales.
    - Chat: Componente que representa la ventana de conversación principal.
*/

import React from 'react';
import Sidebar from '../components/Sidebar';
import Chat from '../components/Chat';

const ChatPage = () => {
  return (
    <div className="app-container"> {/* Contenedor principal de la página de chat */}
      <Sidebar /> {/* Barra lateral con navegación o funcionalidades */}
      <div className="content-container"> {/* Contenedor principal del chat */}
        <Chat /> {/* Componente que maneja la conversación */}
      </div>
    </div>
  );
};

export default ChatPage;
