/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/profileRoutes.js
Descripción: Rutas para gestionar el perfil del usuario en la aplicación.
Propósito: Permitir consultar, actualizar, cambiar contraseña y subir foto de perfil, registrando actividades del usuario.
Dependencias:
    - express: Framework para construir rutas HTTP.
    - User: Modelo de Mongoose para usuarios.
    - Activity: Modelo de Mongoose para registrar actividades del usuario.
    - authMiddleware: Middleware que protege rutas usando JWT.
    - bcryptjs: Para encriptar y verificar contraseñas.
    - multer: Para subir archivos (fotos de perfil).
    - path / fs: Para manejo de rutas y archivos en el servidor.
*/

// Importamos Router de express
const router = require('express').Router();

// Importamos modelos
const User = require('../models/User');
const Activity = require('../models/Activity'); // Registro de actividades

// Importamos middleware de autenticación
const auth = require('../middleware/authMiddleware');

// Otras dependencias
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

/* ========================================================
   CONFIGURACIÓN DE MULTER
   Descripción: Define la ruta y nombre de los archivos de avatar subidos
========================================================= */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads', 'avatars');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage: storage });

/* ========================================================
   RUTA: GET '/'
   Descripción: Obtener datos del perfil del usuario autenticado
========================================================= */
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Perfil de usuario no encontrado.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

/* ========================================================
   RUTA: PUT '/'
   Descripción: Actualizar los datos del perfil del usuario
   Detalles: Solo se actualizan los campos enviados en el body
========================================================= */
router.put('/', auth, async (req, res) => {
  const {
    name, lastName, email, phone,
    serviceUsage, role, experience,
    companyName, businessAddress, numEmployees
  } = req.body;

  const profileFields = {
    ...(name && { name }),
    ...(lastName && { lastName }),
    ...(email && { email }),
    ...(phone && { phone }),
    ...(serviceUsage && { serviceUsage }),
    ...(role && { role }),
    ...(experience !== undefined && { experience }),
    ...(companyName && { companyName }),
    ...(businessAddress && { businessAddress }),
    ...(numEmployees && { numEmployees }),
  };

  try {
    let user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: profileFields },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    // Registro de actividad
    await new Activity({ user: req.user.id, description: 'actualizó su perfil.' }).save();

    console.log('--- Perfil de Usuario Actualizado ---');
    console.log(user);
    console.log('------------------------------------');

    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

/* ========================================================
   RUTA: POST '/upload'
   Descripción: Subir o actualizar la foto de perfil del usuario
   Body/Form-Data: profileImage (archivo)
========================================================= */
router.post('/upload', auth, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ msg: 'No se subió ninguna imagen.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado.' });
    }

    user.profileImageUrl = `/uploads/avatars/${req.file.filename}`;
    await user.save();

    // Registro de actividad
    await new Activity({ user: req.user.id, description: 'actualizó su foto de perfil.' }).save();

    const updatedUser = await User.findById(req.user.id).select('-password');

    console.log('--- Foto de Perfil Actualizada ---');
    console.log(updatedUser);
    console.log('---------------------------------');

    res.status(200).json(updatedUser);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

/* ========================================================
   RUTA: PUT '/password'
   Descripción: Cambiar la contraseña del usuario
   Body JSON:
     - currentPassword: contraseña actual
     - newPassword: nueva contraseña
========================================================= */
router.put('/password', auth, async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ msg: 'Por favor, ingrese la contraseña actual y la nueva.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'Usuario no encontrado.' });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ msg: 'La contraseña actual es incorrecta.' });

    user.password = newPassword;
    await user.save();

    // Registro de actividad
    await new Activity({ user: req.user.id, description: 'actualizó su contraseña.' }).save();

    console.log(`--- Contraseña actualizada para el usuario: ${user.email} ---`);

    res.status(200).json({ msg: 'Contraseña actualizada con éxito.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error del servidor');
  }
});

// Exportamos el router
module.exports = router;
