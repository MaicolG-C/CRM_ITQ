/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Activity.js
Descripción: Modelo de Mongoose para registrar actividades de usuarios en la aplicación.
Propósito: Permitir almacenar y consultar acciones realizadas por los usuarios.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
*/

// Importamos mongoose para trabajar con MongoDB
const mongoose = require('mongoose');

// Definimos el esquema de actividades
const activitySchema = new mongoose.Schema({
    // Referencia al usuario que realizó la acción
    // MODIFICACIÓN: Se usa 'user' en lugar de 'employee' para mayor claridad
    user: {
        type: mongoose.Schema.Types.ObjectId,
        // Referencia al modelo 'User' para vincular la actividad con un usuario
        ref: 'User', 
        required: true
    },
    // Descripción de la actividad realizada por el usuario
    description: {
        type: String,
        required: true
    },
    // Fecha y hora de registro de la actividad
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Creamos el modelo 'Activity' basado en el esquema definido
const Activity = mongoose.model('Activity', activitySchema);

// Exportamos el modelo para usarlo en otros módulos
module.exports = Activity;
