import api, { showToast } from './api.js';
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
        camionesList = camiones;
        operadoresList = conductores;
        rutasList = rutas;
        tiposList = tipos;

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
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Camión</th>
                            <th>Conductor</th>
                            <th>Ruta</th>
                            <th>Tipo Residuo</th>
                            <th>Fecha Inicio</th>
                            <th>Fecha Fin</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${viajes.map(v => `
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
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${renderViajeModal()}
        `;
    } catch (error) {
        console.error('Error cargando viajes:', error);
        showToast(error.message || 'Error al cargar viajes', 'danger');
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
                                    ${camionesList.map(c => `<option value="${c.idCamion}">${c.placas} - ${c.modelo}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Conductor</label>
                                <select class="form-select" id="viajeConductor" required>
                                    <option value="">Seleccionar conductor</option>
                                    ${conductoresList.map(co => `<option value="${co.idPersona}">${co.persona?.nombre || co.nombre}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Ruta</label>
                                <select class="form-select" id="viajeRuta" required>
                                    <option value="">Seleccionar ruta</option>
                                    ${rutasList.map(r => `<option value="${r.idRuta}">${r.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Tipo de Residuo</label>
                                <select class="form-select" id="viajeTipoResiduo" required>
                                    <option value="">Seleccionar tipo</option>
                                    ${tiposList.map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('')}
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
        showToast('Error al cargar viaje: ' + error.message, 'danger');
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
            showToast('Todos los campos son requeridos', 'warning');
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
            showToast('Viaje actualizado correctamente', 'success');
        } else {
            await createViaje(data);
            showToast('Viaje creado correctamente', 'success');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('viajeModal'));
        modal.hide();

        loadViajes();
    } catch (error) {
        showToast(error.message || 'Error al guardar viaje', 'danger');
    }
};

window.eliminarViaje = async (id) => {
    if (!confirm('¿Está seguro de eliminar este viaje?')) return;

    try {
        await deleteViaje(id);
        showToast('Viaje eliminado correctamente', 'success');
        loadViajes();
    } catch (error) {
        showToast(error.message || 'Error al eliminar viaje', 'danger');
    }
};

window.iniciarViajeAction = async (id) => {
    if (!confirm('¿Iniciar este viaje?')) return;
    try {
        await iniciarViaje(id);
        showToast('Viaje iniciado correctamente', 'success');
        loadViajes();
    } catch (error) {
        showToast(error.message || 'Error al iniciar viaje', 'danger');
    }
};

window.finalizarViajeAction = async (id) => {
    if (!confirm('¿Finalizar este viaje?')) return;
    try {
        await finalizarViaje(id);
        showToast('Viaje finalizado correctamente', 'success');
        loadViajes();
    } catch (error) {
        showToast(error.message || 'Error al finalizar viaje', 'danger');
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
        showToast(error.message || 'Error al filtrar viajes', 'danger');
    }
};

window.loadViajes = loadViajes;
