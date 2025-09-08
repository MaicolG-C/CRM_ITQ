/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: routes/messages.js
Descripción: Rutas para enviar, recibir y descargar mensajes, incluyendo soporte para archivos y WhatsApp API.
Propósito: Gestionar mensajes entre usuarios, integrando envío a WhatsApp y almacenamiento en MongoDB.
Dependencias:
    - express: Framework para crear rutas HTTP.
    - multer: Middleware para manejo de archivos.
    - path: Para manejar rutas de archivos.
    - fs: Para manipular el sistema de archivos.
    - axios: Para hacer peticiones HTTP a la API de WhatsApp.
    - Message: Modelo de Mongoose para mensajes.
    - authMiddleware: Middleware que protege rutas usando JWT.
*/

// Importamos Express y creamos un router
const express = require('express');
const router = express.Router();

// Importamos multer para manejo de archivos
const multer = require('multer');

// Importamos path para manejo de rutas
const path = require('path');

// Importamos axios para llamadas HTTP a WhatsApp API
const axios = require('axios');

// Importamos fs para operaciones de sistema de archivos
const fs = require('fs');

// Importamos modelo Message
const Message = require('../models/Message');

// Importamos middleware de autenticación
const authMiddleware = require('../middleware/authMiddleware');

// Variables de entorno para WhatsApp API
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

/* ========================================================
   CONFIGURACIÓN MULTER
   Propósito: Guardar archivos subidos por los usuarios
========================================================= */
const storage = multer.diskStorage({
    // Carpeta de destino de los archivos
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
    // Nombre único del archivo usando timestamp + random + nombre original
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
const upload = multer({ storage }); // Inicializamos multer con la configuración

/* ========================================================
   RUTA GET '/'
   Descripción: Obtener todos los mensajes (protegida)
========================================================= */
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Obtenemos todos los mensajes ordenados por timestamp ascendente
        const messages = await Message.find().sort({ timestamp: 1 });
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error al obtener mensajes:', error);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

/* ========================================================
   RUTA POST '/send'
   Descripción: Enviar mensajes (texto o archivos) y guardarlos en BD
   Nota: Compatible con JSON y FormData (multipart/form-data)
========================================================= */
router.post('/send', authMiddleware, upload.single('file'), async (req, res) => {
    let { to, senderId, text, publicUrl } = req.body; // Datos del mensaje
    const file = req.file; // Archivo adjunto, si existe

    // Si no hay archivo, los datos vienen en JSON
    if (!file && req.body && Object.keys(req.body).length > 0) {
        ({ to, senderId, text } = req.body);
    }

    // Validación de parámetros obligatorios
    if (!to || !senderId || (!file && !text)) {
        return res.status(400).json({ error: 'Faltan parámetros.' });
    }

    try {
        let messagePayload; // Payload para WhatsApp
        let messageToSaveInDB; // Datos a guardar en MongoDB

        if (file) {
            // Lógica para mensajes con archivo
            const publicFileUrl = `${publicUrl}/uploads/${file.filename}`;
            const isImage = file.mimetype.startsWith('image/');
            const messageType = isImage ? 'image' : 'document';

            // Configuramos payload según tipo
            if (isImage) {
                messagePayload = { messaging_product: 'whatsapp', to, type: 'image', image: { link: publicFileUrl } };
            } else {
                messagePayload = { messaging_product: 'whatsapp', to, type: 'document', document: { link: publicFileUrl, filename: file.originalname } };
            }

            // Datos para guardar en DB
            messageToSaveInDB = { type: messageType, mediaUrl: file.filename, fileName: file.originalname, senderId, recipientId: to };
        } else {
            // Lógica para mensajes de texto
            messagePayload = { messaging_product: 'whatsapp', to, type: 'text', text: { body: text } };
            messageToSaveInDB = { type: 'text', text, senderId, recipientId: to };
        }

        // Enviamos el mensaje a WhatsApp API
        const url = `https://graph.facebook.com/v19.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`;
        const headers = { 'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`, 'Content-Type': 'application/json' };
        await axios.post(url, messagePayload, { headers });

        // Guardamos el mensaje en MongoDB
        const savedMessage = new Message(messageToSaveInDB);
        await savedMessage.save();

        console.log('✅ Mensaje enviado a WhatsApp y guardado en la BD:', savedMessage);

        res.status(200).json({ status: 'success', data: savedMessage });
    } catch (error) {
        console.error('Error en el proceso de envío:', error.response?.data || error.message);
        res.status(500).json({ status: 'error', message: 'Error en el envío.' });
    }
});

/* ========================================================
   RUTA GET '/download/:filename'
   Descripción: Descargar archivos previamente subidos
========================================================= */
router.get('/download/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../uploads', filename);

    // Reconstruimos el nombre original eliminando prefijo único
    const originalFilename = filename.split('-').slice(2).join('-');

    if (fs.existsSync(filePath)) {
        res.download(filePath, originalFilename, (err) => {
            if (err) {
                console.error("Error al descargar archivo:", err);
                res.status(500).send("No se pudo descargar el archivo.");
            }
        });
    } else {
        res.status(404).send("Archivo no encontrado.");
    }
});

// Exportamos el router para usar en app.js
module.exports = router;
