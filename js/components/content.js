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
