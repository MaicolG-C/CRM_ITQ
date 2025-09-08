/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/activityRoutes.js
Descripción: Rutas para obtener el flujo de actividades de los usuarios.
Propósito: Permitir consultar las últimas acciones realizadas por los usuarios, mostrando información relevante.
Dependencias:
    - express: Framework para construir rutas y manejar solicitudes HTTP.
    - Activity: Modelo de Mongoose para registrar actividades.
    - authMiddleware: Middleware para proteger rutas con autenticación JWT.
*/

// Importamos Router de Express para definir rutas modulares
const router = require('express').Router();

// Importamos el modelo Activity que representa las acciones de los usuarios en la DB
const Activity = require('../models/Activity');

// Importamos el middleware de autenticación que valida JWT en las solicitudes
const authMiddleware = require('../middleware/authMiddleware');

// Ruta GET '/' para obtener las últimas actividades
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Consultamos todas las actividades en la base de datos
        // 'populate' nos permite traer datos relacionados del usuario que realizó la acción
        // Solo traemos los campos 'name' y 'profileImageUrl' del usuario
        const activities = await Activity.find()
            .populate('user', 'name profileImageUrl') // Relaciona con el modelo User
            .sort({ timestamp: -1 }) // Ordena las actividades de más recientes a más antiguas
            .limit(10); // Limitamos el resultado a las últimas 10 actividades

        // Respondemos al cliente con código 200 y las actividades encontradas
        res.status(200).json(activities);
    } catch (error) {
        // Si ocurre algún error, lo mostramos en consola para debug
        console.error('Error al obtener actividades:', error);
        // Respondemos con un estado 500 indicando error en el servidor
        res.status(500).json({ message: 'Error al obtener el flujo de actividad.' });
    }
});

// Exportamos el router para que pueda ser usado en la aplicación principal (ej. app.js)
module.exports = router;
