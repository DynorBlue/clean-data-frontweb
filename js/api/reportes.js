import api, { showToast } from './api.js';
import { getColonias } from './colonias.js';
import { getTiposResiduo } from './tiposResiduo.js';
import { isAdmin, getUser } from '../auth/auth.js';

export const getReportes = () => api.get('/reportes');
export const getReporte = (id) => api.get(`/reportes/${id}`);
export const createReporte = (data) => api.post('/reportes', data);
export const updateReporte = (id, data) => api.put(`/reportes/${id}`, data);
export const deleteReporte = (id) => api.delete(`/reportes/${id}`);
export const getMisReportes = () => api.get('/reportes/mis-reportes');
export const getReportesByEstado = (estado) => api.get(`/reportes/estado/${estado}`);
export const getReportesByColonia = (idColonia) => api.get(`/reportes/colonia/${idColonia}`);
export const cambiarEstadoReporte = (id, estado) => api.patch(`/reportes/${id}/estado/${estado}`, {});

let reportesData = [];
let currentFilter = 'todos';

const getEstadoColor = (estado) => {
    const colors = {
        'PENDIENTE': 'warning',
        'EN_ATENCION': 'info',
        'RESUELTO': 'success'
    };
    return colors[estado] || 'secondary';
};

export const loadReportes = async () => {
    try {
        const content = document.getElementById('reportesContent');
        if (!content) return;

        content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        const [reportes, colonias, tipos] = await Promise.all([
            getReportes(),
            getColonias(),
            getTiposResiduo()
        ]);

        reportesData = reportes;
        window.reportesColoniasList = colonias;
        window.reportesTiposList = tipos;

        const user = getUser();
        const esAdmin = isAdmin();

        content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                ${esAdmin ? `
                    <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#reporteModal" onclick="window.reporteModalMode='create'; window.resetReporteModal();">
                        <i class="bi bi-plus-circle"></i> Nuevo Reporte
                    </button>
                ` : ''}
                <button class="btn btn-secondary" onclick="window.loadReportes()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
                ${esAdmin ? `
                    <button class="btn btn-outline-primary" onclick="window.cargarMisReportes()">
                        <i class="bi bi-person"></i> Mis Reportes
                    </button>
                    <select class="form-select" style="max-width:200px;" id="filtroEstadoReporte" onchange="window.filtrarReportesPorEstado()">
                        <option value="todos">Todos los estados</option>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="EN_ATENCION">En Atención</option>
                        <option value="RESUELTO">Resuelto</option>
                    </select>
                ` : ''}
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Fecha</th>
                            <th>Usuario</th>
                            <th>Colonia</th>
                            <th>Tipo Residuo</th>
                            <th>Descripción</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${reportes.map(r => `
                            <tr>
                                <td>${r.idReporte}</td>
                                <td>${r.fecha ? new Date(r.fecha).toLocaleString() : '-'}</td>
                                <td>${r.usuario?.email || '-'}</td>
                                <td>${r.colonia?.nombre || '-'}</td>
                                <td>${r.tipoResiduo?.nombre || '-'}</td>
                                <td>${r.descripcion || '-'}</td>
                                <td><span class="badge bg-${getEstadoColor(r.estado)}">${r.estado}</span></td>
                                <td>
                                    ${esAdmin ? `
                                        <div class="dropdown d-inline-block">
                                            <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                                Estado
                                            </button>
                                            <ul class="dropdown-menu">
                                                <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'PENDIENTE')">Pendiente</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'EN_ATENCION')">En Atención</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'RESUELTO')">Resuelto</a></li>
                                            </ul>
                                        </div>
                                        <button class="btn btn-sm btn-danger" onclick="window.eliminarReporte(${r.idReporte})">
                                            <i class="bi bi-trash"></i>
                                        </button>
                                    ` : `
                                        <span class="text-muted">Sin acciones</span>
                                    `}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${renderReporteModal()}
        `;
    } catch (error) {
        console.error('Error cargando reportes:', error);
        showToast(error.message || 'Error al cargar reportes', 'danger');
    }
};

const renderReporteModal = () => `
    <div class="modal fade" id="reporteModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="reporteModalTitle">Nuevo Reporte</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="reporteForm">
                        <input type="hidden" id="reporteId">
                        <div class="mb-3">
                            <label class="form-label">Colonia</label>
                            <select class="form-select" id="reporteColonia" required>
                                <option value="">Seleccionar colonia</option>
                                ${(window.reportesColoniasList || []).map(c => `<option value="${c.idColonia}">${c.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Tipo de Residuo</label>
                            <select class="form-select" id="reporteTipoResiduo">
                                <option value="">Seleccionar tipo (opcional)</option>
                                ${(window.reportesTiposList || []).map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('')}
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <textarea class="form-control" id="reporteDescripcion" rows="3" placeholder="Describe el problema..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarReporte()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetReporteModal = async () => {
    document.getElementById('reporteModalTitle').textContent = 'Nuevo Reporte';
    document.getElementById('reporteId').value = '';
    document.getElementById('reporteDescripcion').value = '';
    
    const [colonias, tipos] = await Promise.all([
        getColonias(),
        getTiposResiduo()
    ]);
    
    window.reportesColoniasList = colonias;
    window.reportesTiposList = tipos;
    
    document.getElementById('reporteColonia').innerHTML = '<option value="">Seleccionar colonia</option>' + 
        colonias.map(c => `<option value="${c.idColonia}">${c.nombre}</option>`).join('');
    document.getElementById('reporteTipoResiduo').innerHTML = '<option value="">Seleccionar tipo (opcional)</option>' + 
        tipos.map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('');
};

