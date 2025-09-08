/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Project.js
Descripción: Modelo de Mongoose para gestionar proyectos dentro de la aplicación.
Propósito: Almacenar información de proyectos, incluyendo fechas, estado, prioridad, miembros, solicitantes y documentos asociados.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
*/

// Importamos mongoose para definir esquemas y modelos
const mongoose = require('mongoose');

// Definimos el esquema de Project usando mongoose.Schema
const projectSchema = new mongoose.Schema({
  // Nombre del proyecto, obligatorio
  name: { type: String, required: true },
  
  // Descripción opcional del proyecto
  description: { type: String },
  
  // Fecha de inicio, por defecto la fecha actual
  startDate: { type: Date, default: Date.now },
  
  // Fecha de fin del proyecto, opcional
  endDate: { type: Date },
  
  // Estado del proyecto con valores predefinidos y valor por defecto
  status: { 
    type: String, 
    enum: ['Pendiente', 'En Proceso', 'Completado', 'En Revisión'], 
    default: 'Pendiente' 
  },
  
  // Prioridad del proyecto con valores predefinidos y valor por defecto
  priority: { 
    type: String, 
    enum: ['Baja', 'Media', 'Alta'], 
    default: 'Media' 
  },
  
  // Departamento encargado, opcional
  department: { type: String },
  
  // Usuario que creó el proyecto, referencia al modelo 'User'
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  
  // Lista de empleados asignados al proyecto, referencia al modelo 'Employee'
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
  
  // Lista de estudiantes solicitantes o involucrados, referencia al modelo 'Student'
  applicants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  
  // Documentos asociados al proyecto
  documents: [{ 
    // Nombre del documento
    name: String, 
    // URL del documento
    url: String, 
    // Fecha de subida, por defecto la fecha actual
    uploadedAt: { type: Date, default: Date.now } 
  }]
// Activamos timestamps para createdAt y updatedAt
}, { timestamps: true });

// Creamos y exportamos el modelo 'Project' basado en el esquema definido
module.exports = mongoose.model('Project', projectSchema);
