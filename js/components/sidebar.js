import { isAdmin, getUser } from '../auth/auth.js';

const getMenuItems = () => {
    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: 'bi-house' }
    ];

    if (isAdmin()) {
        items.push(
            { id: 'colonias', label: 'Colonias', icon: 'bi-building' },
            { id: 'ciudadanos', label: 'Ciudadanos', icon: 'bi-people' },
            { id: 'conductores', label: 'Conductores', icon: 'bi-person-badge' },
            { id: 'camiones', label: 'Camiones', icon: 'bi-truck' },
            { id: 'rutas', label: 'Rutas', icon: 'bi-signpost-2' },
            { id: 'viajes', label: 'Viajes', icon: 'bi-map' },
            { id: 'recolecciones', label: 'Recolecciones', icon: 'bi-trash' },
            { id: 'reportes', label: 'Reportes', icon: 'bi-exclamation-triangle' },
            { id: 'tiposResiduo', label: 'Tipos de Residuo', icon: 'bi-recycle' },
            { id: 'camionesGps', label: 'GPS Camiones', icon: 'bi-geo-alt' }
        );
    }

    return items;
};

const renderSidebar = () => {
    const menuItems = getMenuItems();
    const user = getUser();
    
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    let html = `
        <div class="sidebar-header">
            <h4>Clean Data</h4>
        </div>
        <ul class="nav flex-column">
    `;

    menuItems.forEach(item => {
        html += `
            <li class="nav-item">
                <a class="nav-link" href="?module=${item.id}" data-module="${item.id}">
                    <i class="bi ${item.icon}"></i> ${item.label}
                </a>
            </li>
        `;
    });

    html += `
        </ul>
        <div class="sidebar-footer">
            <p>Usuario: ${user?.email || 'Admin'}</p>
            <button id="logoutBtn" class="btn btn-sm btn-danger">Cerrar Sesión</button>
        </div>
    `;

    sidebar.innerHTML = html;

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        import('../auth/login.js').then(({ logout }) => logout());
    });
};

export { renderSidebar, getMenuItems };
