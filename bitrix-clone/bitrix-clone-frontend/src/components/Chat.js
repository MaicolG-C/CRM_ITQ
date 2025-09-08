/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: Chat.jsx
Descripción: Componente React para gestionar un chat en tiempo real entre la aplicación y contactos externos.
Propósito: Permitir enviar y recibir mensajes de texto y archivos, seleccionar contactos, usar emojis y visualizar conversaciones con actualizaciones automáticas.
Dependencias:
    - react: Biblioteca principal para crear componentes y manejar estado.
    - react-icons/bs: Iconos para botones de emoji y adjuntar archivos.
    - emoji-picker-react: Selector de emojis.
    - './Chat.css': Estilos específicos del componente de chat.
*/

import React, { useState, useEffect, useRef } from 'react'; // Importa React y hooks para estado, efectos y referencias
import { BsEmojiSmile, BsPaperclip } from 'react-icons/bs'; // Iconos para emoji y adjuntar archivos
import EmojiPicker from 'emoji-picker-react'; // Selector de emojis
import './Chat.css'; // Estilos del chat

const Chat = () => {
    // Estados del componente
    const [messages, setMessages] = useState([]); // Almacena los mensajes obtenidos del backend
    const [newMessage, setNewMessage] = useState(''); // Texto del mensaje que el usuario está escribiendo
    const [loading, setLoading] = useState(false); // Estado de carga de mensajes
    const [error, setError] = useState(null); // Mensaje de error si ocurre algo
    const [contacts, setContacts] = useState([]); // Lista de contactos detectados
    const [selectedContact, setSelectedContact] = useState(null); // Contacto actualmente seleccionado
    const [showEmojiPicker, setShowEmojiPicker] = useState(false); // Controla visibilidad del selector de emojis

    // Referencias
    const scrollViewRef = useRef(null); // Referencia para el scroll del contenedor de mensajes
    const fileInputRef = useRef(null); // Referencia al input de archivos

    // Constantes
    const API_URL = 'http://localhost:5000'; // URL del backend
    const publicUrl = 'https://crmm-proyecto-final.loca.lt'; // URL pública para acceso a archivos
    const APP_USER_ID = 'mi-app'; // ID del usuario de la aplicación
    const BUSINESS_PHONE_ID = '775673135630382'; // ID del número de negocio

    // Función para generar detalles de contacto a partir de un número
    const generateContactDetails = (number) => {
        const name = `Usuario ${number.slice(-4)}`; // Nombre basado en los últimos 4 dígitos
        const initials = name.replace('Usuario ', 'U'); // Iniciales para avatar
        const avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff&rounded=true`; // URL de avatar generado
        return { name, avatarUrl }; // Retorna objeto con nombre y avatar
    };

    // --- Lógica para obtener mensajes del backend ---
    const fetchMessages = async () => {
        try {
            // Obtenemos el token del localStorage
            const token = localStorage.getItem('token');
            if (!token) {
                setError("No autorizado. Por favor, inicie sesión."); // Si no hay token, muestra error
                return;
            }

            // Llamada al backend para obtener mensajes con token en header
            const response = await fetch(`${API_URL}/api/messages`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Network response was not ok'); // Manejo de errores de red
            const data = await response.json(); // Parseamos la respuesta JSON
            setMessages(data); // Guardamos los mensajes en el estado
            setError(null); // Limpiamos errores
        } catch (err) {
            console.error('Error fetching messages:', err);
            setError('Error al cargar los mensajes.'); // Mensaje de error al usuario
        } finally {
            setLoading(false); // Finalizamos estado de carga
        }
    };

    // useEffect para obtener mensajes iniciales y refrescarlos cada 3 segundos
    useEffect(() => {
        setLoading(true); // Activamos loading
        fetchMessages(); // Llamada inicial
        const intervalId = setInterval(fetchMessages, 3000); // Intervalo de actualización
        return () => clearInterval(intervalId); // Limpieza del intervalo al desmontar
    }, []);

    // useEffect para actualizar la lista de contactos según los mensajes
    useEffect(() => {
        const externalNumbers = new Set(); // Set para evitar duplicados
        messages.forEach(msg => {
            if (msg.senderId && msg.senderId !== APP_USER_ID && msg.senderId !== BUSINESS_PHONE_ID) {
                externalNumbers.add(msg.senderId);
            }
            if (msg.recipientId && msg.recipientId !== APP_USER_ID && msg.recipientId !== BUSINESS_PHONE_ID) {
                externalNumbers.add(msg.recipientId);
            }
        });
        // Creamos el array de contactos
        const newContacts = Array.from(externalNumbers).map(number => {
            const { name, avatarUrl } = generateContactDetails(number);
            return { id: number, name, avatarUrl };
        });
        setContacts(newContacts);

        // Selección automática de primer contacto si no hay ninguno seleccionado
        if (!selectedContact && newContacts.length > 0) {
            setSelectedContact(newContacts[0]);
        } else if (selectedContact) {
            const isSelectedContactStillPresent = newContacts.some(c => c.id === selectedContact.id);
            if (!isSelectedContactStillPresent && newContacts.length > 0) {
                setSelectedContact(newContacts[0]);
            }
        }
    }, [messages]);

    // --- Lógica para enviar mensajes ---
    const handleSendMessage = async () => {
        if (newMessage.trim() === '' || !selectedContact) return; // No envía si el mensaje está vacío o no hay contacto
        const formData = new FormData();
        formData.append('to', selectedContact.id); // ID del destinatario
        formData.append('senderId', APP_USER_ID); // ID del remitente
        formData.append('text', newMessage); // Mensaje

        setNewMessage(''); // Limpiamos input
        setShowEmojiPicker(false); // Cerramos selector de emojis
        try {
            const token = localStorage.getItem('token'); // Obtenemos token
            await fetch(`${API_URL}/api/messages/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}` // Autorización
                },
                body: formData
            });
            await fetchMessages(); // Actualizamos mensajes después de enviar
        } catch (err) {
            setError('Error al enviar el mensaje.');
        }
    };

    // --- Lógica para enviar archivos ---
    const handleFilePick = async (e) => {
        if (!selectedContact) return;
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file, file.name);
        formData.append('to', selectedContact.id);
        formData.append('senderId', APP_USER_ID);
        formData.append('publicUrl', publicUrl);

        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/api/messages/send`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Error en la respuesta del servidor');
            await fetchMessages(); // Refrescamos mensajes
        } catch (err) {
            console.error("Error al subir o enviar el archivo", err);
            setError("Error al enviar el archivo.");
        } finally {
            setLoading(false);
            e.target.value = null; // Resetear input de archivo
        }
    };

    // Filtra mensajes según el contacto seleccionado
    const filteredMessages = selectedContact ? messages.filter(msg =>
        (msg.senderId === selectedContact.id && msg.recipientId === BUSINESS_PHONE_ID) ||
        (msg.senderId === APP_USER_ID && msg.recipientId === selectedContact.id)
    ) : [];

    // Scroll automático hacia el último mensaje
    useEffect(() => {
        if (scrollViewRef.current) {
            scrollViewRef.current.scrollTop = scrollViewRef.current.scrollHeight;
        }
    }, [filteredMessages]);

    // Inserta emoji en el input de mensaje
    const onEmojiClick = (emojiData) => {
        setNewMessage(prevInput => prevInput + emojiData.emoji);
    };

    // Renderiza el contenido del mensaje según tipo
    const renderMessageContent = (msg) => {
        const viewUrl = msg.mediaUrl ? `${publicUrl}/uploads/${msg.mediaUrl}` : null;
        const downloadUrl = msg.mediaUrl ? `${API_URL}/api/messages/download/${msg.mediaUrl}` : null;
        if (msg.type === 'image' && viewUrl) {
            return (
                <a href={viewUrl} target="_blank" rel="noopener noreferrer">
                    <img src={viewUrl} alt="Imagen adjunta" className="messageImage" />
                </a>
            );
        }
        if (['document', 'audio', 'video'].includes(msg.type) && downloadUrl) {
            return (
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer" className="documentContainer">
                    <span className="documentIcon">📄</span>
                    <div>
                        <p className="documentText">{msg.fileName || 'Ver Archivo'}</p>
                        <p className="downloadText">Hacer clic para descargar</p>
                    </div>
                </a>
            );
        }
        return <p>{msg.text}</p>;
    };

    return (
        <div className="container">
            {/* Panel de conversaciones */}
            <div className="conversationsPanel">
                <div className="panelHeader">
                    <h2 className="panelTitle">Conversaciones</h2>
                </div>
                <div className="conversationList">
                    {contacts.map(contact => (
                        <div
                            key={contact.id}
                            onClick={() => setSelectedContact(contact)}
                            className={`conversationItem ${selectedContact?.id === contact.id ? 'selectedConversation' : ''}`}>
                            <img src={contact.avatarUrl} alt="avatar" className="avatar" />
                            <div className="conversationDetails">
                                <p className="conversationName">{contact.name}</p>
                                <p className="conversationMessage">ID: {contact.id}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Ventana de chat */}
            <div className="chatWindow">
                <div className="chatHeader">
                    {selectedContact && <img src={selectedContact.avatarUrl} alt="header avatar" className="headerAvatar" />}
                    <h3 className="chatHeaderName">{selectedContact ? selectedContact.name : 'Selecciona un chat'}</h3>
                </div>
                <div className="messagesContainer" ref={scrollViewRef}>
                    {loading && messages.length === 0 ? (
                        <div className="loadingIndicator">Cargando...</div>
                    ) : filteredMessages.length > 0 ? (
                        filteredMessages.map((msg) => (
                            <div key={msg._id || msg.timestamp} className={`messageBubbleContainer ${msg.senderId === APP_USER_ID ? 'myMessageContainer' : 'otherMessageContainer'}`}>
                                <div className={`messageBubble ${msg.senderId === APP_USER_ID ? 'myMessageBubble' : 'otherMessageBubble'}`}>
                                    {renderMessageContent(msg)}
                                    <span className="timestamp">
                                        {new Date(msg.timestamp).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="noMessagesText">{!selectedContact ? "Selecciona una conversación para empezar" : error || "No hay mensajes en esta conversación."}</p>
                    )}
                </div>
                {/* Selector de emojis */}
                {showEmojiPicker && (
                    <div className="emojiPickerContainer">
                        <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} lazyLoadEmojis={true} />
                    </div>
                )}
                {/* Área de entrada */}
                <div className="inputArea">
                    <button onClick={() => setShowEmojiPicker(val => !val)} className="iconButton"><BsEmojiSmile size={24} /></button>
                    <button onClick={() => fileInputRef.current.click()} className="iconButton"><BsPaperclip size={24} /></button>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFilePick} 
                        style={{ display: 'none' }}
                    />
                    <input
                        type="text"
                        className="messageInput"
                        placeholder="Escribe tu mensaje aquí..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        disabled={!selectedContact}
                    />
                    <button onClick={handleSendMessage} className="sendButton" disabled={!selectedContact}>➤</button>
                </div>
            </div>
        </div>
    );
};

// Exportamos el componente para usarlo en otros módulos
export default Chat;
