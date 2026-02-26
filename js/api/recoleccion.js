import api from './api.js';
import { SwalAlert } from '../components/utils.js';

export const getRecolecciones = () => api.get('/recolecciones');
export const getRecoleccion = (id) => api.get(`/recolecciones/${id}`);
export const createRecoleccion = (data) => api.post('/recolecciones', data);
export const updateRecoleccion = (id, data) => api.put(`/recolecciones/${id}`, data);
export const deleteRecoleccion = (id) => api.delete(`/recolecciones/${id}`);
export const getRecoleccionesByViaje = (idViaje) => api.get(`/recolecciones/viaje/${idViaje}`);

let recoleccionesData = [];
let viajesList = [];
let tiposResiduoList = [];

const loadOptions = async () => {
    try {
        const [viajes, tiposResiduo] = await Promise.all([
            api.get('/viajes'),
            api.get('/tipos-residuo')
        ]);
        viajesList = viajes;
        tiposResiduoList = tiposResiduo;
    } catch (error) {
        console.error('Error cargando opciones:', error);
    }
};

export const loadRecolecciones = async () => {
    try {
        await loadOptions();
        
        const content = document.getElementById('recoleccionesContent');
        if (!content) return;
        
        content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';
        
        const recolecciones = await getRecolecciones();
        recoleccionesData = recolecciones;
        
        content.innerHTML = `
            <div class="mb-3">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#recoleccionModal" onclick="window.recoleccionModalMode='create'; window.resetRecoleccionModal();">
                    <i class="bi bi-plus-circle"></i> Nueva Recolección
                </button>
                <button class="btn btn-secondary" onclick="window.loadRecolecciones()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Viaje</th>
                            <th>Tipo Residuo</th>
                            <th>Volumen (m³)</th>
                            <th>Peso (kg)</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${recolecciones.map(r => {
                            const tipoResiduo = tiposResiduoList.find(t => t.idTipo === r.idTipoResiduo);
                            return `
                            <tr>
                                <td>${r.idRecoleccion}</td>
                                <td>${r.idViaje || '-'}</td>
                                <td>${tipoResiduo?.nombre || '-'}</td>
                                <td>${r.volumenM3 || '-'}</td>
                                <td>${r.pesoKg || '-'}</td>
                                <td>${r.fechaRegistro ? new Date(r.fechaRegistro).toLocaleDateString() : '-'}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning" onclick="window.editarRecoleccion(${r.idRecoleccion})">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="window.eliminarRecoleccion(${r.idRecoleccion})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `}).join('')}
                    </tbody>
                </table>
            </div>
            ${renderRecoleccionModal()}
        `;
        
        initRecoleccionModal();
    } catch (error) {
        console.error('Error cargando recolecciones:', error);
        SwalAlert.error('Error', error.message || 'Error al cargar recolecciones');
    }
};

