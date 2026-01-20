# Sistema de Gestión de Usuarios con Node.js y SQL Server

Sistema web para gestionar usuarios con frontend HTML/CSS/JavaScript y backend Node.js conectado a SQL Server mediante autenticación de Windows.

## 📋 Requisitos Previos

- **Node.js** instalado en el sistema
- **SQL Server** con autenticación de Windows configurada
- Acceso a una base de datos SQL Server con la tabla `Usuarios`

## 📦 Estructura del Proyecto

```
proyecto/
├── server.js
├── package.json
├── package-lock.json
├── .env
├── node_modules/
│   ├── mssql/
│   └── dotenv/
└── public/
    ├── index.html
    ├── styles.css
    └── script.js
```

## 🚀 Instalación

### Paso 1: Copiar los Módulos de Node.js

Como no tenemos acceso a internet para descargar dependencias, necesitamos copiar manualmente los módulos necesarios:

1. **Copia desde USB** (o fuente externa) los siguientes archivos al directorio del proyecto:
   - Carpeta `node_modules/` completa
   - Archivo `package.json`
   - Archivo `package-lock.json`

2. **Verifica** que la carpeta `node_modules` contenga al menos:
   - `mssql/` (módulo para conectar con SQL Server)
   - `dotenv/` (módulo para variables de entorno)

### Paso 2: Configurar Variables de Entorno

Crea un archivo llamado `.env` en la raíz del proyecto con la siguiente información:

```env
# Configuración del Servidor
PORT=8080

# Configuración de SQL Server
DB_SERVER=nombre-del-servidor
DB_DATABASE=nombre-de-la-base-de-datos
DB_DOMAIN=nombre-del-dominio
DB_USERNAME=tu-usuario
DB_PASSWORD=tu-contraseña
```

**Ejemplo:**
```env
PORT=8080
DB_SERVER=DESKTOP-ABC123\SQLEXPRESS
DB_DATABASE=GestionUsuarios
DB_DOMAIN=MI_EMPRESA
DB_USERNAME=mi_usuario
DB_PASSWORD=MiContraseña123
```

⚠️ **IMPORTANTE:** No subas el archivo `.env` a Git por seguridad. Añádelo al `.gitignore`.

### Paso 3: Inicializar el Proyecto (Solo la Primera Vez)

Abre una terminal en la carpeta del proyecto y ejecuta:

```bash
npm init -y
```

Este comando solo debe ejecutarse **una vez** al configurar el proyecto por primera vez.

## ▶️ Ejecutar el Servidor

Cada vez que quieras iniciar el servidor, ejecuta:

```bash
node server.js
```

Deberías ver el mensaje:
```
Servidor corriendo en http://localhost:8080
Presiona Ctrl+C para detener el servidor
```

## 🌐 Acceder a la Aplicación

Una vez que el servidor esté corriendo:

1. Abre tu navegador web
2. Navega a: `http://localhost:8080`
3. Ya puedes usar la aplicación para gestionar usuarios

## 🛠️ Estructura de la Base de Datos

El sistema espera una tabla con la siguiente estructura:

```sql
CREATE TABLE dbo.Usuarios (
    UsuarioID INT PRIMARY KEY IDENTITY(1,1),
    Nombre NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    Telefono NVARCHAR(20),
    FechaRegistro DATETIME DEFAULT GETDATE(),
    Activo BIT DEFAULT 1
);
```

## 📡 API Endpoints

El servidor proporciona los siguientes endpoints:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Obtiene todos los usuarios activos |
| POST | `/api/usuarios` | Crea un nuevo usuario |
| DELETE | `/api/usuarios/:id` | Marca un usuario como inactivo |

### Ejemplo de Uso con JavaScript

```javascript
// Obtener usuarios
fetch('/api/usuarios')
    .then(response => response.json())
    .then(data => console.log(data));

// Crear usuario
fetch('/api/usuarios', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        telefono: '1234567890'
    })
});

// Eliminar usuario
fetch('/api/usuarios/5', {
    method: 'DELETE'
});
```

## 🔧 Solución de Problemas

### Error: "Cannot find module 'mssql'"
- Verifica que la carpeta `node_modules` esté en la raíz del proyecto
- Asegúrate de haber copiado todos los módulos necesarios

### Error: "Login failed for user"
- Revisa que las credenciales en `.env` sean correctas
- Verifica que el usuario tenga permisos en SQL Server
- Confirma que el servidor SQL Server esté ejecutándose

### Error: "EADDRINUSE"
- El puerto 8080 ya está en uso
- Cambia el puerto en el archivo `.env`
- O cierra la aplicación que está usando ese puerto

### No se conecta a la base de datos
- Verifica el nombre del servidor en `DB_SERVER`
- Asegúrate de que SQL Server acepte autenticación de Windows
- Comprueba que el firewall permita la conexión

## 🛑 Detener el Servidor

Para detener el servidor, presiona:
```
Ctrl + C
```

## 📝 Notas Adicionales

- Los archivos estáticos (HTML, CSS, JS) deben estar en la carpeta `public/`
- El servidor usa autenticación NTLM (Windows Authentication) para SQL Server
- Las eliminaciones son "soft delete" (marcan `Activo = 0` en vez de borrar)
- El servidor maneja CORS para permitir peticiones desde el frontend
