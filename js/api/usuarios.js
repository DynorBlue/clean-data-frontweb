import api from './api.js';

export const getUsuarios = () => api.get('/usuarios');

export const getUsuario = (id) => api.get(`/usuarios/${id}`);

export const createUsuario = (data) => api.post('/usuarios', data);

export const updateUsuario = (id, data) => api.put(`/usuarios/${id}`, data);

export const deleteUsuario = (id) => api.delete(`/usuarios/${id}`);

export const loadUsuarios = async () => {
    try {
        const usuarios = await getUsuarios();
        const content = document.getElementById('usuariosContent');
        if (content) {
            content.innerHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${usuarios.map(u => `
                            <tr>
                                <td>${u.id}</td>
                                <td>${u.nombre}</td>
                                <td>${u.email}</td>
                                <td>${u.rol}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning">Editar</button>
                                    <button class="btn btn-sm btn-danger">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        }
    } catch (error) {
        console.error('Error cargando usuarios:', error);
    }
};
