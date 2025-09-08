/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Task.js
Descripción: Modelo de Mongoose para gestionar tareas dentro de la aplicación.
Propósito: Permitir almacenar, asignar y hacer seguimiento de tareas de empleados.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
*/

// Importamos mongoose para definir esquemas y modelos
const mongoose = require('mongoose');

// Definimos el esquema de Task
const taskSchema = new mongoose.Schema({
  // Título de la tarea
  title: { type: String, required: true },

  // Descripción detallada de la tarea
  description: { type: String },

  // Indica si la tarea ha sido completada, valor por defecto: false
  completed: { type: Boolean, default: false },

  // Estado de la tarea con valores predefinidos y valor por defecto
  status: { type: String, enum: ['Pendiente', 'En Progreso', 'Completada', 'En Revisión'], default: 'Pendiente' },

  // Empleado asignado a la tarea, referencia al modelo 'Employee'
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },

  // Prioridad de la tarea, valor por defecto: 'Media'
  priority: { type: String, enum: ['Baja', 'Media', 'Alta'], default: 'Media' },

  // Fecha límite de cumplimiento de la tarea
  dueDate: { type: Date },

  // Departamento al que pertenece la tarea
  department: { type: String },

  // Notas adicionales relacionadas con la tarea
  notes: { type: String }
}, { timestamps: true }); // Activamos timestamps para createdAt y updatedAt

// Creamos y exportamos el modelo 'Task'
module.exports = mongoose.model('Task', taskSchema);
