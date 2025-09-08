/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/auth.js
Descripción: Rutas para registrar y autenticar usuarios en la aplicación.
Propósito: Permitir crear usuarios nuevos, iniciar sesión y generar tokens JWT para autenticación.
Dependencias:
    - express: Framework para construir rutas HTTP.
    - User: Modelo de Mongoose para usuarios.
    - jsonwebtoken: Librería para generar y validar JWT.
*/

// Importamos Router de Express para definir rutas modulares
const router = require('express').Router();

// Importamos el modelo User para interactuar con la colección de usuarios
const User = require('../models/User');

// Importamos la librería jsonwebtoken para generar tokens de autenticación
const jwt = require('jsonwebtoken');

/* ========================================================
   RUTA: POST '/register'
   Descripción: Registrar un nuevo usuario en la base de datos
========================================================= */
router.post('/register', async (req, res) => {
    try {
        // Desestructuramos los datos recibidos desde el cuerpo de la solicitud
        const {name, lastName, email, password, phone, serviceUsage, role, experience, companyName, businessAddress, numEmployees} = req.body;

        // Creamos una nueva instancia del modelo User con los datos recibidos
        const user = new User({name, lastName, email, password, phone, serviceUsage, role, experience, companyName, businessAddress, numEmployees});

        // Guardamos el usuario en la base de datos
        await user.save();

        // --- LOG AÑADIDO para debug ---
        console.log('--- Nuevo Usuario Registrado ---');

        // Creamos una copia del objeto usuario para eliminar la contraseña antes de mostrarlo
        const userLog = { ...user.toObject() };
        delete userLog.password; // Eliminamos la contraseña por seguridad

        console.log(userLog); // Mostramos en consola el usuario registrado sin contraseña
        console.log('------------------------------');

        // Respondemos con código 201 indicando que el usuario fue creado
        res.status(201).json({msg:'Usuario creado'});
    } catch(err) { 
        // Si el error es de duplicado de email (código 11000)
        if (err.code === 11000) {
            return res.status(400).json({ msg: 'El email ya está registrado.' });
        }

        // En caso de otros errores, respondemos con código 500 y el mensaje del error
        res.status(500).json({msg:err.message}); 
    }
});

/* ========================================================
   RUTA: POST '/login'
   Descripción: Autenticar un usuario y generar un token JWT
========================================================= */
router.post('/login', async(req, res) => {
    try {
        // Desestructuramos los datos recibidos desde el cuerpo de la solicitud
        const {email, password} = req.body;

        // Buscamos un usuario que coincida con el email
        const userWithPassword = await User.findOne({email});
        if(!userWithPassword) return res.status(400).json({msg:'Usuario no encontrado'});

        // Comparamos la contraseña enviada con la almacenada en la base de datos usando bcrypt
        const isMatch = await userWithPassword.comparePassword(password);
        if(!isMatch) return res.status(400).json({msg:'Contraseña incorrecta'});

        // Generamos un token JWT que incluye el id del usuario y expira en 7 días
        const token = jwt.sign({ id: userWithPassword._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Convertimos el usuario a un objeto simple y eliminamos la contraseña antes de enviarlo
        const userObject = userWithPassword.toObject();
        delete userObject.password;

        // --- LOG AÑADIDO para debug ---
        console.log('--- Usuario logueado ---');
        console.log(userObject); // Mostramos en consola los datos del usuario sin contraseña
        console.log('------------------------');

        // Respondemos con los datos del usuario y el token JWT
        res.json({ user: userObject, token });

    } catch(err) { 
        // Mostramos en consola cualquier error inesperado y respondemos con código 500
        console.error("Error en el login:", err);
        res.status(500).json({msg:err.message}); 
    }
});

// Exportamos el router para usarlo en la aplicación principal
module.exports = router;
