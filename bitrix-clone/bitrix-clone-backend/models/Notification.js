/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Notification.js
Descripción: Modelo de Mongoose para gestionar notificaciones dentro de la aplicación.
Propósito: Permitir almacenar notificaciones relacionadas a usuarios, indicando si han sido leídas y proporcionando enlaces relevantes.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
*/

// Importamos mongoose y extraemos Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Definimos el esquema de Notification
const NotificationSchema = new Schema({
    // Usuario al que va dirigida la notificación
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

    // Contenido del mensaje de la notificación
    message: { type: String, required: true },

    // Enlace relacionado con la notificación (ej. ruta a la acción correspondiente)
    link: { type: String, required: true },

    // Indica si la notificación ha sido leída, valor por defecto: false
    read: { type: Boolean, default: false },
}, { timestamps: true }); // Activamos timestamps para createdAt y updatedAt

// Creamos y exportamos el modelo 'Notification'
module.exports = mongoose.model('Notification', NotificationSchema);