window.guardarReporte = async () => {
    try {
        const idColonia = document.getElementById('reporteColonia').value;
        const idTipoResiduo = document.getElementById('reporteTipoResiduo').value;
        const descripcion = document.getElementById('reporteDescripcion').value.trim();

        if (!idColonia) {
            showToast('La colonia es requerida', 'warning');
            return;
        }

        const data = {
            colonia: { idColonia: parseInt(idColonia) },
            tipoResiduo: idTipoResiduo ? { idTipo: parseInt(idTipoResiduo) } : null,
            descripcion: descripcion || null
        };

        await createReporte(data);
        showToast('Reporte creado correctamente', 'success');

        const modal = bootstrap.Modal.getInstance(document.getElementById('reporteModal'));
        modal.hide();

        loadReportes();
    } catch (error) {
        showToast(error.message || 'Error al crear reporte', 'danger');
    }
};

window.eliminarReporte = async (id) => {
    if (!confirm('¿Está seguro de eliminar este reporte?')) return;

    try {
        await deleteReporte(id);
        showToast('Reporte eliminado correctamente', 'success');
        loadReportes();
    } catch (error) {
        showToast(error.message || 'Error al eliminar reporte', 'danger');
    }
};

window.cambiarEstadoReporteAction = async (id, estado) => {
    try {
        await cambiarEstadoReporte(id, estado);
        showToast('Estado actualizado correctamente', 'success');
        
        if (currentFilter === 'misReportes') {
            window.cargarMisReportes();
        } else {
            loadReportes();
        }
    } catch (error) {
        showToast(error.message || 'Error al cambiar estado', 'danger');
    }
};

window.cargarMisReportes = async () => {
    currentFilter = 'misReportes';
    try {
        const reportes = await getMisReportes();
        const tbody = document.querySelector('#reportesContent table tbody');
        if (tbody) {
            tbody.innerHTML = reportes.map(r => `
                <tr>
                    <td>${r.idReporte}</td>
                    <td>${r.fecha ? new Date(r.fecha).toLocaleString() : '-'}</td>
                    <td>${r.usuario?.email || '-'}</td>
                    <td>${r.colonia?.nombre || '-'}</td>
                    <td>${r.tipoResiduo?.nombre || '-'}</td>
                    <td>${r.descripcion || '-'}</td>
                    <td><span class="badge bg-${getEstadoColor(r.estado)}">${r.estado}</span></td>
                    <td>
                        <span class="text-muted">Sin acciones</span>
                    </td>
                </tr>
            `).join('');
        }
        document.getElementById('filtroEstadoReporte')?.setAttribute('disabled', 'true');
    } catch (error) {
        showToast(error.message || 'Error al cargar mis reportes', 'danger');
    }
};

window.filtrarReportesPorEstado = async () => {
    const estado = document.getElementById('filtroEstadoReporte')?.value;
    currentFilter = estado === 'todos' ? 'todos' : estado;
    try {
        const reportes = estado === 'todos' ? await getReportes() : await getReportesByEstado(estado);
        const tbody = document.querySelector('#reportesContent table tbody');
        const esAdmin = isAdmin();
        if (tbody) {
            tbody.innerHTML = reportes.map(r => `
                <tr>
                    <td>${r.idReporte}</td>
                    <td>${r.fecha ? new Date(r.fecha).toLocaleString() : '-'}</td>
                    <td>${r.usuario?.email || '-'}</td>
                    <td>${r.colonia?.nombre || '-'}</td>
                    <td>${r.tipoResiduo?.nombre || '-'}</td>
                    <td>${r.descripcion || '-'}</td>
                    <td><span class="badge bg-${getEstadoColor(r.estado)}">${r.estado}</span></td>
                    <td>
                        ${esAdmin ? `
                            <div class="dropdown d-inline-block">
                                <button class="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
                                    Estado
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'PENDIENTE')">Pendiente</a></li>
                                    <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'EN_ATENCION')">En Atención</a></li>
                                    <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'RESUELTO')">Resuelto</a></li>
                                </ul>
                            </div>
                            <button class="btn btn-sm btn-danger" onclick="window.eliminarReporte(${r.idReporte})">
                                <i class="bi bi-trash"></i>
                            </button>
                        ` : `
                            <span class="text-muted">Sin acciones</span>
                        `}
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        showToast(error.message || 'Error al filtrar reportes', 'danger');
    }
};

window.loadReportes = loadReportes;
