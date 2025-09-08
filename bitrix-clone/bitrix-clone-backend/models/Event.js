/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Event.js
Descripción: Modelo de Mongoose para gestionar eventos dentro de la aplicación.
Propósito: Permitir almacenar eventos, sus participantes y su información relevante.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
*/

// Importamos mongoose para definir esquemas y modelos
const mongoose = require('mongoose');

// Definimos el esquema de Event
const eventSchema = new mongoose.Schema({
    // Título del evento
    title: { type: String, required: true },

    // Descripción opcional del evento
    description: { type: String },

    // Fecha y hora del evento
    date: { type: Date, required: true },

    // Tipo de evento (ej. reunión, capacitación, etc.)
    eventType: { type: String, required: true },

    // Lista de empleados que participan en el evento
    // MODIFICACIÓN: Referencia a 'Employee' para coincidir con el frontend
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],

    // Usuario que creó el evento
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
// Activamos timestamps para createdAt y updatedAt
}, { timestamps: true });

// Creamos y exportamos el modelo 'Event'
module.exports = mongoose.model('Event', eventSchema);
