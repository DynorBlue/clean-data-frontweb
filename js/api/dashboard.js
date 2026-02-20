import { isAdmin } from '../auth/auth.js';
import api, { showToast } from './api.js';
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
                            <span class="badge bg-success rounded-pill">${rutas.filter(r => r.activa).length}</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            Viajes Finalizados
                            <span class="badge bg-info rounded-pill">${viajes.filter(v => v.estado === 'FINALIZADO').length}</span>
                        </li>
                    </ul>
                </div>
            </div>
        `;
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
