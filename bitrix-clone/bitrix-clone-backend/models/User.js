/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: models/User.js
Descripción: Modelo de Mongoose para gestionar usuarios en la aplicación.
Propósito: Permitir almacenar, autenticar y gestionar información de los usuarios.
Dependencias:
    - mongoose: ODM para MongoDB que permite definir esquemas y modelos.
    - bcryptjs: Para encriptar y comparar contraseñas de manera segura.
*/

// Importamos mongoose y bcryptjs
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definimos el esquema de User
const userSchema = new mongoose.Schema({
  // Nombre del usuario
  name: { type: String, required: true },

  // Apellido del usuario
  lastName: { type: String, required: true },

  // Correo electrónico único del usuario
  email: { type: String, required: true, unique: true },

  // Contraseña del usuario, se almacenará encriptada
  password: { type: String, required: true },

  // Número de teléfono del usuario
  phone: { type: String, required: true },

  // Información sobre el uso del servicio
  serviceUsage: { type: String },

  // Rol del usuario dentro del sistema (ej. admin, user)
  role: { type: String },

  // Indica si el usuario tiene experiencia previa
  experience: { type: Boolean },

  // Nombre de la empresa del usuario
  companyName: { type: String },

  // Dirección de la empresa
  businessAddress: { type: String },

  // Número de empleados de la empresa
  numEmployees: { type: String },

  // URL de la imagen de perfil del usuario, valor por defecto: placeholder
  profileImageUrl: { type: String, default: 'https://via.placeholder.com/150' },
});

// Hook que se ejecuta antes de guardar el usuario
// Sirve para encriptar la contraseña si fue modificada
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10); // Generamos un salt
    this.password = await bcrypt.hash(this.password, salt); // Encriptamos la contraseña
  }
  next(); // Continuamos con el guardado
});

// Método para comparar contraseña ingresada con la almacenada
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Creamos y exportamos el modelo 'User'
module.exports = mongoose.model('User', userSchema);
