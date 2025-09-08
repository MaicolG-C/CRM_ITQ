/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Lead.js
Descripción: Modelo de Mongoose para gestionar clientes potenciales (leads) en la aplicación.
Propósito: Permitir almacenar, asignar y dar seguimiento a leads.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
*/

// Importamos mongoose para definir esquemas y modelos
const mongoose = require('mongoose');

// Definimos el esquema de Lead
const leadSchema = new mongoose.Schema({
  // Nombre del lead
  name: { type: String, required: true },

  // Correo electrónico del lead
  email: { type: String, required: true },

  // Número de teléfono del lead
  phone: { type: String, required: true },

  // Estado del lead con valores predefinidos y valor por defecto
  status: { type: String, enum: ['new', 'contacted', 'closed'], default: 'new' },

  // Usuario asignado para dar seguimiento al lead
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }); // Activamos timestamps para createdAt y updatedAt

// Creamos y exportamos el modelo 'Lead'
module.exports = mongoose.model('Lead', leadSchema);
