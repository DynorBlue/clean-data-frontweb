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
        `;

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
