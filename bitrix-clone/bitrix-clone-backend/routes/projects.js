/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/projectRoutes.js
Descripción: Rutas para gestionar proyectos en la aplicación.
Propósito: Permitir crear, consultar, actualizar y eliminar proyectos, así como notificar a los miembros y registrar actividades.
Dependencias:
    - express: Framework para construir rutas HTTP.
    - Project: Modelo de Mongoose para proyectos.
    - Notification: Modelo de Mongoose para notificaciones de usuarios.
    - Activity: Modelo de Mongoose para registrar actividades del usuario.
    - authMiddleware: Middleware que protege rutas usando JWT.
*/

// Importamos Router de express
const router = require('express').Router();

// Importamos modelos
const Project = require('../models/Project');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity');

// Importamos middleware de autenticación
const auth = require('../middleware/authMiddleware');

/* ========================================================
   RUTA: GET '/'
   Descripción: Obtener todos los proyectos, ordenados por fecha de creación descendente
   Detalles: Se poblamos los miembros mostrando solo su nombre y avatar
========================================================= */
router.get('/', auth, async (req, res) => {
    try {
        const projects = await Project.find({})
            .populate('members', 'name profileImageUrl')
            .sort({ createdAt: -1 });
            
        res.json(projects);
    } catch (err) {
        console.error("Error al obtener proyectos:", err.message);
        res.status(500).send('Error del servidor');
    }
});

/* ========================================================
   RUTA: POST '/'
   Descripción: Crear un nuevo proyecto
   Body JSON:
     - name: Nombre del proyecto
     - description: Descripción del proyecto
     - startDate, endDate: Fechas de inicio y fin
     - status: Estado del proyecto
     - members: Lista de IDs de miembros
     - priority: Prioridad del proyecto
   Detalles: Se crean notificaciones para todos los miembros y se registra actividad
========================================================= */
router.post('/', auth, async (req, res) => {
    const { name, description, startDate, endDate, status, members, priority } = req.body;
    try {
        const newProject = new Project({ createdBy: req.user.id, name, description, startDate, endDate, status, members, priority });
        const project = await newProject.save();

        // Crear notificaciones para todos los miembros (incluido creador)
        const memberIds = project.members || [];
        const recipients = [...new Set([req.user.id, ...memberIds])];
        for (const userId of recipients) {
            const notification = new Notification({ 
                user: userId, 
                message: `Has sido añadido al proyecto "${project.name}".`, 
                link: `/dashboard/projects` 
            });
            await notification.save();
        }

        // Registrar actividad
        await new Activity({ user: req.user.id, description: `creó el proyecto "${project.name}".` }).save();

        res.status(201).json(project);
    } catch (err) {
        console.error("Error al crear proyecto:", err);
        res.status(500).send('Error del servidor');
    }
});

/* ========================================================
   RUTA: PUT '/:id'
   Descripción: Actualizar un proyecto existente por ID
   Detalles: Se crean notificaciones para los miembros y se registra actividad
========================================================= */
router.put('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) { return res.status(404).json({ msg: 'Proyecto no encontrado' }); }
        
        await Project.findByIdAndUpdate(req.params.id, { $set: req.body });
        const updatedProject = await Project.findById(req.params.id).populate('members', 'name profileImageUrl');

        // Crear notificaciones para todos los miembros
        const recipients = [...new Set([req.user.id, ...updatedProject.members.map(m => m._id)])];
        for (const userId of recipients) {
            const notification = new Notification({ 
                user: userId, 
                message: `El proyecto "${updatedProject.name}" ha sido actualizado.`, 
                link: `/dashboard/projects` 
            });
            await notification.save();
        }

        // Registrar actividad
        await new Activity({ user: req.user.id, description: `actualizó el proyecto "${updatedProject.name}".` }).save();

        res.json(updatedProject);
    } catch (err) {
        console.error("Error al actualizar proyecto:", err);
        res.status(500).send('Error del Servidor');
    }
});

/* ========================================================
   RUTA: DELETE '/:id'
   Descripción: Eliminar un proyecto por ID
   Detalles: Se crean notificaciones para los miembros y el creador, y se registra actividad
========================================================= */
router.delete('/:id', auth, async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        if (!project) { return res.status(404).json({ msg: 'Proyecto no encontrado' }); }

        const deletedProject = await Project.findByIdAndDelete(req.params.id);

        // Crear notificaciones para todos los miembros y creador
        const memberIds = deletedProject.members || [];
        const recipients = [...new Set([deletedProject.createdBy, ...memberIds])];
        for (const userId of recipients) {
            const notification = new Notification({ 
                user: userId, 
                message: `El proyecto "${deletedProject.name}" ha sido eliminado.`, 
                link: `/dashboard/projects` 
            });
            await notification.save();
        }

        // Registrar actividad
        await new Activity({ user: req.user.id, description: `eliminó el proyecto "${deletedProject.name}".` }).save();

        res.json({ msg: 'Proyecto eliminado' });
    } catch (err) {
        console.error("Error al eliminar proyecto:", err);
        res.status(500).send('Error del Servidor');
    }
});

// Exportamos el router
module.exports = router;
