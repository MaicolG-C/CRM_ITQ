/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Message.js
Descripción: Modelo de Mongoose para gestionar mensajes en la aplicación de mensajería.
Propósito: Almacenar información de los mensajes enviados entre usuarios, incluyendo texto, archivos y metadatos.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
*/

// Importamos mongoose para definir esquemas y modelos
const mongoose = require('mongoose');

// Definimos el esquema de Message
const messageSchema = new mongoose.Schema({
    // Tipo de mensaje (ej. 'text', 'image', 'file'), valor por defecto: 'text'
    type: { type: String, required: true, default: 'text' },

    // Contenido textual del mensaje, opcional
    text: { type: String },

    // URL de cualquier archivo multimedia adjunto, opcional
    mediaUrl: { type: String },

    // Nombre del archivo adjunto, opcional
    fileName: { type: String },

    // ID del usuario que envió el mensaje, obligatorio
    // MODIFICACIÓN: Se cambió de 'sender' a 'senderId'
    senderId: { type: String, required: true },

    // ID del usuario que recibe el mensaje, obligatorio
    // MODIFICACIÓN: Campo añadido para identificar al destinatario
    recipientId: { type: String, required: true },

    // Fecha y hora en que se envió el mensaje, valor por defecto: fecha actual
    timestamp: { type: Date, default: Date.now },
});

// Creamos y exportamos el modelo 'Message'
module.exports = mongoose.model('Message', messageSchema);