const renderRecoleccionModal = () => `
    <div class="modal fade" id="recoleccionModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="recoleccionModalTitle">Nueva Recolección</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="recoleccionForm">
                        <input type="hidden" id="recoleccionId">
                        <div class="mb-3">
                            <label class="form-label">Viaje</label>
                            <select class="form-select" id="recoleccionIdViaje" required>
                                <option value="">Seleccionar viaje...</option>
                                ${viajesList.map(v => `<option value="${v.idViaje}">Viaje #${v.idViaje} - ${v.ruta?.nombre || 'Sin ruta'}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tipo de Residuo</label>
                            <select class="form-select" id="recoleccionIdTipoResiduo" required>
                                <option value="">Seleccionar tipo...</option>
                                ${tiposResiduoList.map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Volumen (m³)</label>
                                <input type="number" step="0.01" class="form-control" id="recoleccionVolumenM3">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Peso (kg)</label>
                                <input type="number" step="0.01" class="form-control" id="recoleccionPesoKg">
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarRecoleccion()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetRecoleccionModal = () => {
    document.getElementById('recoleccionModalTitle').textContent = 'Nueva Recolección';
    document.getElementById('recoleccionId').value = '';
    document.getElementById('recoleccionVolumenM3').value = '';
    document.getElementById('recoleccionPesoKg').value = '';
    document.getElementById('recoleccionIdViaje').innerHTML = '<option value="">Cargando viajes...</option>';
    document.getElementById('recoleccionIdTipoResiduo').innerHTML = '<option value="">Cargando tipos...</option>';
};

const cargarOpcionesModal = async () => {
    try {
        const [viajes, tiposResiduo] = await Promise.all([
            api.get('/viajes'),
            api.get('/tipos-residuo')
        ]);
        
        document.getElementById('recoleccionIdViaje').innerHTML = '<option value="">Seleccionar viaje...</option>' +
            viajes.map(v => `<option value="${v.idViaje}">Viaje #${v.idViaje} - ${v.ruta?.nombre || 'Sin ruta'}</option>`).join('');
        document.getElementById('recoleccionIdTipoResiduo').innerHTML = '<option value="">Seleccionar tipo...</option>' +
            tiposResiduo.map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('');
    } catch (error) {
        console.error('Error cargando opciones del modal:', error);
        SwalAlert.error('Error', 'Error al cargar las opciones');
    }
};

const initRecoleccionModal = () => {
    const modal = document.getElementById('recoleccionModal');
    if (!modal) return;
    
    modal.addEventListener('shown.bs.modal', async () => {
        const modo = window.recoleccionModalMode;
        if (modo === 'create') {
            window.resetRecoleccionModal();
            await cargarOpcionesModal();
        } else if (modo === 'edit') {
            await loadOptions();
        }
    });
};

window.editarRecoleccion = async (id) => {
    try {
        await loadOptions();
        
        const recoleccion = await getRecoleccion(id);
        
        document.getElementById('recoleccionModalTitle').textContent = 'Editar Recolección';
        document.getElementById('recoleccionId').value = recoleccion.idRecoleccion;
        
        const idViajeSelect = document.getElementById('recoleccionIdViaje');
        idViajeSelect.innerHTML = `<option value="">Seleccionar viaje...</option>` +
            viajesList.map(v => `<option value="${v.idViaje}" ${v.idViaje === recoleccion.idViaje ? 'selected' : ''}>Viaje #${v.idViaje}</option>`).join('');
        
        const idTipoSelect = document.getElementById('recoleccionIdTipoResiduo');
        idTipoSelect.innerHTML = `<option value="">Seleccionar tipo...</option>` +
            tiposResiduoList.map(t => `<option value="${t.idTipo}" ${t.idTipo === recoleccion.idTipoResiduo ? 'selected' : ''}>${t.nombre}</option>`).join('');
        
        document.getElementById('recoleccionVolumenM3').value = recoleccion.volumenM3 || '';
        document.getElementById('recoleccionPesoKg').value = recoleccion.pesoKg || '';
        
        window.recoleccionModalMode = 'edit';
        
        const modal = new bootstrap.Modal(document.getElementById('recoleccionModal'));
        modal.show();
    } catch (error) {
        SwalAlert.error('Error', 'Error al cargar recolección: ' + error.message);
    }
};

window.guardarRecoleccion = async () => {
    try {
        const id = document.getElementById('recoleccionId').value;
        const idViaje = document.getElementById('recoleccionIdViaje').value;
        const idTipoResiduo = document.getElementById('recoleccionIdTipoResiduo').value;
        const volumenM3 = document.getElementById('recoleccionVolumenM3').value;
        const pesoKg = document.getElementById('recoleccionPesoKg').value;
        
        if (!idViaje || !idTipoResiduo) {
            SwalAlert.warning('Advertencia', 'Viaje y tipo de residuo son requeridos');
            return;
        }
        
        const data = {
            idViaje: parseInt(idViaje),
            idTipoResiduo: parseInt(idTipoResiduo),
            volumenM3: volumenM3 ? parseFloat(volumenM3) : null,
            pesoKg: pesoKg ? parseFloat(pesoKg) : null
        };
        
        if (id && window.recoleccionModalMode === 'edit') {
            await updateRecoleccion(id, data);
            SwalAlert.success('Éxito', 'Recolección actualizada correctamente');
        } else {
            await createRecoleccion(data);
            SwalAlert.success('Éxito', 'Recolección creada correctamente');
        }
        
        const modal = bootstrap.Modal.getInstance(document.getElementById('recoleccionModal'));
        modal.hide();
        
        loadRecolecciones();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al guardar recolección');
    }
};

window.eliminarRecoleccion = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar eliminación', '¿Está seguro de eliminar esta recolección?');
    if (!isConfirmed) return;
    
    try {
        await deleteRecoleccion(id);
        SwalAlert.success('Éxito', 'Recolección eliminada correctamente');
        loadRecolecciones();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al eliminar recolección');
    }
};

window.loadRecolecciones = loadRecolecciones;
