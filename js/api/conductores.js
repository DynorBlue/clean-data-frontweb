import api from './api.js';

export const getConductores = () => api.get('/conductores');

export const getConductor = (id) => api.get(`/conductores/${id}`);

export const createConductor = (data) => api.post('/conductores', data);

export const updateConductor = (id, data) => api.put(`/conductores/${id}`, data);

export const deleteConductor = (id) => api.delete(`/conductores/${id}`);

export const loadConductores = async () => {
    try {
        const conductores = await getConductores();
        const content = document.getElementById('conductoresContent');
        if(content){
            content.innerHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Licencia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${conductores.map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td>${c.licencia}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning">Editar</button>
                                    <button class="btn btn-sm btn-danger">Eliminar</button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `
        }
    } catch (error) {
        console.log('Error cargando conductores:', error);
    }
};