import api from './api.js';

export const getColonias = () => api.get('/colonias');

export const getColonia = (id) => api.get(`/colonias/${id}`);

export const createColonia = (data) => api.post('/colonias', data);

export const updateColonia = (id, data) => api.put(`/colonias/${id}`, data);

export const deleteColonia = (id) => api.delete(`/colonias/${id}`);

export const loadColonias = async () => {
    try {
        const colonias = await getColonias();
        const content = document.getElementById('coloniasContent');
        if (content) {
            content.innerHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${colonias.map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td>${c.nombre}</td>
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
        console.error('Error cargando colonias:', error);
    }
};
