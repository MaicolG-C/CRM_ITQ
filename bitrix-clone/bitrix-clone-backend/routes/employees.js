/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/employeeRoutes.js
Descripción: Rutas para manejar los empleados dentro del sistema.
Propósito: Permitir crear, actualizar, eliminar y listar empleados, registrando actividad y enviando notificaciones.
Dependencias:
    - express: Framework para construir rutas y manejar solicitudes HTTP.
    - Employee: Modelo de Mongoose que representa a los empleados.
    - Notification: Modelo de Mongoose para enviar notificaciones a los usuarios.
    - Activity: Modelo de Mongoose que registra acciones de los usuarios.
    - authMiddleware: Middleware para proteger rutas mediante JWT.
    - multer: Middleware para manejar subida de archivos.
*/

// Importamos Router de Express para crear rutas modulares
const router = require('express').Router();

// Importamos el modelo Employee para interactuar con los empleados en MongoDB
const Employee = require('../models/Employee');

// Importamos el modelo Notification para crear notificaciones relacionadas a acciones
const Notification = require('../models/Notification');

// Importamos el modelo Activity para registrar el historial de acciones de los usuarios
const Activity = require('../models/Activity'); 

// Importamos middleware de autenticación para proteger rutas con JWT
const auth = require('../middleware/authMiddleware');

// Importamos multer para gestionar la subida de archivos (imágenes de perfil)
const multer = require('multer');

// Configuración de almacenamiento de multer
const storage = multer.diskStorage({
  // Carpeta donde se guardan los archivos subidos
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  // Nombre que tendrá el archivo subido, usando timestamp para evitar duplicados
  filename: (req, file, cb) => { cb(null, `${Date.now()}-${file.originalname}`); }
});

// Inicializamos multer con la configuración de storage
const upload = multer({ storage: storage });

/* ========================================================
   RUTA: GET '/'
   Descripción: Obtener todos los empleados
========================================================= */
router.get('/', auth, async (req, res) => {
  try {
    // Traemos todos los empleados y excluimos la contraseña
    const employees = await Employee.find().select('-password');
    // Respondemos con la lista de empleados
    res.json(employees); 
  } catch (err) { 
    // Error en servidor, respondemos con estado 500
    res.status(500).json({ message: err.message }); 
  }
});

/* ========================================================
   RUTA: POST '/'
   Descripción: Crear un nuevo empleado y subir su imagen de perfil
========================================================= */
router.post('/', auth, upload.single('profileImage'), async (req, res) => {
  try {
    // Desestructuramos los datos recibidos en el body
    const { name, email, password, gender, birthday, role } = req.body;

    // Obtenemos la URL de la imagen si se subió un archivo
    let profileImageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Creamos un nuevo empleado con los datos recibidos
    const newEmployee = new Employee({ name, email, password, gender, birthday, role, profileImageUrl });
    // Guardamos en la base de datos
    await newEmployee.save(); 

    // --- Crear Notificación para el usuario que crea el empleado ---
    const notification = new Notification({
        user: req.user.id,
        message: `El empleado ${newEmployee.name} ha sido añadido.`,
        link: `/dashboard/employees`
    });
    await notification.save();

    // --- Registrar actividad en el historial ---
    await new Activity({
        user: req.user.id,
        description: `creó al nuevo empleado "${newEmployee.name}".`
    }).save();

    // Respondemos con el empleado creado y status 201
    res.status(201).json(newEmployee);
  } catch (err) {
    // Error al crear empleado, respondemos con estado 400
    res.status(400).json({ message: err.message }); 
  }
});

/* ========================================================
   RUTA: PUT '/:id'
   Descripción: Actualizar un empleado existente y su imagen
========================================================= */
router.put('/:id', auth, upload.single('profileImage'), async (req, res) => {
    try {
        // Buscamos al empleado por ID
        const employeeToUpdate = await Employee.findById(req.params.id);
        if (!employeeToUpdate) return res.status(404).json({ message: 'Empleado no encontrado' });

        // Preparamos los datos a actualizar
        const updates = req.body;
        if (req.file) updates.profileImageUrl = `/uploads/${req.file.filename}`; // Si hay imagen, agregamos

        // Actualizamos al empleado y obtenemos el documento actualizado
        const updatedEmployee = await Employee.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        // --- Crear Notificación sobre la actualización ---
        const notification = new Notification({
            user: req.user.id,
            message: `El perfil de ${updatedEmployee.name} ha sido actualizado.`,
            link: `/dashboard/employees`
        });
        await notification.save();

        // --- Registrar actividad de actualización ---
        await new Activity({
            user: req.user.id,
            description: `actualizó el perfil del empleado "${updatedEmployee.name}".`
        }).save();

        // Respondemos con los datos actualizados
        res.json(updatedEmployee); 
    } catch (err) {
        // Error en servidor
        res.status(500).json({ message: err.message }); 
    }
});

/* ========================================================
   RUTA: DELETE '/:id'
   Descripción: Eliminar un empleado por su ID
========================================================= */
router.delete('/:id', auth, async (req, res) => {
    try {
        // Buscamos al empleado por ID
        const employeeToDelete = await Employee.findById(req.params.id);
        if (!employeeToDelete) return res.status(404).json({ message: 'Empleado no encontrado' });

        // Eliminamos al empleado
        await Employee.findByIdAndDelete(req.params.id);

        // --- Crear Notificación sobre la eliminación ---
        const notification = new Notification({
            user: req.user.id,
            message: `El empleado ${employeeToDelete.name} ha sido eliminado.`,
            link: `/dashboard/employees`
        });
        await notification.save();

        // --- Registrar actividad de eliminación ---
        await new Activity({
            user: req.user.id,
            description: `eliminó al empleado "${employeeToDelete.name}".`
        }).save();

        // Respondemos con mensaje de confirmación
        res.json({ message: 'Empleado eliminado' });
    } catch (err) {
        // Error en servidor
        res.status(500).json({ message: err.message }); 
    }
});

// Exportamos el router para usarlo en la aplicación principal
module.exports = router;
