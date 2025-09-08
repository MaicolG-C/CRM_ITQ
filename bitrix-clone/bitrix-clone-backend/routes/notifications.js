/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/notifications.js
Descripción: Rutas para gestionar notificaciones de los usuarios.
Propósito: Permitir obtener, marcar como leídas y eliminar notificaciones.
Dependencias:
    - express: Framework para crear rutas HTTP.
    - Notification: Modelo de Mongoose para notificaciones.
    - authMiddleware: Middleware para proteger rutas y obtener usuario autenticado.
*/

const router = require('express').Router();
const Notification = require('../models/Notification');
const auth = require('../middleware/authMiddleware');

/* ========================================================
   RUTA GET '/'
   Descripción: Obtener las últimas 20 notificaciones del usuario autenticado
========================================================= */
router.get('/', auth, async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })  // Orden descendente por fecha de creación
            .limit(20);                // Limitamos a 20 notificaciones
        res.json(notifications);
    } catch (err) {
        console.error('Error al obtener notificaciones:', err);
        res.status(500).send('Error del Servidor');
    }
});

/* ========================================================
   RUTA PUT '/read'
   Descripción: Marcar todas las notificaciones no leídas como leídas
========================================================= */
router.put('/read', auth, async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, read: false },  // Solo notificaciones no leídas
            { $set: { read: true } }             // Marcar como leídas
        );
        res.json({ msg: 'Notificaciones marcadas como leídas' });
    } catch (err) {
        console.error('Error al marcar notificaciones como leídas:', err);
        res.status(500).send('Error del Servidor');
    }
});

/* ========================================================
   RUTA DELETE '/clear'
   Descripción: Eliminar todas las notificaciones del usuario autenticado
========================================================= */
router.delete('/clear', auth, async (req, res) => {
    try {
        await Notification.deleteMany({ user: req.user.id });
        res.json({ msg: 'Todas las notificaciones han sido eliminadas' });
    } catch (err) {
        console.error("Error al eliminar notificaciones:", err);
        res.status(500).send('Error del Servidor al eliminar notificaciones');
    }
});

// Exportamos el router para usarlo en app.js
module.exports = router;
