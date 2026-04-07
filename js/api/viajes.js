import api from './api.js';
import { SwalAlert, handleDeleteError } from '../components/utils.js';
import { getCamiones } from './camiones.js';
import { getConductores } from './conductores.js';
import { getRutas } from './rutas.js';
import { getTiposResiduo } from './tiposResiduo.js';

export const getViajes = () => api.get('/viajes');
export const getViaje = (id) => api.get(`/viajes/${id}`);
export const createViaje = (data) => api.post('/viajes', data);
export const updateViaje = (id, data) => api.put(`/viajes/${id}`, data);
export const deleteViaje = (id) => api.delete(`/viajes/${id}`);
export const getViajesByEstado = (estado) => api.get(`/viajes/estado/${estado}`);
export const getViajesByConductor = (idConductor) => api.get(`/viajes/conductor/${idConductor}`);
export const getViajesByCamion = (idCamion) => api.get(`/viajes/camion/${idCamion}`);
export const getViajesByColonia = (idColonia) => api.get(`/viajes/colonia/${idColonia}`);
export const iniciarViaje = (id) => api.post(`/viajes/${id}/iniciar`, {});
export const finalizarViaje = (id) => api.post(`/viajes/${id}/finalizar`, {});

let viajesData = [];
let camionesList = [];
let conductoresList = [];
let rutasList = [];
let tiposList = [];

const getEstadoColor = (estado) => {
    const colors = {
        'EN_CURSO': 'primary',
        'FINALIZADO': 'success',
        'CANCELADO': 'danger'
    };
    return colors[estado] || 'secondary';
};

const getEstadoBadge = (estado) => {
    const badges = {
        'EN_CURSO': 'en-atencion',
        'FINALIZADO': 'activo',
        'CANCELADO': 'inactivo'
    };
    return badges[estado] || 'inactivo';
};

