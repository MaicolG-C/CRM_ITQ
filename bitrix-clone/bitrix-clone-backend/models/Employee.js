/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/Employee.js
Descripción: Modelo de Mongoose para la gestión de empleados en la aplicación.
Propósito: Permitir almacenar, autenticar y gestionar información de empleados.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
    - bcryptjs: Para encriptar y comparar contraseñas de manera segura.
*/

// Importamos mongoose y bcryptjs
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definimos el esquema de Employee
const employeeSchema = new mongoose.Schema({
  // Nombre completo del empleado
  name: { type: String, required: true },

  // Correo electrónico único del empleado
  email: { type: String, required: true, unique: true },

  // Contraseña del empleado, se almacenará encriptada
  password: { type: String, required: true },

  // Género del empleado
  gender: { type: String, enum: ['Masculino', 'Femenino', 'Otro'] },

  // Fecha de nacimiento del empleado
  birthday: { type: Date },

  // Edad del empleado
  age: { type: Number },

  // Rol del empleado dentro del sistema (ej. admin, user)
  role: { type: String },

  // URL de la imagen de perfil del empleado
  profileImageUrl: { type: String }
});

// Hook que se ejecuta antes de guardar el empleado
employeeSchema.pre('save', async function(next){
  // Solo encriptamos la contraseña si fue modificada
  if(!this.isModified('password')) return next();

  // Generamos un salt para aumentar la seguridad de la contraseña
  const salt = await bcrypt.genSalt(10);

  // Encriptamos la contraseña con el salt
  this.password = await bcrypt.hash(this.password, salt);

  // Continuamos con el guardado
  next();
});

// Método para comparar contraseña ingresada con la almacenada
employeeSchema.methods.comparePassword = function(password){
  return bcrypt.compare(password, this.password);
};

// Creamos y exportamos el modelo 'Employee'
module.exports = mongoose.model('Employee', employeeSchema);
