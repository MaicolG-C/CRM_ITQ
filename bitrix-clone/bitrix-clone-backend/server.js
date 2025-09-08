/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: server.js
Descripción: Configuración principal del servidor Express, conexión a MongoDB, integración de Socket.IO y manejo de webhook de WhatsApp Cloud API.
Propósito: Iniciar el servidor, servir rutas API, manejar comunicación en tiempo real con Socket.IO y procesar mensajes entrantes de WhatsApp.
Dependencias:
    - express: Framework para manejar rutas y solicitudes HTTP.
    - mongoose: ODM para interactuar con MongoDB.
    - cors: Permite solicitudes entre dominios.
    - http: Crear servidor HTTP para Socket.IO.
    - socket.io: Comunicación en tiempo real con clientes.
    - axios: Realizar solicitudes HTTP externas (para WhatsApp media).
    - fs: Manejo de archivos del sistema.
    - path: Manejo de rutas de archivos.
    - dotenv: Manejo de variables de entorno.
    - Modelos: Message.
    - Rutas: auth, tasks, projects, leads, events, employees, messages, activities, profile, notifications.
*/

// ---------------------- Importaciones ----------------------
const express = require('express'); // Framework principal
const mongoose = require('mongoose'); // Conexión y manejo de MongoDB
const cors = require('cors'); // Permite solicitudes desde distintos orígenes
const http = require('http'); // Servidor HTTP necesario para Socket.IO
const { Server } = require('socket.io'); // Comunicación en tiempo real
const axios = require('axios'); // Para llamadas externas (descarga de media WhatsApp)
const fs = require('fs'); // Para guardar archivos localmente
const path = require('path'); // Manejo de rutas de archivos
require('dotenv').config(); // Variables de entorno desde .env

// ---------------------- Modelos ----------------------
const Message = require('./models/Message'); // Modelo de mensajes

// ---------------------- Rutas ----------------------
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');
const projectRoutes = require('./routes/projects');
const leadRoutes = require('./routes/leads');
const eventRoutes = require('./routes/events');
const employeeRoutes = require('./routes/employees');
const messageRoutes = require('./routes/messages');
const activityRoutes = require('./routes/activities');
const profileRoutes = require('./routes/profile');
const notificationRoutes = require('./routes/notifications');

// ---------------------- Configuración de Express ----------------------
const app = express();
app.use(cors()); // Permitir CORS
app.use(express.json()); // Parsear JSON automáticamente

// Servir archivos estáticos desde la carpeta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ---------------------- Middlewares de Rutas ----------------------
app.use('/api/users', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);

// ---------------------- Conexión a MongoDB ----------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(err => console.log('Error de conexión inicial a MongoDB:', err));

const db = mongoose.connection;
db.on('error', (err) => console.error('Error de conexión a MongoDB después de la conexión inicial:', err));
db.once('open', () => console.log('Conexión a MongoDB exitosa y estable.'));

// ---------------------- Configuración de Servidor y Socket.IO ----------------------
const server = http.createServer(app); // Creamos servidor HTTP
const io = new Server(server, { cors: { origin: "*" } }); // Inicializamos Socket.IO con CORS

// Adjuntar la instancia de 'io' a la aplicación de Express para usarla en rutas
app.set('socketio', io);

// ---------------------- Configuración Webhook WhatsApp ----------------------
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

// Verificación del webhook (GET)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token && mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    console.log('✅ WEBHOOK_VERIFICADO.');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Recepción de mensajes del webhook (POST)
app.post('/webhook', async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const messageData = changes?.value?.messages?.[0];
    if (changes?.field !== 'messages' || !messageData) return res.sendStatus(200);

    const from = messageData.from;
    let newMessage;

    // Mensaje de texto
    if (messageData.type === 'text') {
      newMessage = new Message({
        type: 'text',
        text: messageData.text.body,
        senderId: from,
        recipientId: WHATSAPP_PHONE_NUMBER_ID
      });
      await newMessage.save();
      console.log('✅ Mensaje de texto de WhatsApp recibido y guardado.');
    } 
    // Mensajes multimedia
    else if (['image', 'document', 'audio', 'video'].includes(messageData.type)) {
      const mediaObject = messageData[messageData.type];
      const mediaId = mediaObject.id;
      const originalFileName = mediaObject.filename || mediaObject.caption || `${mediaId}.${mediaObject.mime_type.split('/')[1] || 'tmp'}`;

      // Obtener URL temporal de descarga desde la API de WhatsApp
      const mediaUrlResponse = await axios.get(`https://graph.facebook.com/v19.0/${mediaId}`, {
        headers: { 'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}` }
      });
      const temporaryUrl = mediaUrlResponse.data.url;

      // Descargar archivo
      const fileResponse = await axios.get(temporaryUrl, {
        headers: { 'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}` },
        responseType: 'arraybuffer'
      });

      // Guardar archivo localmente
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const localFilename = `${uniqueSuffix}-${originalFileName}`;
      const localFilePath = path.join(__dirname, 'uploads', localFilename);
      fs.writeFileSync(localFilePath, fileResponse.data);

      // Crear registro en DB
      newMessage = new Message({
        type: messageData.type,
        mediaUrl: localFilename,
        fileName: originalFileName,
        senderId: from,
        recipientId: WHATSAPP_PHONE_NUMBER_ID
      });
      await newMessage.save();
      console.log(`✅ ${messageData.type} de ${from} procesado y guardado.`);
    }

    // Emitir mensaje en tiempo real a todos los clientes conectados
    if (newMessage) io.emit('new message', newMessage);

    res.sendStatus(200);
  } catch (error) {
    console.error('❌ Error procesando el webhook:', error.response?.data || error.message);
    res.sendStatus(200);
  }
});

// ---------------------- Lógica de Socket.IO para Chat ----------------------
io.on('connection', async (socket) => {
  try {
    // Enviar historial de mensajes al cliente que se conecta
    const messages = await Message.find().sort({ timestamp: 1 });
    socket.emit('previous messages', messages);
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
  }

  // Escuchar nuevos mensajes desde cliente
  socket.on('message', async (msg) => {
    try {
      const newMessage = new Message(msg);
      await newMessage.save();
      io.emit('message', newMessage); // Emitir mensaje a todos los clientes
    } catch (error) {
      console.error('❌ Error saving or sending message:', error);
    }
  });

  socket.on('disconnect', () => {
    // Aquí se puede manejar lógica de desconexión si se necesita
  });
});

// ---------------------- Inicialización del Servidor ----------------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
