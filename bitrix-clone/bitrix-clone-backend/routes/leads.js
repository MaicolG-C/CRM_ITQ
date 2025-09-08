/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/leadRoutes.js
Descripción: Rutas para gestionar leads (clientes potenciales) en la aplicación.
Propósito: Permitir crear, consultar y eliminar leads, asignándolos a usuarios y registrando información.
Dependencias:
    - express: Framework para construir rutas HTTP.
    - Lead: Modelo de Mongoose para leads.
    - authMiddleware: Middleware que protege rutas usando JWT.
*/

// Importamos Router de express
const router = require('express').Router();

// Importamos el modelo Lead
const Lead = require('../models/Lead');

// Importamos middleware de autenticación
const auth = require('../middleware/authMiddleware');

/* ========================================================
   RUTA: GET '/'
   Descripción: Obtener todos los leads, poblando el usuario asignado
========================================================= */
router.get('/', auth, async (req, res) => {
    try {
        // Buscamos todos los leads y poblamos 'assignedTo' mostrando solo el nombre
        const leads = await Lead.find().populate('assignedTo', 'name');
        res.json(leads);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

/* ========================================================
   RUTA: POST '/'
   Descripción: Crear un nuevo lead y asignarlo al usuario especificado o al que hace la solicitud
========================================================= */
router.post('/', auth, async (req, res) => {
    try {
        // Creamos un nuevo lead usando la información recibida
        // Si no se especifica 'assignedTo', se asigna al usuario que crea el lead
        const lead = new Lead({ ...req.body, assignedTo: req.body.assignedTo || req.user.id });
        await lead.save();

        // --- LOG AÑADIDO ---
        console.log('--- Nuevo Lead Creado ---');
        console.log(lead);
        console.log('------------------------');

        res.json(lead);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

/* ========================================================
   RUTA: DELETE '/:id'
   Descripción: Eliminar un lead por su ID
========================================================= */
router.delete('/:id', auth, async (req, res) => {
    try {
        // Buscamos y eliminamos el lead por su ID
        const deletedLead = await Lead.findByIdAndDelete(req.params.id);

        // --- LOG AÑADIDO ---
        console.log('--- Lead Eliminado ---');
        console.log(deletedLead);
        console.log('---------------------');

        res.json({ message: 'Lead eliminado' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Exportamos el router
module.exports = router;
