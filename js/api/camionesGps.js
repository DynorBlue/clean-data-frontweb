import api, { showToast } from './api.js';
import { getCamiones } from './camiones.js';

export const getCamionesGps = () => api.get('/camiones-gps');
export const getCamionGps = (id) => api.get(`/camiones-gps/${id}`);
export const createCamionGps = (data) => api.post('/camiones-gps', data);
export const updateCamionGps = (id, data) => api.put(`/camiones-gps/${id}`, data);
export const deleteCamionGps = (id) => api.delete(`/camiones-gps/${id}`);
export const getGpsByCamion = (idCamion) => api.get(`/camiones-gps/camion/${idCamion}`);

let gpsData = [];
let camionesList = [];

export const loadCamionesGps = async () => {
    try {
        const content = document.getElementById('camionesGpsContent');
        if (!content) return;

        content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        const [gpsList, camiones] = await Promise.all([
            getCamionesGps(),
            getCamiones()
        ]);

        gpsData = gpsList;
        camionesList = camiones;

        content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#gpsModal" onclick="window.gpsModalMode='create'; window.resetGpsModal();">
                    <i class="bi bi-plus-circle"></i> Nuevo GPS
                </button>
                <button class="btn btn-secondary" onclick="window.loadCamionesGps()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
                <select class="form-select" style="max-width:250px;" id="filtroCamionGps" onchange="window.filtrarGpsPorCamion()">
                    <option value="">Todos los camiones</option>
                    ${camiones.map(c => `<option value="${c.idCamion}">${c.placas} - ${c.modelo}</option>`).join('')}
                </select>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Camión</th>
                            <th>Latitud</th>
                            <th>Longitud</th>
                            <th>Velocidad</th>
                            <th>Última Actualización</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${gpsList.map(g => `
                            <tr>
                                <td>${g.idCamion}</td>
                                <td>${g.camion?.placas || '-'}</td>
                                <td>${g.latitud || '-'}</td>
                                <td>${g.longitud || '-'}</td>
                                <td>${g.velocidad ? g.velocidad + ' km/h' : '-'}</td>
                                <td>${g.fechaActualizacion ? new Date(g.fechaActualizacion).toLocaleString() : '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning" onclick="window.editarGps(${g.idCamion})">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="window.eliminarGps(${g.idCamion})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${renderGpsModal()}
        `;
    } catch (error) {
        console.error('Error cargando GPS:', error);
        showToast(error.message || 'Error al cargar GPS de camiones', 'danger');
    }
};

const renderGpsModal = () => `
    <div class="modal fade" id="gpsModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="gpsModalTitle">Nuevo GPS</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="gpsForm">
                        <input type="hidden" id="gpsId">
                        <div class="mb-3">
                            <label class="form-label">Camión</label>
                            <select class="form-select" id="gpsCamion" required>
                                <option value="">Seleccionar camión</option>
                                ${camionesList.map(c => `<option value="${c.idCamion}">${c.placas} - ${c.modelo}</option>`).join('')}
                            </select>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Latitud</label>
                                <input type="number" step="0.0000001" class="form-control" id="gpsLatitud" placeholder="Ej: 19.432608">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Longitud</label>
                                <input type="number" step="0.0000001" class="form-control" id="gpsLongitud" placeholder="Ej: -99.133209">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Velocidad (km/h)</label>
                            <input type="number" step="0.01" class="form-control" id="gpsVelocidad" placeholder="0.00">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Última Actualización</label>
                            <input type="datetime-local" class="form-control" id="gpsFecha">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarGps()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetGpsModal = async () => {
    document.getElementById('gpsModalTitle').textContent = 'Nuevo GPS';
    document.getElementById('gpsId').value = '';
    document.getElementById('gpsLatitud').value = '';
    document.getElementById('gpsLongitud').value = '';
    document.getElementById('gpsVelocidad').value = '';
    document.getElementById('gpsFecha').value = '';
    
    const camiones = await getCamiones();
    document.getElementById('gpsCamion').innerHTML = '<option value="">Seleccionar camión</option>' + 
        camiones.map(c => `<option value="${c.idCamion}">${c.placas} - ${c.modelo}</option>`).join('');
};

window.editarGps = async (id) => {
    try {
        const gps = await getCamionGps(id);

        document.getElementById('gpsModalTitle').textContent = 'Editar GPS';
        document.getElementById('gpsId').value = gps.idCamion;
        document.getElementById('gpsCamion').value = gps.camion?.idCamion || '';
        document.getElementById('gpsLatitud').value = gps.latitud || '';
        document.getElementById('gpsLongitud').value = gps.longitud || '';
        document.getElementById('gpsVelocidad').value = gps.velocidad || '';
        document.getElementById('gpsFecha').value = gps.fechaActualizacion ? gps.fechaActualizacion.slice(0, 16) : '';

        window.gpsModalMode = 'edit';

        const modal = new bootstrap.Modal(document.getElementById('gpsModal'));
        modal.show();
    } catch (error) {
        showToast('Error al cargar GPS: ' + error.message, 'danger');
    }
};

window.guardarGps = async () => {
    try {
        const idCamion = document.getElementById('gpsCamion').value;
        const latitud = document.getElementById('gpsLatitud').value;
        const longitud = document.getElementById('gpsLongitud').value;
        const velocidad = document.getElementById('gpsVelocidad').value;
        const fechaActualizacion = document.getElementById('gpsFecha').value;

        if (!idCamion) {
            showToast('El camión es requerido', 'warning');
            return;
        }

        const data = {
            idCamion: parseInt(idCamion),
            latitud: latitud ? parseFloat(latitud) : null,
            longitud: longitud ? parseFloat(longitud) : null,
            velocidad: velocidad ? parseFloat(velocidad) : null,
            fechaActualizacion: fechaActualizacion || null
        };

        const id = document.getElementById('gpsId').value;
        if (id && window.gpsModalMode === 'edit') {
            await updateCamionGps(id, data);
            showToast('GPS actualizado correctamente', 'success');
        } else {
            await createCamionGps(data);
            showToast('GPS creado correctamente', 'success');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('gpsModal'));
        modal.hide();

        loadCamionesGps();
    } catch (error) {
        showToast(error.message || 'Error al guardar GPS', 'danger');
    }
};

window.eliminarGps = async (id) => {
    if (!confirm('¿Está seguro de eliminar este GPS?')) return;

    try {
        await deleteCamionGps(id);
        showToast('GPS eliminado correctamente', 'success');
        loadCamionesGps();
    } catch (error) {
        showToast(error.message || 'Error al eliminar GPS', 'danger');
    }
};

window.filtrarGpsPorCamion = async () => {
    const idCamion = document.getElementById('filtroCamionGps')?.value;
    try {
        const gpsList = idCamion ? await getGpsByCamion(idCamion) : await getCamionesGps();
        const gpsData = Array.isArray(gpsList) ? gpsList : [gpsList];
        const tbody = document.querySelector('#camionesGpsContent table tbody');
        if (tbody) {
            tbody.innerHTML = gpsData.map(g => `
                <tr>
                    <td>${g.idCamion}</td>
                    <td>${g.camion?.placas || '-'}</td>
                    <td>${g.latitud || '-'}</td>
                    <td>${g.longitud || '-'}</td>
                    <td>${g.velocidad ? g.velocidad + ' km/h' : '-'}</td>
                    <td>${g.fechaActualizacion ? new Date(g.fechaActualizacion).toLocaleString() : '-'}</td>
                    <td>
                        <button class="btn btn-sm btn-warning" onclick="window.editarGps(${g.idCamion})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.eliminarGps(${g.idCamion})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showToast(error.message || 'Error al filtrar GPS', 'danger');
    }
};

window.loadCamionesGps = loadCamionesGps;