export const loadViajes = async () => {
    try {
        const content = document.getElementById('viajesContent');
        if (!content) return;

        content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        const [viajes, camiones, conductores, rutas, tipos] = await Promise.all([
            getViajes(),
            getCamiones(),
            getConductores(),
            getRutas(),
            getTiposResiduo()
        ]);

        viajesData = viajes;
        window.viajesCamionesList = camiones;
        window.viajesConductoresList = conductores;
        window.viajesRutasList = rutas;
        window.viajesTiposList = tipos;

        content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#viajeModal" onclick="window.viajeModalMode='create'; window.resetViajeModal();">
                    <i class="bi bi-plus-circle"></i> Nuevo Viaje
                </button>
                <button class="btn btn-secondary" onclick="window.loadViajes()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
                <select class="form-select" style="max-width:200px;" id="filtroEstadoViaje" onchange="window.filtrarViajesPorEstado()">
                    <option value="">Todos los estados</option>
                    <option value="EN_CURSO">En Curso</option>
                    <option value="FINALIZADO">Finalizado</option>
                    <option value="CANCELADO">Cancelado</option>
                </select>
            </div>
            <div class="table-header-info">
                <h5><i class="bi bi-truck me-2"></i>Viajes</h5>
                <span class="badge-count">${viajes.length} registros</span>
            </div>
            <div class="table-container">
                <div class="table-responsive">
                    <table class="table table-custom">
                        <thead>
                            <tr>
                                <th><i class="bi bi-hash"></i> ID</th>
                                <th><i class="bi bi-car-front"></i> Camión</th>
                                <th><i class="bi bi-person"></i> Conductor</th>
                                <th><i class="bi bi-signpost"></i> Ruta</th>
                                <th><i class="bi bi-recycle"></i> Tipo Residuo</th>
                                <th><i class="bi bi-play-circle"></i> Inicio</th>
                                <th><i class="bi bi-stop-circle"></i> Fin</th>
                                <th><i class="bi bi-info-circle"></i> Estado</th>
                                <th><i class="bi bi-gear"></i> Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${viajes.map(v => `
                                <tr>
                                    <td><strong>#${v.idViaje}</strong></td>
                                    <td>${v.camion?.placas || '-'}</td>
                                    <td>${v.conductor?.persona?.nombre || '-'}</td>
                                    <td>${v.ruta?.nombre || '-'}</td>
                                    <td>${v.tipoResiduo?.nombre || '-'}</td>
                                    <td>${v.fechaInicio ? new Date(v.fechaInicio).toLocaleString() : '-'}</td>
                                    <td>${v.fechaFin ? new Date(v.fechaFin).toLocaleString() : '-'}</td>
                                    <td><span class="badge badge-${getEstadoBadge(v.estado)}">${v.estado.replace('_', ' ')}</span></td>
                                    <td class="table-actions">
                                        ${v.estado !== 'FINALIZADO' ? `
                                            ${v.estado !== 'EN_CURSO' ? `
                                                <button class="btn btn-success btn-sm" onclick="window.iniciarViajeAction(${v.idViaje})" title="Iniciar Viaje">
                                                    <i class="bi bi-play-fill"></i>
                                                </button>
                                            ` : `
                                                <button class="btn btn-info btn-sm" onclick="window.finalizarViajeAction(${v.idViaje})" title="Finalizar Viaje">
                                                    <i class="bi bi-stop-fill"></i>
                                                </button>
                                            `}
                                        ` : ''}
                                        <button class="btn btn-warning btn-sm" onclick="window.editarViaje(${v.idViaje})">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="window.eliminarViaje(${v.idViaje})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
            ${renderViajeModal()}
        `;
    } catch (error) {
        console.error('Error cargando viajes:', error);
        SwalAlert.error('Error', error.message || 'Error al cargar viajes');
    }
};

const renderViajeModal = () => `
    <div class="modal fade" id="viajeModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="viajeModalTitle">Nuevo Viaje</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="viajeForm">
                        <input type="hidden" id="viajeId">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Camión</label>
                                <select class="form-select" id="viajeCamion" required>
                                    <option value="">Seleccionar camión</option>
                                    ${(window.viajesCamionesList || []).map(c => `<option value="${c.idCamion}">${c.placas} - ${c.modelo}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Conductor</label>
                                <select class="form-select" id="viajeConductor" required>
                                    <option value="">Seleccionar conductor</option>
                                    ${(window.viajesConductoresList || []).map(co => `<option value="${co.idPersona}">${co.persona?.nombre || co.nombre}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Ruta</label>
                                <select class="form-select" id="viajeRuta" required>
                                    <option value="">Seleccionar ruta</option>
                                    ${(window.viajesRutasList || []).map(r => `<option value="${r.idRuta}">${r.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tipo de Residuo</label>
                                <select class="form-select" id="viajeTipoResiduo" required>
                                    <option value="">Seleccionar tipo</option>
                                    ${(window.viajesTiposList || []).map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Fecha Inicio</label>
                                <input type="datetime-local" class="form-control" id="viajeFechaInicio">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Fecha Fin</label>
                                <input type="datetime-local" class="form-control" id="viajeFechaFin">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Estado</label>
                            <select class="form-select" id="viajeEstado">
                                <option value="EN_CURSO">En Curso</option>
                                <option value="FINALIZADO">Finalizado</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarViaje()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetViajeModal = async () => {
    document.getElementById('viajeModalTitle').textContent = 'Nuevo Viaje';
    document.getElementById('viajeId').value = '';
    document.getElementById('viajeFechaInicio').value = '';
    document.getElementById('viajeFechaFin').value = '';
    document.getElementById('viajeEstado').value = 'EN_CURSO';
    
    const [camiones, conductores, rutas, tipos] = await Promise.all([
        getCamiones(),
        getConductores(),
        getRutas(),
        getTiposResiduo()
    ]);
    
    window.viajesCamionesList = camiones;
    window.viajesConductoresList = conductores;
    window.viajesRutasList = rutas;
    window.viajesTiposList = tipos;
    
    document.getElementById('viajeCamion').innerHTML = '<option value="">Seleccionar camión</option>' + 
        camiones.map(c => `<option value="${c.idCamion}">${c.placas} - ${c.modelo}</option>`).join('');
    document.getElementById('viajeConductor').innerHTML = '<option value="">Seleccionar conductor</option>' + 
        conductores.map(co => `<option value="${co.idPersona}">${co.persona?.nombre || co.nombre}</option>`).join('');
    document.getElementById('viajeRuta').innerHTML = '<option value="">Seleccionar ruta</option>' + 
        rutas.map(r => `<option value="${r.idRuta}">${r.nombre}</option>`).join('');
    document.getElementById('viajeTipoResiduo').innerHTML = '<option value="">Seleccionar tipo</option>' + 
        tipos.map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('');
};

window.editarViaje = async (id) => {
    try {
        const viaje = await getViaje(id);

        document.getElementById('viajeModalTitle').textContent = 'Editar Viaje';
        document.getElementById('viajeId').value = viaje.idViaje;
        document.getElementById('viajeCamion').value = viaje.camion?.idCamion || '';
        document.getElementById('viajeConductor').value = viaje.conductor?.idPersona || '';
        document.getElementById('viajeRuta').value = viaje.ruta?.idRuta || '';
        document.getElementById('viajeTipoResiduo').value = viaje.tipoResiduo?.idTipo || '';
        document.getElementById('viajeFechaInicio').value = viaje.fechaInicio ? viaje.fechaInicio.slice(0, 16) : '';
        document.getElementById('viajeFechaFin').value = viaje.fechaFin ? viaje.fechaFin.slice(0, 16) : '';
        document.getElementById('viajeEstado').value = viaje.estado || 'EN_CURSO';

        window.viajeModalMode = 'edit';

        const modal = new bootstrap.Modal(document.getElementById('viajeModal'));
        modal.show();
    } catch (error) {
        SwalAlert.error('Error', 'Error al cargar viaje: ' + error.message);
    }
};

window.guardarViaje = async () => {
    try {
        const id = document.getElementById('viajeId').value;
        const idCamion = document.getElementById('viajeCamion').value;
        const idConductor = document.getElementById('viajeConductor').value;
        const idRuta = document.getElementById('viajeRuta').value;
        const idTipoResiduo = document.getElementById('viajeTipoResiduo').value;
        const fechaInicio = document.getElementById('viajeFechaInicio').value;
        const fechaFin = document.getElementById('viajeFechaFin').value;
        const estado = document.getElementById('viajeEstado').value;

        if (!idCamion || !idConductor || !idRuta || !idTipoResiduo) {
            SwalAlert.warning('Advertencia', 'Todos los campos son requeridos');
            return;
        }

        const data = {
            idCamion: parseInt(idCamion),
            idConductor: parseInt(idConductor),
            idRuta: parseInt(idRuta),
            idTipoResiduo: parseInt(idTipoResiduo),
            fechaInicio: fechaInicio || null,
            fechaFin: fechaFin || null,
            estado
        };

        if (id && window.viajeModalMode === 'edit') {
            await updateViaje(id, data);
            SwalAlert.success('Éxito', 'Viaje actualizado correctamente');
        } else {
            await createViaje(data);
            SwalAlert.success('Éxito', 'Viaje creado correctamente');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('viajeModal'));
        modal.hide();

        loadViajes();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al guardar viaje');
    }
};

window.eliminarViaje = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar eliminación', '¿Está seguro de eliminar este viaje?');
    if (!isConfirmed) return;

    try {
        await deleteViaje(id);
        SwalAlert.success('Éxito', 'Viaje eliminado correctamente');
        loadViajes();
    } catch (error) {
        if (!handleDeleteError(error, 'el viaje')) {
            SwalAlert.error('Error', error.message || 'Error al eliminar viaje');
        }
    }
};

window.iniciarViajeAction = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar', '¿Iniciar este viaje?');
    if (!isConfirmed) return;
    try {
        await iniciarViaje(id);
        SwalAlert.success('Éxito', 'Viaje iniciado correctamente');
        loadViajes();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al iniciar viaje');
    }
};

window.finalizarViajeAction = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar', '¿Finalizar este viaje?');
    if (!isConfirmed) return;
    try {
        await finalizarViaje(id);
        SwalAlert.success('Éxito', 'Viaje finalizado correctamente');
        loadViajes();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al finalizar viaje');
    }
};

window.filtrarViajesPorEstado = async () => {
    const estado = document.getElementById('filtroEstadoViaje')?.value;
    try {
        const viajes = estado ? await getViajesByEstado(estado) : await getViajes();
        const tbody = document.querySelector('#viajesContent table tbody');
        if (tbody) {
            tbody.innerHTML = viajes.map(v => `
                <tr>
                    <td>${v.idViaje}</td>
                    <td>${v.camion?.placas || '-'}</td>
                    <td>${v.conductor?.persona?.nombre || '-'}</td>
                    <td>${v.ruta?.nombre || '-'}</td>
                    <td>${v.tipoResiduo?.nombre || '-'}</td>
                    <td>${v.fechaInicio ? new Date(v.fechaInicio).toLocaleString() : '-'}</td>
                    <td>${v.fechaFin ? new Date(v.fechaFin).toLocaleString() : '-'}</td>
                    <td><span class="badge bg-${getEstadoColor(v.estado)}">${v.estado}</span></td>
                    <td>
                        ${v.estado !== 'FINALIZADO' ? `
                            ${v.estado !== 'EN_CURSO' ? `
                                <button class="btn btn-sm btn-success" onclick="window.iniciarViajeAction(${v.idViaje})" title="Iniciar Viaje">
                                    <i class="bi bi-play-fill"></i>
                                </button>
                            ` : `
                                <button class="btn btn-sm btn-info" onclick="window.finalizarViajeAction(${v.idViaje})" title="Finalizar Viaje">
                                    <i class="bi bi-stop-fill"></i>
                                </button>
                            `}
                        ` : ''}
                        <button class="btn btn-sm btn-warning" onclick="window.editarViaje(${v.idViaje})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="window.eliminarViaje(${v.idViaje})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al filtrar viajes');
    }
};

window.loadViajes = loadViajes;
