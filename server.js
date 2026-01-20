// server.js
// Servidor Node.js usando HTTP nativo para conectar con SQL Server

const http = require('http');
const fs = require('fs');
const path = require('path');
const sql = require('mssql');
require('dotenv').config();

const PORT = process.env.PORT || 8080;

// Configuración de conexión a SQL Server con Windows Authentication
const config = {
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true,
        trustServerCertificate: true,
        enableArithAbort: true
    },
    authentication: {
        type: 'ntlm',
        options: {
            domain: process.env.DB_DOMAIN,
            userName: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD
        }
    }
};

// Función para obtener el tipo MIME según la extensión del archivo
function getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
        '.html': 'text/html',
        '.css': 'text/css',
        '.js': 'application/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.ico': 'image/x-icon'
    };
    return mimeTypes[ext] || 'text/plain';
}

// Función para servir archivos estáticos
function serveStaticFile(res, filePath) {
    fs.readFile(filePath, (err, content) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html' });
            res.end('<h1>404 - Archivo no encontrado</h1>');
        } else {
            const mimeType = getMimeType(filePath);
            res.writeHead(200, { 'Content-Type': mimeType });
            res.end(content);
        }
    });
}

// Función para parsear JSON del body de la petición
function parseBody(req, callback) {
    let body = '';
    req.on('data', chunk => {
        body += chunk.toString();
    });
    req.on('end', () => {
        try {
            const data = body ? JSON.parse(body) : {};
            callback(null, data);
        } catch (err) {
            callback(err, null);
        }
    });
}

// Función para enviar respuesta JSON
function sendJSON(res, statusCode, data) {
    res.writeHead(statusCode, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(data));
}

// Crear servidor HTTP
const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;

    // Manejar CORS preflight
    if (method === 'OPTIONS') {
        res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
        return;
    }

    // Servir archivos estáticos desde la carpeta public
    if (!url.startsWith('/api/')) {
        let filePath;
        
        if (url === '/' || url === '/index.html') {
            filePath = path.join(__dirname, 'public', 'index.html');
        } else {
            // Servir CSS, JS y otros archivos estáticos
            filePath = path.join(__dirname, 'public', url);
        }
        
        serveStaticFile(res, filePath);
        return;
    }

    // GET /api/usuarios - Obtener todos los usuarios
    if (url === '/api/usuarios' && method === 'GET') {
        try {
            const pool = await sql.connect(config);
            const result = await pool.request()
                .query('SELECT * FROM dbo.Usuarios WHERE Activo = 1 ORDER BY FechaRegistro DESC');
            sendJSON(res, 200, result.recordset);
        } catch (err) {
            console.error('Error al obtener usuarios:', err);
            sendJSON(res, 500, { error: 'Error al obtener usuarios', details: err.message });
        }
        return;
    }

    // POST /api/usuarios - Crear nuevo usuario
    if (url === '/api/usuarios' && method === 'POST') {
        parseBody(req, async (err, body) => {
            if (err) {
                sendJSON(res, 400, { error: 'Error al parsear JSON' });
                return;
            }

            const { nombre, email, telefono } = body;

            if (!nombre || !email) {
                sendJSON(res, 400, { error: 'Nombre y email son requeridos' });
                return;
            }

            try {
                const pool = await sql.connect(config);
                const result = await pool.request()
                    .input('nombre', sql.NVarChar, nombre)
                    .input('email', sql.NVarChar, email)
                    .input('telefono', sql.NVarChar, telefono || null)
                    .query('INSERT INTO dbo.Usuarios (Nombre, Email, Telefono) VALUES (@nombre, @email, @telefono); SELECT SCOPE_IDENTITY() AS UsuarioID');
                
                sendJSON(res, 200, {
                    success: true,
                    usuarioID: result.recordset[0].UsuarioID,
                    mensaje: 'Usuario creado exitosamente'
                });
            } catch (err) {
                console.error('Error al crear usuario:', err);
                sendJSON(res, 500, { error: 'Error al crear usuario', details: err.message });
            }
        });
        return;
    }

    // DELETE /api/usuarios/:id - Eliminar usuario
    if (url.startsWith('/api/usuarios/') && method === 'DELETE') {
        const id = url.split('/')[3];

        if (!id || isNaN(id)) {
            sendJSON(res, 400, { error: 'ID inválido' });
            return;
        }

        try {
            const pool = await sql.connect(config);
            await pool.request()
                .input('id', sql.Int, parseInt(id))
                .query('UPDATE dbo.Usuarios SET Activo = 0 WHERE UsuarioID = @id');
            
            sendJSON(res, 200, { success: true, mensaje: 'Usuario eliminado exitosamente' });
        } catch (err) {
            console.error('Error al eliminar usuario:', err);
            sendJSON(res, 500, { error: 'Error al eliminar usuario', details: err.message });
        }
        return;
    }

    // Ruta no encontrada
    sendJSON(res, 404, { error: 'Ruta no encontrada' });
});

// Iniciar servidor
server.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Presiona Ctrl+C para detener el servidor`);
});

/* 
INSTALACIÓN DE DEPENDENCIAS:
npm init -y
npm install mssql dotenv

EJECUTAR EL SERVIDOR:
node server.js
*/