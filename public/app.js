// Detecta automáticamente la URL base según desde donde se accede
const API_URL = `${window.location.origin}/api`;

// Cargar usuarios al iniciar
document.addEventListener('DOMContentLoaded', () => {
    cargarUsuarios();
});

// Función para mostrar mensajes
function mostrarMensaje(texto, tipo) {
    const mensaje = document.getElementById('mensaje');
    mensaje.textContent = texto;
    mensaje.className = `mensaje ${tipo}`;
    mensaje.style.display = 'block';
    
    setTimeout(() => {
        mensaje.style.display = 'none';
    }, 5000);
}

// Cargar usuarios desde la API
async function cargarUsuarios() {
    const loading = document.getElementById('loadingUsuarios');
    const lista = document.getElementById('listaUsuarios');
    
    loading.style.display = 'block';
    lista.innerHTML = '';

    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const usuarios = await response.json();

        loading.style.display = 'none';

        if (usuarios.length === 0) {
            lista.innerHTML = '<p style="text-align:center;color:#999;">No hay usuarios registrados</p>';
            return;
        }

        usuarios.forEach(usuario => {
            const card = document.createElement('div');
            card.className = 'usuario-card';
            card.innerHTML = `
                <div class="usuario-info">
                    <h3>${usuario.Nombre}</h3>
                    <p>📧 ${usuario.Email}</p>
                    <p>📞 ${usuario.Telefono || 'No especificado'}</p>
                    <p style="font-size:12px;color:#999;">Registrado: ${new Date(usuario.FechaRegistro).toLocaleDateString()}</p>
                </div>
                <button class="btn-eliminar" onclick="eliminarUsuario(${usuario.UsuarioID})">Eliminar</button>
            `;
            lista.appendChild(card);
        });
    } catch (error) {
        loading.style.display = 'none';
        mostrarMensaje('Error al cargar usuarios. Verifica que el servidor esté corriendo.', 'error');
        console.error(error);
    }
}

// Agregar nuevo usuario
document.getElementById('formUsuario').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nuevoUsuario = {
        nombre: document.getElementById('nombre').value,
        email: document.getElementById('email').value,
        telefono: document.getElementById('telefono').value
    };

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(nuevoUsuario)
        });

        const resultado = await response.json();

        if (resultado.success) {
            mostrarMensaje('Usuario agregado exitosamente', 'exito');
            document.getElementById('formUsuario').reset();
            cargarUsuarios();
        } else {
            mostrarMensaje('Error al agregar usuario', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión. Verifica que el servidor esté corriendo.', 'error');
        console.error(error);
    }
});

// Eliminar usuario
async function eliminarUsuario(id) {
    if (!confirm('¿Estás seguro de eliminar este usuario?')) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'DELETE'
        });

        const resultado = await response.json();

        if (resultado.success) {
            mostrarMensaje('Usuario eliminado exitosamente', 'exito');
            cargarUsuarios();
        } else {
            mostrarMensaje('Error al eliminar usuario', 'error');
        }
    } catch (error) {
        mostrarMensaje('Error de conexión', 'error');
        console.error(error);
    }
}