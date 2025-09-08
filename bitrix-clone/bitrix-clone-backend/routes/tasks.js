/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/taskRoutes.js
Descripción: Rutas para manejar las tareas dentro del sistema.
Propósito: Permitir crear, actualizar, eliminar y listar tareas, registrando actividad y enviando notificaciones.
Dependencias:
    - express: Framework para construir rutas y manejar solicitudes HTTP.
    - Task: Modelo de Mongoose que representa una tarea.
    - Activity: Modelo de Mongoose que registra acciones de los usuarios.
    - Notification: Modelo de Mongoose que permite enviar notificaciones a los usuarios.
    - authMiddleware: Middleware para proteger rutas mediante JWT.
*/

// Importamos Router de Express para crear rutas modulares
const router = require('express').Router();

// Importamos el modelo Task para interactuar con las tareas en la base de datos
const Task = require('../models/Task');

// Importamos el modelo Activity para registrar el historial de acciones de los usuarios
const Activity = require('../models/Activity');

// Importamos middleware de autenticación para proteger rutas con JWT
const authMiddleware = require('../middleware/authMiddleware');

// Importamos el modelo Notification para enviar notificaciones sobre cambios en tareas
const Notification = require('../models/Notification');

/* ========================================================
   RUTA: GET '/'
   Descripción: Obtener todas las tareas
========================================================= */
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Buscamos todas las tareas y poblamos el campo 'assignedTo'
    // Mostramos solo 'name', 'role' y 'profileImageUrl' del usuario asignado
    const tasks = await Task.find().populate('assignedTo', 'name role profileImageUrl');

    // Respondemos con la lista de tareas en formato JSON
    res.json(tasks);
  } catch (err) {
    // En caso de error en el servidor, enviamos un estado 500 con mensaje
    res.status(500).json({ message: err.message });
  }
});

/* ========================================================
   RUTA: POST '/'
   Descripción: Crear una nueva tarea
========================================================= */
router.post('/', authMiddleware, async (req, res) => {
  try {
    // Desestructuramos los datos recibidos en el body
    const { title, description, priority, dueDate, department, notes, assignedTo } = req.body;

    // Creamos un nuevo objeto Task con los datos recibidos
    const task = new Task({
      title,
      description: description || "",             // Si no hay descripción, dejamos vacío
      priority: priority || "Media",              // Por defecto prioridad "Media"
      dueDate: dueDate ? new Date(dueDate) : null,// Convertimos a Date si se recibe
      department: department || "Admisiones",    // Por defecto "Admisiones"
      notes: notes || "",                         // Notas adicionales vacías si no se envían
      assignedTo: assignedTo || null,            // Usuario asignado (opcional)
      createdBy: req.user.id                      // Usuario que crea la tarea
    });

    // Guardamos la tarea en la base de datos
    await task.save();

    // --- Registrar actividad en la colección Activity ---
    await new Activity({ user: req.user.id, description: `creó la tarea "${task.title}".` }).save();

    // --- Crear notificación para el usuario ---
    const newNotification = new Notification({
      user: req.user.id,
      message: `Has creado la nueva tarea: "${task.title}"`,
      link: '/dashboard/tasks'
    });
    await newNotification.save();

    // Log para seguimiento en consola
    console.log('--- Nueva Tarea Creada ---');
    console.log(task);
    console.log('-------------------------');

    // Respondemos con la tarea creada y status 201
    res.status(201).json(task);
  } catch (err) {
    // Error al crear la tarea, enviamos estado 400
    res.status(400).json({ message: err.message });
  }
});

/* ========================================================
   RUTA: PUT '/:id'
   Descripción: Actualizar una tarea existente por su ID
========================================================= */
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    // Buscamos la tarea antes de actualizarla para verificar que existe
    const taskBeforeUpdate = await Task.findById(req.params.id);
    if (!taskBeforeUpdate) return res.status(404).json({ message: 'Tarea no encontrada' });

    // Actualizamos la tarea con los datos recibidos en req.body
    // La opción { new: true } devuelve el documento actualizado
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });

    // --- Registrar actividad de actualización ---
    await new Activity({ user: req.user.id, description: `actualizó la tarea "${task.title}".` }).save();

    // --- Crear notificación sobre la actualización ---
    const newNotification = new Notification({
      user: req.user.id,
      message: `Has actualizado la tarea: "${task.title}"`,
      link: '/dashboard/tasks'
    });
    await newNotification.save();

    // Log para seguimiento en consola
    console.log('--- Tarea Actualizada ---');
    console.log(task);
    console.log('------------------------');

    // Respondemos con la tarea actualizada
    res.json(task);
  } catch (err) {
    // Error al actualizar la tarea
    res.status(400).json({ message: err.message });
  }
});

/* ========================================================
   RUTA: DELETE '/:id'
   Descripción: Eliminar una tarea por su ID
========================================================= */
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    // Eliminamos la tarea por su ID
    const deletedTask = await Task.findByIdAndDelete(req.params.id);
    if (!deletedTask) return res.status(404).json({ message: 'Tarea no encontrada' });

    // --- Registrar actividad de eliminación ---
    await new Activity({ user: req.user.id, description: `eliminó la tarea "${deletedTask.title}".` }).save();

    // --- Crear notificación sobre la eliminación ---
    const newNotification = new Notification({
      user: req.user.id,
      message: `Has eliminado la tarea: "${deletedTask.title}"`,
      link: '/dashboard/tasks'
    });
    await newNotification.save();

    // Log para seguimiento en consola
    console.log('--- Tarea Eliminada ---');
    console.log(deletedTask);
    console.log('----------------------');

    // Respondemos con mensaje de confirmación
    res.json({ message: 'Tarea eliminada' });
  } catch (err) {
    // Error en el servidor
    res.status(500).json({ message: err.message });
  }
});

// Exportamos el router para usarlo en la aplicación principal
module.exports = router;
