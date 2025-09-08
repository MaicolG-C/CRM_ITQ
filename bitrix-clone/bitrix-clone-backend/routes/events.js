/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/eventRoutes.js
Descripción: Rutas para gestionar eventos en la aplicación.
Propósito: Permitir crear, actualizar, eliminar y consultar eventos, registrando actividades y notificaciones.
Dependencias:
    - express: Framework para construir rutas y manejar solicitudes HTTP.
    - Event: Modelo de Mongoose para eventos.
    - Notification: Modelo para enviar notificaciones a usuarios.
    - Activity: Modelo para registrar acciones de los usuarios.
    - authMiddleware: Middleware para proteger rutas con autenticación JWT.
*/

// Importamos Router de express
const router = require('express').Router();

// Importamos los modelos necesarios
const Event = require('../models/Event');
const Notification = require('../models/Notification');
const Activity = require('../models/Activity'); // Registro de actividades

// Importamos middleware de autenticación
const authMiddleware = require('../middleware/authMiddleware');

/* ========================================================
   RUTA: GET '/'
   Descripción: Obtener todos los eventos con información de participantes y creador
========================================================= */
router.get('/', authMiddleware, async (req, res) => {
    try {
        const events = await Event.find()
            // Populamos el creador del evento con su nombre
            .populate('createdBy', 'name')
            // Populamos los participantes con nombre y foto de perfil
            .populate('participants', 'name profileImageUrl') 
            // Ordenamos los eventos por fecha ascendente
            .sort({ date: 1 }); 
        res.json(events);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ========================================================
   RUTA: POST '/'
   Descripción: Crear un nuevo evento y notificar a todos los participantes
========================================================= */
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, date, eventType, participants } = req.body;

        // Creamos el nuevo evento con el usuario que lo creó
        const newEvent = new Event({ 
            title, description, date, eventType, participants,
            createdBy: req.user.id 
        });
        await newEvent.save();

        // Notificar a todos los participantes y al creador
        const recipients = [...new Set([req.user.id, ...participants])];
        for (const userId of recipients) {
            const notification = new Notification({
                user: userId,
                message: `Fuiste añadido al evento "${newEvent.title}".`,
                link: `/dashboard/calendar` 
            });
            await notification.save();
        }

        // Registrar la creación del evento en actividades
        await new Activity({
            user: req.user.id,
            description: `creó el evento "${newEvent.title}".`
        }).save();

        res.status(201).json(newEvent);
    } catch (err) { 
        res.status(400).json({ message: err.message }); 
    }
});

/* ========================================================
   RUTA: PUT '/:id'
   Descripción: Actualizar un evento y notificar a todos los involucrados
========================================================= */
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        // Buscamos el evento a actualizar
        const eventToUpdate = await Event.findById(req.params.id);
        if (!eventToUpdate) return res.status(404).json({ message: 'Evento no encontrado' });

        // Actualizamos el evento
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Obtenemos participantes antiguos y nuevos
        const oldParticipants = eventToUpdate.participants.map(p => p.toString());
        const newParticipants = updatedEvent.participants.map(p => p.toString());
        const allInvolved = [...new Set([...oldParticipants, ...newParticipants])];
        const recipients = [...new Set([req.user.id, ...allInvolved])];

        // Notificamos a todos los involucrados
        for (const userId of recipients) {
            const notification = new Notification({
                user: userId,
                message: `El evento "${updatedEvent.title}" ha sido actualizado.`,
                link: `/dashboard/calendar`
            });
            await notification.save();
        }
        
        // Registrar actividad de actualización
        await new Activity({
            user: req.user.id,
            description: `actualizó el evento "${updatedEvent.title}".`
        }).save();

        res.json(updatedEvent);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* ========================================================
   RUTA: DELETE '/:id'
   Descripción: Eliminar un evento y notificar a todos los participantes
========================================================= */
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Eliminamos el evento
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) return res.status(404).json({ message: 'Evento no encontrado' });
        
        // Notificamos a todos los participantes y al creador
        const participants = deletedEvent.participants.map(p => p.toString());
        const recipients = [...new Set([req.user.id, ...participants])];

        for (const userId of recipients) {
            const notification = new Notification({
                user: userId,
                message: `El evento "${deletedEvent.title}" ha sido eliminado.`,
                link: `/dashboard/calendar`
            });
            await notification.save();
        }

        // Registrar actividad de eliminación
        await new Activity({
            user: req.user.id,
            description: `eliminó el evento "${deletedEvent.title}".`
        }).save();

        res.json({ message: 'Evento eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Exportamos el router
module.exports = router;
