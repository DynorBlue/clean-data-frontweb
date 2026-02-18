import api from './api.js';

export const getCamiones = () => api.get('/camiones');

export const getCamion = (id) => api.get(`/camiones/${id}`);

export const createCamion = (data) => api.post('/camiones', data);

export const updateCamion = (id, data) => api.put(`/camiones/${id}`, data);

export const deleteCamion = (id) => api.delete(`/camiones/${id}`);

export const loadCamiones = async () => {
    try {
        const camiones = await getCamiones();
        const content = document.getElementById('camionesContent');
        if(content){
            content.innerHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Modelo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${camiones.map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td>${c.modelo}</td>
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
        console.log('Error cargando camiones:', error);
    }
};