/*
Autores:
Michael Israel Guamán Caisaluisa
Dario Alejandro Verdezoto Salazar

Archivo: middleware/authMiddleware.js
Descripción: Middleware para autenticar usuarios mediante JSON Web Tokens (JWT).
Propósito: Proteger rutas de la API asegurando que solo usuarios autenticados puedan acceder.
Dependencias: 
    - jsonwebtoken: Para la creación y verificación de tokens JWT.
*/

// Importamos la librería jsonwebtoken para trabajar con JWT
const jwt = require('jsonwebtoken');

/*
Función: auth
Propósito: Middleware que verifica la validez del token JWT en la cabecera Authorization.
Parámetros:
    - req: Objeto de solicitud HTTP.
    - res: Objeto de respuesta HTTP.
    - next: Función que continúa con la ejecución del siguiente middleware o ruta.
Flujo:
    1. Extrae el token de la cabecera Authorization (formato: "Bearer <token>").
    2. Si no existe token, responde con estado 401 (No autorizado).
    3. Si existe, verifica el token usando la clave secreta definida en process.env.JWT_SECRET.
    4. Si el token es válido, almacena la información decodificada en req.user y llama a next().
    5. Si el token es inválido, responde con estado 401 y mensaje "Token inválido".
*/
const auth = (req, res, next) => {
    // Extraemos el token de la cabecera Authorization
    const token = req.header('Authorization')?.split(' ')[1];

    // Si no se proporciona token, respondemos con error 401
    if (!token) return res.status(401).json({ msg: 'No autorizado' });

    try {
        // Verificamos el token con la clave secreta
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Guardamos los datos del usuario decodificados en la petición
        req.user = decoded;
        // Continuamos con el siguiente middleware o ruta
        next();
    } catch (err) {
        // Si el token no es válido, respondemos con error 401
        res.status(401).json({ msg: 'Token inválido' });
    }
};

// Exportamos el middleware para usarlo en otras partes de la aplicación
module.exports = auth;
