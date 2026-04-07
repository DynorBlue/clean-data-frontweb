import api from './api.js';
import { SwalAlert, handleDeleteError } from '../components/utils.js';
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
let mapReportes = null;

const getEstadoBgClass = (estado) => {
    const bgClasses = {
        'PENDIENTE': 'bg-warning text-dark',
        'EN_ATENCION': 'bg-info text-white',
        'RESUELTO': 'bg-success text-white'
    };
    return bgClasses[estado] || 'bg-secondary';
};

const getReporteBadgeClass = (estado) => {
    const badges = {
        'PENDIENTE': 'pendiente',
        'EN_ATENCION': 'en-atencion',
        'RESUELTO': 'resuelto'
    };
    return badges[estado] || 'inactivo';
};

const renderReporteCard = (r, esAdmin = false) => `
    <div class="col">
        <div class="card h-100 shadow-sm" style="cursor: pointer;" onclick="window.seleccionarReporteEnMapa(${r.idReporte})">
            <div class="card-header ${getEstadoBgClass(r.estado)} d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-file-earmark-text"></i> <strong>Reporte #${r.idReporte}</strong>
                    <span class="badge bg-light text-dark ms-1">${r.estado.replace('_', ' ')}</span>
                </div>
                ${esAdmin ? `
                    <div class="d-flex gap-2">
                        <div class="dropdown position-static">
                            <button class="btn btn-sm btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown">
                                Estado
                            </button>
                            <ul class="dropdown-menu" style="z-index: 1050;">
                                <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'PENDIENTE')">Pendiente</a></li>
                                <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'EN_ATENCION')">En Atención</a></li>
                                <li><a class="dropdown-item" href="#" onclick="window.cambiarEstadoReporteAction(${r.idReporte}, 'RESUELTO')">Resuelto</a></li>
                            </ul>
                        </div>
                        <button class="btn btn-sm btn-danger" onclick="window.eliminarReporte(${r.idReporte})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
            <div class="card-body">
                <p class="card-text mb-2">
                    <i class="bi bi-person me-2"></i>
                    <strong>Usuario:</strong> ${r.usuario?.email || '-'}
                </p>
                <p class="card-text mb-2">
                    <i class="bi bi-geo-alt me-2"></i>
                    <strong>Colonia:</strong> ${r.colonia?.nombre || '-'}
                </p>
                <p class="card-text mb-2">
                    <i class="bi bi-recycle me-2"></i>
                    <strong>Tipo:</strong> ${r.tipoResiduo?.nombre || '-'}
                </p>
                <p class="card-text mb-2">
                    <i class="bi bi-clock me-2"></i>
                    <strong>Fecha:</strong> ${r.fecha ? new Date(r.fecha).toLocaleString() : '-'}
                </p>
                <p class="card-text mb-0">
                    <i class="bi bi-card-text me-2"></i>
                    <strong>Descripción:</strong> ${r.descripcion || '-'}
                </p>
            </div>
        </div>
    </div>
