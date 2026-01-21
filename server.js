// server.js
// Servidor Node.js usando Express para conectar con SQL Server

const express = require('express');
const sql = require('mssql');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.static('public'));

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

// GET /api/usuarios - Obtener todos los usuarios
app.get('/api/usuarios', async (req, res) => {
    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT * FROM dbo.Usuarios WHERE Activo = 1 ORDER BY FechaRegistro DESC');
        res.json(result.recordset);
    } catch (err) {
        console.error('Error al obtener usuarios:', err);
        res.status(500).json({ error: 'Error al obtener usuarios', details: err.message });
    }
});

// POST /api/usuarios - Crear nuevo usuario
app.post('/api/usuarios', async (req, res) => {
    const { nombre, email, telefono } = req.body;

    if (!nombre || !email) {
        return res.status(400).json({ error: 'Nombre y email son requeridos' });
    }

    try {
        const pool = await sql.connect(config);
        const result = await pool.request()
            .input('nombre', sql.NVarChar, nombre)
            .input('email', sql.NVarChar, email)
            .input('telefono', sql.NVarChar, telefono || null)
            .query('INSERT INTO dbo.Usuarios (Nombre, Email, Telefono) VALUES (@nombre, @email, @telefono); SELECT SCOPE_IDENTITY() AS UsuarioID');
        
        res.json({
            success: true,
            usuarioID: result.recordset[0].UsuarioID,
            mensaje: 'Usuario creado exitosamente'
        });
    } catch (err) {
        console.error('Error al crear usuario:', err);
        res.status(500).json({ error: 'Error al crear usuario', details: err.message });
    }
});

// DELETE /api/usuarios/:id - Eliminar usuario
app.delete('/api/usuarios/:id', async (req, res) => {
    const id = req.params.id;

    if (!id || isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
    }

    try {
        const pool = await sql.connect(config);
        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('UPDATE dbo.Usuarios SET Activo = 0 WHERE UsuarioID = @id');
        
        res.json({ success: true, mensaje: 'Usuario eliminado exitosamente' });
    } catch (err) {
        console.error('Error al eliminar usuario:', err);
        res.status(500).json({ error: 'Error al eliminar usuario', details: err.message });
    }
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Presiona Ctrl+C para detener el servidor`);
});

/* 
INSTALACIÓN DE DEPENDENCIAS:
npm init -y
npm install express mssql dotenv

EJECUTAR EL SERVIDOR:
node server.js
*/
