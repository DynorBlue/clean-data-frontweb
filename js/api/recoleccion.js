import api from './api.js';

export const getRecolecciones = () => api.get('/recolecciones');

export const getRecoleccion = (id) => api.get(`/recolecciones/${id}`);

export const createRecoleccion = (data) => api.post('/recolecciones', data);

export const updateCRecoleccion = (id, data) => api.put(`/recolecciones/${id}`, data);

export const deleteRecoleccion = (id) => api.delete(`/recolecciones/${id}`);

export const loadRecolecciones = async () => {
    try {
        const recolecciones = await getRecolecciones();
        const content = document.getElementById('recoleccionesContent');
        if(content){
            content.innerHTML = `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Tipo de Residuo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recolecciones.map(c => `
                            <tr>
                                <td>${c.id}</td>
                                <td>${c.tipoResiduo}</td>
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
        console.log('Error cargando residuos:', error);
    }
};