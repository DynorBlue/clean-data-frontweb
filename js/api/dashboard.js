import { isAdmin } from '../auth/auth.js';
import api from './api.js';
import { showToast } from '../components/utils.js';
import { getColonias } from './colonias.js';
import { getCamiones } from './camiones.js';
import { getRutas } from './rutas.js';
import { getViajes } from './viajes.js';
import { getConductores } from './conductores.js';
import { getCiudadanos } from './ciudadanos.js';
import { getRecolecciones } from './recoleccion.js';
import { getReportes } from './reportes.js';
import { getTiposResiduo } from './tiposResiduo.js';

export const loadDashboardStats = async () => {
    const statsContainer = document.getElementById('dashboardStats');
    if (!statsContainer) return;

    if (!isAdmin()) {
        statsContainer.innerHTML = renderUserDashboard();
        return;
    }

    try {
        const [colonias, camiones, rutas, viajes, conductores, ciudadanos, recolecciones, reportes, tiposResiduo] = await Promise.all([
            getColonias(),
            getCamiones(),
            getRutas(),
            getViajes(),
            getConductores(),
            getCiudadanos(),
            getRecolecciones(),
            getReportes(),
            getTiposResiduo()
        ]);

        const viajesEnCurso = viajes.filter(v => v.estado === 'EN_CURSO').length;
        const reportesPendientes = reportes.filter(r => r.estado === 'PENDIENTE').length;

        const reportesPorEstado = {
            PENDIENTE: reportes.filter(r => r.estado === 'PENDIENTE').length,
            EN_ATENCION: reportes.filter(r => r.estado === 'EN_ATENCION').length,
            RESUELTO: reportes.filter(r => r.estado === 'RESUELTO').length
        };

        const viajesPorEstado = {
            EN_CURSO: viajes.filter(v => v.estado === 'EN_CURSO').length,
            FINALIZADO: viajes.filter(v => v.estado === 'FINALIZADO').length,
            CANCELADO: reportes.filter(r => r.estado === 'CANCELADO').length
        };

        const rutasActivas = rutas.filter(r => r.activa).length;
        const rutasInactivas = rutas.filter(r => !r.activa).length;

        const reportesPorTipoResiduo = tiposResiduo.map(t => {
            const count = reportes.filter(r => r.tipoResiduo?.idTipo === t.idTipo).length;
            return { nombre: t.nombre, count };
        });

        statsContainer.innerHTML = `
            <div class="row">
                <div class="col-md-3 mb-3">
                    <div class="card bg-primary text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-building"></i> Colonias</h5>
                            <h2 class="mb-0">${colonias.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-success text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-truck"></i> Camiones</h5>
                            <h2 class="mb-0">${camiones.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-info text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-signpost-2"></i> Rutas</h5>
                            <h2 class="mb-0">${rutas.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-warning text-dark">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-map"></i> Viajes</h5>
                            <h2 class="mb-0">${viajes.length} <small style="font-size:0.6em">(${viajesEnCurso} activos)</small></h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-secondary text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-person-badge"></i> Conductores</h5>
                            <h2 class="mb-0">${conductores.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-dark text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-people"></i> Ciudadanos</h5>
                            <h2 class="mb-0">${ciudadanos.length}</h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-danger text-white">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-exclamation-triangle"></i> Reportes</h5>
                            <h2 class="mb-0">${reportes.length} <small style="font-size:0.6em">(${reportesPendientes} pendientes)</small></h2>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card bg-light text-dark">
                        <div class="card-body">
                            <h5 class="card-title"><i class="bi bi-recycle"></i> Tipos Residuo</h5>
                            <h2 class="mb-0">${tiposResiduo.length}</h2>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0"><i class="bi bi-pie-chart"></i> Estados de Reportes</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="chartReportes"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-info text-white">
                            <h5 class="mb-0"><i class="bi bi-pie-chart"></i> Estados de Viajes</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="chartViajes"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-2">
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-success text-white">
                            <h5 class="mb-0"><i class="bi bi-bar-chart"></i> Rutas Activas vs Inactivas</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="chartRutas"></canvas>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 mb-4">
                    <div class="card">
                        <div class="card-header bg-warning text-dark">
                            <h5 class="mb-0"><i class="bi bi-bar-chart"></i> Reportes por Tipo de Residuo</h5>
                        </div>
                        <div class="card-body">
                            <canvas id="chartTiposResiduo"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row mt-3">
                <div class="col-md-12">
                    <h4>Resumen de Actividad</h4>
                    <ul class="list-group">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Total Recolecciones Registradas
                            <span class="badge bg-primary rounded-pill">${recolecciones.length}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Rutas Activas
                            <span class="badge bg-success rounded-pill">${rutasActivas}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Viajes Finalizados
                            <span class="badge bg-info rounded-pill">${viajes.filter(v => v.estado === 'FINALIZADO').length}</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="row mt-4">
                <div class="col-md-12">
                    <div class="card">
                        <div class="card-header bg-dark text-white">
                            <h5 class="mb-0"><i class="bi bi-download"></i> Exportar Datos</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <h6 class="fw-bold"><i class="bi bi-database"></i> Exportar Todo</h6>
                                    <p class="text-muted small">Exporta todos los módulos en un solo archivo.</p>
                                    <div class="d-flex gap-2 flex-wrap">
                                        <button class="btn btn-success btn-sm" onclick="window.exportAllDataToExcel()">
                                            <i class="bi bi-file-earmark-excel"></i> Exportar Todo a Excel
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="window.exportAllDataToPDF()">
                                            <i class="bi bi-file-earmark-pdf"></i> Exportar Todo a PDF
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <h6 class="fw-bold"><i class="bi bi-collection"></i> Exportar por Módulo</h6>
                                    <p class="text-muted small">Exporta un módulo específico.</p>
                                    <div class="d-flex gap-2 flex-wrap">
                                        <div class="dropdown">
                                            <button class="btn btn-outline-success btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                                <i class="bi bi-file-earmark-excel"></i> Excel
                                            </button>
                                            <ul class="dropdown-menu">
                                                <li><h6 class="dropdown-header">Seleccionar módulo</h6></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('colonias')">Colonias</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('camiones')">Camiones</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('conductores')">Conductores</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('rutas')">Rutas</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('viajes')">Viajes</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('recolecciones')">Recolecciones</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('ciudadanos')">Ciudadanos</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToExcel('reportes')">Reportes</a></li>
                                            </ul>
                                        </div>
                                        <div class="dropdown">
                                            <button class="btn btn-outline-danger btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                                                <i class="bi bi-file-earmark-pdf"></i> PDF
                                            </button>
                                            <ul class="dropdown-menu">
                                                <li><h6 class="dropdown-header">Seleccionar módulo</h6></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('colonias')">Colonias</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('camiones')">Camiones</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('conductores')">Conductores</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('rutas')">Rutas</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('viajes')">Viajes</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('recolecciones')">Recolecciones</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('ciudadanos')">Ciudadanos</a></li>
                                                <li><a class="dropdown-item" href="#" onclick="window.exportModuleToPDF('reportes')">Reportes</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        window.dashboardData = {
            colonias,
            camiones,
            rutas,
            viajes,
            conductores,
            ciudadanos,
            recolecciones,
            reportes,
            tiposResiduo
        };

        setTimeout(() => {
            new Chart(document.getElementById('chartReportes'), {
                type: 'doughnut',
                data: {
                    labels: ['Pendientes', 'En Atención', 'Resueltos'],
                    datasets: [{
                        data: [reportesPorEstado.PENDIENTE, reportesPorEstado.EN_ATENCION, reportesPorEstado.RESUELTO],
                        backgroundColor: ['#ffc107', '#0dcaf0', '#198754'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });

            new Chart(document.getElementById('chartViajes'), {
                type: 'doughnut',
                data: {
                    labels: ['En Curso', 'Finalizados', 'Cancelados'],
                    datasets: [{
                        data: [viajesPorEstado.EN_CURSO, viajesPorEstado.FINALIZADO, viajesPorEstado.CANCELADO],
                        backgroundColor: ['#ffc107', '#198754', '#dc3545'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });

            new Chart(document.getElementById('chartRutas'), {
                type: 'bar',
                data: {
                    labels: ['Activas', 'Inactivas'],
                    datasets: [{
                        label: 'Cantidad',
                        data: [rutasActivas, rutasInactivas],
                        backgroundColor: ['#198754', '#6c757d'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });

            new Chart(document.getElementById('chartTiposResiduo'), {
                type: 'bar',
                data: {
                    labels: reportesPorTipoResiduo.map(t => t.nombre),
                    datasets: [{
                        label: 'Reportes',
                        data: reportesPorTipoResiduo.map(t => t.count),
                        backgroundColor: '#ffc107',
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: { beginAtZero: true, ticks: { stepSize: 1 } }
                    }
                }
            });
        }, 100);
    } catch (error) {
        console.error('Error cargando estadísticas:', error);
        statsContainer.innerHTML = `
            <div class="alert alert-danger">
                Error al cargar las estadísticas. Asegúrate de que la API esté funcionando.
            </div>
            ${renderBasicDashboard()}
        `;
    }
};

const renderUserDashboard = () => `
    <div class="row">
        <div class="col-md-12">
            <div class="alert alert-info">
                <h4><i class="bi bi-info-circle"></i> Bienvenido</h4>
                <p>Como usuario registrado, puedes:</p>
                <ul>
                    <li>Ver las rutas y horarios de recolección</li>
                    <li>Reportar problemas en tu colonia</li>
                    <li>Ver el estado de tus reportes</li>
                </ul>
            </div>
        </div>
    </div>
`;

const renderBasicDashboard = () => `
    <div class="row mt-3">
        <div class="col-md-3 mb-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title text-muted">Colonias</h5>
                    <h2 class="text-muted">-</h2>
                </div>
            </div>
        </div>
        <div class="col-md-3 mb-3">
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title text-muted">Camiones</h5>
                    <h2 class="text-muted">-</h2>
                </div>
            </div>
        </div>
    </div>
`;

window.exportAllDataToExcel = () => {
    const data = window.dashboardData;
    if (!data) {
        showToast('Error: Datos no disponibles', 'danger');
        return;
    }
    
    if (window.exportAllToExcel) {
        window.exportAllToExcel(data, 'clean_data');
    } else {
        showToast('Cargando funciones de exportación...', 'info');
    }
};

window.exportAllDataToPDF = () => {
    const data = window.dashboardData;
    if (!data) {
        showToast('Error: Datos no disponibles', 'danger');
        return;
    }
    
    if (window.exportAllToPDF) {
        window.exportAllToPDF(data, 'clean_data');
    } else {
        showToast('Cargando funciones de exportación...', 'info');
    }
};

const moduleConfig = {
    colonias: { name: 'Colonias', dataKey: 'colonias', columns: ['idColonia', 'nombre', 'codigoPostal', 'latitud', 'longitud'] },
    camiones: { name: 'Camiones', dataKey: 'camiones', columns: ['idCamion', 'placas', 'modelo', 'capacidadKg', 'capacidadM3', 'estado'] },
    conductores: { name: 'Conductores', dataKey: 'conductores', columns: ['idPersona', 'persona.nombre', 'persona.telefono', 'persona.email', 'licencia', 'estadoOperativo'] },
    rutas: { name: 'Rutas', dataKey: 'rutas', columns: ['idRuta', 'nombre', 'descripcion', 'activa'] },
    viajes: { name: 'Viajes', dataKey: 'viajes', columns: ['idViaje', 'camion.placas', 'conductor.persona.nombre', 'ruta.nombre', 'tipoResiduo.nombre', 'fechaInicio', 'fechaFin', 'estado'] },
    recolecciones: { name: 'Recolecciones', dataKey: 'recolecciones', columns: ['idRecoleccion', 'idViaje', 'tipoResiduo.nombre', 'volumenM3', 'pesoKg', 'fechaRegistro'] },
    ciudadanos: { name: 'Ciudadanos', dataKey: 'ciudadanos', columns: ['idPersona', 'persona.nombre', 'persona.telefono', 'persona.email', 'direccionCalle', 'colonia.nombre'] },
    reportes: { name: 'Reportes', dataKey: 'reportes', columns: ['idReporte', 'usuario.email', 'colonia.nombre', 'tipoResiduo.nombre', 'fecha', 'descripcion', 'estado'] }
};

window.exportModuleToExcel = (moduleKey) => {
    const data = window.dashboardData;
    if (!data) {
        showToast('Error: Datos no disponibles', 'danger');
        return;
    }
    
    const config = moduleConfig[moduleKey];
    if (!config) {
        showToast('Error: Módulo no válido', 'danger');
        return;
    }
    
    const moduleData = data[config.dataKey] || [];
    if (moduleData.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }
    
    const exportData = moduleData.map(item => {
        const row = {};
        config.columns.forEach(col => {
            const keys = col.split('.');
            let value = item;
            keys.forEach(k => {
                value = value ? value[k] : null;
            });
            row[col] = value || '-';
        });
        return row;
    });
    
    if (window.exportToExcel) {
        window.exportToExcel(exportData, config.name.toLowerCase(), config.name);
    } else {
        showToast('Cargando funciones de exportación...', 'info');
    }
};

window.exportModuleToPDF = (moduleKey) => {
    const data = window.dashboardData;
    if (!data) {
        showToast('Error: Datos no disponibles', 'danger');
        return;
    }
    
    const config = moduleConfig[moduleKey];
    if (!config) {
        showToast('Error: Módulo no válido', 'danger');
        return;
    }
    
    const moduleData = data[config.dataKey] || [];
    if (moduleData.length === 0) {
        showToast('No hay datos para exportar', 'warning');
        return;
    }
    
    const exportData = moduleData.map(item => {
        const row = {};
        config.columns.forEach(col => {
            const keys = col.split('.');
            let value = item;
            keys.forEach(k => {
                value = value ? value[k] : null;
            });
            row[col] = value || '-';
        });
        return row;
    });
    
    const columns = config.columns.map(col => ({ header: col, key: col }));
    
    if (window.exportToPDF) {
        window.exportToPDF(exportData, config.name.toLowerCase(), config.name, columns);
    } else {
        showToast('Cargando funciones de exportación...', 'info');
    }
};
