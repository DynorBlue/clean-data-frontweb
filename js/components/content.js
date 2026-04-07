const modules = {
    dashboard: {
        title: 'Dashboard',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Bienvenido al Dashboard</h1>
                <div id="dashboardStats" class="mt-4">
                    <div class="text-center"><div class="spinner-border" role="status"></div></div>
                </div>
            </div>
            `;
        },
        init: async () => {
            const { loadDashboardStats } = await import('../api/dashboard.js');
            loadDashboardStats();
        }
    },
    colonias: {
        title: 'Colonias',
        render: async () => {
            const { loadColonias } = await import('../api/colonias.js');
            return `
            <div class="container-fluid">
                <h1>Gestión de Colonias</h1>
                <div id="coloniasContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadColonias } = await import('../api/colonias.js');
            loadColonias();
        }
    },
    usuarios: {
        title: 'Usuarios',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Usuarios</h1>
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Los usuarios se gestionan a través de los módulos de Ciudadanos y Conductores.
                </div>
            </div>
            `;
        }
    },
    camiones: {
        title: 'Camiones',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Camiones</h1>
                <div id="camionesContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadCamiones } = await import('../api/camiones.js');
            loadCamiones();
        }
    },
    conductores: {
        title: 'Conductores',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Conductores</h1>
                <div id="conductoresContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadConductores } = await import('../api/conductores.js');
            loadConductores();
        }
    },
    recolecciones: {
        title: 'Recolecciones',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Recolección</h1>
                <div id="recoleccionesContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadRecolecciones } = await import('../api/recoleccion.js');
            loadRecolecciones();
        }
    },
    ciudadanos: {
        title: 'Ciudadanos',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Ciudadanos</h1>
                <div id="ciudadanosContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadCiudadanos } = await import('../api/ciudadanos.js');
            loadCiudadanos();
        }
    },
    rutas: {
        title: 'Rutas',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Rutas</h1>
                <div id="rutasContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadRutas } = await import('../api/rutas.js');
            loadRutas();
        }
    },
    viajes: {
        title: 'Viajes',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Viajes</h1>
                <div id="viajesContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadViajes } = await import('../api/viajes.js');
            loadViajes();
        }
    },
    reportes: {
        title: 'Reportes',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Reportes</h1>
                <div id="reportesContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadReportes } = await import('../api/reportes.js');
            loadReportes();
        }
    },
    tiposResiduo: {
        title: 'Tipos de Residuo',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de Tipos de Residuo</h1>
                <div id="tiposResiduoContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadTiposResiduo } = await import('../api/tiposResiduo.js');
            loadTiposResiduo();
        }
    },
    camionesGps: {
        title: 'GPS Camiones',
        render: async () => {
            return `
            <div class="container-fluid">
                <h1>Gestión de GPS de Camiones</h1>
                <div id="camionesGpsContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadCamionesGps } = await import('../api/camionesGps.js');
            loadCamionesGps();
        }
    }
};

const cleanupModals = () => {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    document.querySelectorAll('.modal.show').forEach(modalEl => {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
    });
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
};

const loadContent = async (moduleId) => {
    const content = document.getElementById('mainContent');
    if (!content) return;

    cleanupModals();

    const module = modules[moduleId];
    if (module) {
        content.innerHTML = await module.render();
        content.classList.add('animate-slide-up');
        setTimeout(() => {
            content.classList.remove('animate-slide-up');
        }, 500);
        if (module.init) {
            await module.init();
        }
    }
};

export { loadContent, modules };
