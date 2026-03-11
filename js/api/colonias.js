import api from './api.js';
import { SwalAlert, handleDeleteError } from '../components/utils.js';

export const getColonias = () => api.get('/colonias');
export const getColonia = (id) => api.get(`/colonias/${id}`);
export const createColonia = (data) => api.post('/colonias', data);
export const updateColonia = (id, data) => api.put(`/colonias/${id}`, data);
export const patchColonia = (id, data) => api.patch(`/colonias/${id}`, data);
export const deleteColonia = (id) => api.delete(`/colonias/${id}`);
export const buscarColoniasPorCP = (cp) => api.get(`/colonias/cp/${cp}`);
export const buscarColoniasPorNombre = (nombre) => api.get(`/colonias/buscar?nombre=${encodeURIComponent(nombre)}`);
export const buscarColoniasContiene = (query) => api.get(`/colonias/buscar/contiene?q=${encodeURIComponent(query)}`);

let coloniasData = [];

export const loadColonias = async () => {
    try {
        const content = document.getElementById('coloniasContent');
        if (!content) return;
        
        content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
        
        const colonias = await getColonias();
        coloniasData = colonias;
        
        content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#coloniaModal" onclick="window.coloniaModalMode='create'; window.resetColoniaModal();">
                    <i class="bi bi-plus-circle"></i> Nueva Colonia
                </button>
                <button class="btn btn-secondary" onclick="window.loadColonias()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
            <div class="table-header-info">
                <h5><i class="bi bi-building me-2"></i>Colonias</h5>
                <span class="badge-count">${colonias.length} registros</span>
            </div>
            <div class="table-container">
                <div class="table-responsive">
                    <table class="table table-custom">
                        <thead>
                            <tr>
                                <th><i class="bi bi-hash"></i> ID</th>
                                <th><i class="bi bi-building"></i> Nombre</th>
                                <th><i class="bi bi-postcard"></i> Código Postal</th>
                                <th><i class="bi bi-geo-alt"></i> Latitud</th>
                                <th><i class="bi bi-geo"></i> Longitud</th>
                                <th><i class="bi bi-gear"></i> Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${colonias.map(c => `
                                <tr>
                                    <td><strong>#${c.idColonia}</strong></td>
                                    <td><span class="fw-bold">${c.nombre}</span></td>
                                    <td>${c.codigoPostal || '-'}</td>
                                    <td>${c.latitud || '-'}</td>
                                    <td>${c.longitud || '-'}</td>
                                    <td class="table-actions">
                                        <button class="btn btn-warning btn-sm" onclick="window.editarColonia(${c.idColonia})">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="window.eliminarColonia(${c.idColonia})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ${renderColoniaModal()}
        `;
    } catch (error) {
        console.error('Error cargando colonias:', error);
        SwalAlert.error('Error', error.message || 'Error al cargar colonias');
    }
};

const renderColoniaModal = () => `
    <div class="modal fade" id="coloniaModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="coloniaModalTitle">Nueva Colonia</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="coloniaForm">
                        <input type="hidden" id="coloniaId">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="coloniaNombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Código Postal</label>
                            <input type="text" class="form-control" id="coloniaCP">
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Latitud</label>
                                <input type="number" step="any" class="form-control" id="coloniaLatitud">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Longitud</label>
                                <input type="number" step="any" class="form-control" id="coloniaLongitud">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarColonia()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetColoniaModal = () => {
    document.getElementById('coloniaModalTitle').textContent = 'Nueva Colonia';
    document.getElementById('coloniaId').value = '';
    document.getElementById('coloniaNombre').value = '';
    document.getElementById('coloniaCP').value = '';
    document.getElementById('coloniaLatitud').value = '';
    document.getElementById('coloniaLongitud').value = '';
};

window.editarColonia = async (id) => {
    try {
        const colonia = await getColonia(id);
        
        document.getElementById('coloniaModalTitle').textContent = 'Editar Colonia';
        document.getElementById('coloniaId').value = colonia.idColonia;
        document.getElementById('coloniaNombre').value = colonia.nombre || '';
        document.getElementById('coloniaCP').value = colonia.codigoPostal || '';
        document.getElementById('coloniaLatitud').value = colonia.latitud || '';
        document.getElementById('coloniaLongitud').value = colonia.longitud || '';
        
        window.coloniaModalMode = 'edit';
        
        const modal = new bootstrap.Modal(document.getElementById('coloniaModal'));
        modal.show();
    } catch (error) {
        SwalAlert.error('Error', 'Error al cargar colonia: ' + error.message);
    }
};

window.guardarColonia = async () => {
    try {
        const id = document.getElementById('coloniaId').value;
        const nombre = document.getElementById('coloniaNombre').value.trim();
        const codigoPostal = document.getElementById('coloniaCP').value.trim();
        const latitud = document.getElementById('coloniaLatitud').value;
        const longitud = document.getElementById('coloniaLongitud').value;
        
        if (!nombre) {
            SwalAlert.warning('Advertencia', 'El nombre es requerido');
            return;
        }
        
        const data = {
            nombre,
            codigoPostal: codigoPostal || null,
            latitud: latitud ? parseFloat(latitud) : null,
            longitud: longitud ? parseFloat(longitud) : null
        };
        
        if (id && window.coloniaModalMode === 'edit') {
            await updateColonia(id, data);
            SwalAlert.success('Éxito', 'Colonia actualizada correctamente');
        } else {
            await createColonia(data);
            SwalAlert.success('Éxito', 'Colonia creada correctamente');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('coloniaModal'));
        modal.hide();
        
        loadColonias();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al guardar colonia');
    }
};

window.eliminarColonia = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar eliminación', '¿Está seguro de eliminar esta colonia?\n\nNota: Si hay ciudadanos, reportes o rutas asociadas, no se podrá eliminar.');
    if (!isConfirmed) return;
    
    try {
        await deleteColonia(id);
        SwalAlert.success('Éxito', 'Colonia eliminada correctamente');
        loadColonias();
    } catch (error) {
        console.error('Error al eliminar colonia:', error);
        if (!handleDeleteError(error, 'la colonia')) {
            SwalAlert.error('Error', error.message || 'Error al eliminar colonia');
        }
    }
};

window.loadColonias = loadColonias;