`;

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
                    <button class="btn btn-success" id="btnMostrarTodosReportes" style="display:none;" onclick="window.mostrarTodosLosReportes()">
                        <i class="bi bi-eye"></i> Mostrar todos
                    </button>
                ` : ''}
            </div>
            <div class="mb-4">
                <div id="mapaReportes" style="height: 400px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);"></div>
            </div>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" id="reportesCardsContainer">
                ${reportes.map(r => renderReporteCard(r, esAdmin)).join('')}
            </div>
            ${renderReporteModal()}
        `;

        setTimeout(() => initMapaReportes(reportes), 100);

    } catch (error) {
        console.error('Error cargando reportes:', error);
        SwalAlert.error('Error', error.message || 'Error al cargar reportes');
    }
};

const initMapaReportes = (reportes) => {
    const mapContainer = document.getElementById('mapaReportes');
    if (!mapContainer) return;

    if (mapReportes) {
        mapReportes.remove();
        mapReportes = null;
    }

    const reportesConCoords = reportes.filter(r => r.colonia?.latitud && r.colonia?.longitud);

    if (reportesConCoords.length === 0) {
        mapContainer.innerHTML = '<div class="d-flex align-items-center justify-content-center h-100 text-muted">No hay reportes con coordenadas disponibles</div>';
        return;
    }

    mapReportes = L.map('mapaReportes').setView([reportesConCoords[0].colonia.latitud, reportesConCoords[0].colonia.longitud], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(mapReportes);

    const coloniaStats = {};
    const reporteAColonia = {};
    reportesConCoords.forEach(r => {
        const idColonia = r.colonia.idColonia;
        reporteAColonia[r.idReporte] = idColonia;
        if (!coloniaStats[idColonia]) {
            coloniaStats[idColonia] = {
                nombre: r.colonia.nombre,
                latitud: r.colonia.latitud,
                longitud: r.colonia.longitud,
                total: 0,
                pendiente: 0,
                enAtencion: 0,
                resuelto: 0
            };
        }
        coloniaStats[idColonia].total++;
        if (r.estado === 'PENDIENTE') coloniaStats[idColonia].pendiente++;
        else if (r.estado === 'EN_ATENCION') coloniaStats[idColonia].enAtencion++;
        else if (r.estado === 'RESUELTO') coloniaStats[idColonia].resuelto++;
    });

    const maxReportes = Math.max(...Object.values(coloniaStats).map(c => c.total));

    const circulosReportes = {};

    Object.values(coloniaStats).forEach(c => {
        const radius = 100 + (c.total / maxReportes) * 400;
        
        let fillColor;
        if (c.pendiente >= c.enAtencion && c.pendiente >= c.resuelto) {
            fillColor = '#ffc107';
        } else if (c.enAtencion >= c.pendiente && c.enAtencion >= c.resuelto) {
            fillColor = '#0dcaf0';
        } else {
            fillColor = '#198754';
        }

        const popupContent = `
            <div style="min-width: 200px;">
                <h6 class="mb-2"><i class="bi bi-geo-alt"></i> ${c.nombre}</h6>
                <p class="mb-1"><strong>Total reportes:</strong> ${c.total}</p>
                <p class="mb-1"><span class="badge bg-warning text-dark">Pendiente:</span> ${c.pendiente}</p>
                <p class="mb-1"><span class="badge bg-info text-white">En Atención:</span> ${c.enAtencion}</p>
                <p class="mb-0"><span class="badge bg-success">Resuelto:</span> ${c.resuelto}</p>
            </div>
        `;

        const circulo = L.circle([c.latitud, c.longitud], {
            radius: radius,
            fillColor: fillColor,
            color: '#333',
            weight: 1,
            opacity: 1,
            fillOpacity: 0.6
        })
        .addTo(mapReportes)
        .bindPopup(popupContent);

        Object.keys(coloniaStats).forEach(idColonia => {
            if (coloniaStats[idColonia].nombre === c.nombre) {
                circulosReportes[idColonia] = circulo;
            }
        });
    });

    window.circulosReportes = circulosReportes;
    window.coloniaStats = coloniaStats;
    window.reporteAColonia = reporteAColonia;

    const bounds = Object.values(coloniaStats).map(c => [c.latitud, c.longitud]);
    if (bounds.length > 0) {
        mapReportes.fitBounds(bounds, { padding: [50, 50] });
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
            SwalAlert.warning('Advertencia', 'La colonia es requerida');
            return;
        }

        const data = {
            colonia: { idColonia: parseInt(idColonia) },
            tipoResiduo: idTipoResiduo ? { idTipo: parseInt(idTipoResiduo) } : null,
            descripcion: descripcion || null
        };

        await createReporte(data);
        SwalAlert.success('Éxito', 'Reporte creado correctamente');

        const modal = bootstrap.Modal.getInstance(document.getElementById('reporteModal'));
        modal.hide();

        loadReportes();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al crear reporte');
    }
};

window.eliminarReporte = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar eliminación', '¿Está seguro de eliminar este reporte?');
    if (!isConfirmed) return;

    try {
        await deleteReporte(id);
        SwalAlert.success('Éxito', 'Reporte eliminado correctamente');
        loadReportes();
    } catch (error) {
        if (!handleDeleteError(error, 'el reporte')) {
            SwalAlert.error('Error', error.message || 'Error al eliminar reporte');
        }
    }
};

window.cambiarEstadoReporteAction = async (id, estado) => {
    try {
        await cambiarEstadoReporte(id, estado);
        SwalAlert.success('Éxito', 'Estado actualizado correctamente');
        
        if (currentFilter === 'misReportes') {
            window.cargarMisReportes();
        } else {
            loadReportes();
        }
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al cambiar estado');
    }
};

window.cargarMisReportes = async () => {
    currentFilter = 'misReportes';
    const btnMostrarTodos = document.getElementById('btnMostrarTodosReportes');
    if (btnMostrarTodos) btnMostrarTodos.style.display = 'none';
    try {
        const reportes = await getMisReportes();
        const container = document.getElementById('reportesCardsContainer');
        if (container) {
            container.innerHTML = reportes.map(r => renderReporteCard(r, false)).join('');
        }
        document.getElementById('filtroEstadoReporte')?.setAttribute('disabled', 'true');
        initMapaReportes(reportes);
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al cargar mis reportes');
    }
};

window.filtrarReportesPorEstado = async () => {
    const estado = document.getElementById('filtroEstadoReporte')?.value;
    currentFilter = estado === 'todos' ? 'todos' : estado;
    
    const btnMostrarTodos = document.getElementById('btnMostrarTodosReportes');
    if (btnMostrarTodos) btnMostrarTodos.style.display = 'none';
    
    try {
        const reportes = estado === 'todos' ? await getReportes() : await getReportesByEstado(estado);
        const container = document.getElementById('reportesCardsContainer');
        const esAdmin = isAdmin();
        if (container) {
            container.innerHTML = reportes.map(r => renderReporteCard(r, esAdmin)).join('');
        }
        initMapaReportes(reportes);
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al filtrar reportes');
    }
};

window.seleccionarReporteEnMapa = (idReporte) => {
    const idColonia = window.reporteAColonia?.[idReporte];
    const circulos = window.circulosReportes;
    if (!circulos || !mapReportes || !idColonia) return;

    Object.keys(circulos).forEach(key => {
        const circulo = circulos[key];
        if (parseInt(key) === idColonia) {
            circulo.setStyle({ fillOpacity: 0.8, weight: 3 });
            mapReportes.setView(circulo.getLatLng(), 15);
            circulo.openPopup();
        } else {
            circulo.setStyle({ fillOpacity: 0.05 });
        }
    });

    const btnMostrarTodos = document.getElementById('btnMostrarTodosReportes');
    if (btnMostrarTodos) btnMostrarTodos.style.display = 'inline-block';
};

window.mostrarTodosLosReportes = () => {
    const circulos = window.circulosReportes;
    if (!circulos || !mapReportes) return;

    Object.values(circulos).forEach(circulo => {
        circulo.setStyle({ fillOpacity: 0.6, weight: 1 });
    });

    const bounds = Object.values(circulos).map(c => c.getLatLng());
    if (bounds.length > 0) {
        mapReportes.fitBounds(bounds, { padding: [50, 50] });
    }

    const btnMostrarTodos = document.getElementById('btnMostrarTodosReportes');
    if (btnMostrarTodos) btnMostrarTodos.style.display = 'none';
};

window.loadReportes = loadReportes;
