const modules = {
    dashboard: {
        title: 'Dashboard',
        render: () => `
            <div class="container-fluid">
                <h1>Bienvenido al Dashboard</h1>
                <div class="row mt-4">
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Colonias</h5>
                                <p class="card-text">Gestiona las colonias del sistema</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Usuarios</h5>
                                <p class="card-text">Administra los usuarios</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Camiones</h5>
                                <p class="card-text">Gestiona los camiones del sistema</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Conductores</h5>
                                <p class="card-text">Gestiona los conductores del sistema</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card">
                            <div class="card-body">
                                <h5 class="card-title">Recolecciones</h5>
                                <p class="card-text">Gestiona las recolecciones del sistema</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    },
    colonias: {
        title: 'Colonias',
        render: async () => {
            const { loadColonias } = await import('../api/colonias.js');
            return `
            <div class="container-fluid">
                <h1>Gestión de Colonias</h1>
                <button class="btn btn-primary mb-3" id="loadColoniasBtn">Cargar Colonias</button>
                <div id="coloniasContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadColonias } = await import('../api/colonias.js');
            document.getElementById('loadColoniasBtn')?.addEventListener('click', loadColonias);
        }
    },
    usuarios: {
        title: 'Usuarios',
        render: async () => {
            const { loadUsuarios } = await import('../api/usuarios.js');
            return `
            <div class="container-fluid">
                <h1>Gestión de Usuarios</h1>
                <button class="btn btn-primary mb-3" id="loadUsuariosBtn">Cargar Usuarios</button>
                <div id="usuariosContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadUsuarios } = await import('../api/usuarios.js');
            document.getElementById('loadUsuariosBtn')?.addEventListener('click', loadUsuarios);
        }
    },
    camiones: {
        title: 'Camiones',
        render: async () => {
            const { loadCamiones } = await import('../api/camiones.js');
            return `
            <div class="container-fluid">
                <h1>Gestión de Camiones</h1>
                <button class="btn btn-primary mb-3" id="loadCamionesBtn">Cargar Camiones</button>
                <div id="camionesContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadCamiones } = await import('../api/camiones.js');
            document.getElementById('loadCamionesBtn')?.addEventListener('click', loadCamiones);
        }
    },
    conductores: {
        title: 'Conductores',
        render: async () => {
            const { loadConductores } = await import('../api/conductores.js');
            return `
            <div class="container-fluid">
                <h1>Gestión de Conductores</h1>
                <button class="btn btn-primary mb-3" id="loadConductoresBtn">Cargar Conductores</button>
                <div id="conductoresContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadConductores } = await import('../api/conductores.js');
            document.getElementById('loadConductoresBtn')?.addEventListener('click', loadConductores);
        }
    },
    recolecciones: {
        title: 'Recolecciones',
        render: async () => {
            const { loadRecolecciones } = await import('../api/recoleccion.js');
            return `
            <div class="container-fluid">
                <h1>Gestión de Recolección</h1>
                <button class="btn btn-primary mb-3" id="loadRecoleccionesBtn">Cargar Recolecciones</button>
                <div id="recoleccionesContent"></div>
            </div>
            `;
        },
        init: async () => {
            const { loadRecolecciones } = await import('../api/recoleccion.js');
            document.getElementById('loadRecoleccionesBtn')?.addEventListener('click', loadRecolecciones);
        }
    }
};

const loadContent = async (moduleId) => {
    const content = document.getElementById('mainContent');
    if (!content) return;

    const module = modules[moduleId];
    if (module) {
        content.innerHTML = await module.render();
        if (module.init) {
            await module.init();
        }
    }
};

export { loadContent, modules };
