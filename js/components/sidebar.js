import { isAdmin, getUser } from '../auth/auth.js';

const getMenuItems = () => {
    const items = [
        { id: 'dashboard', label: 'Dashboard', icon: 'bi-house', href: '/index.html' }
    ];

    if (isAdmin()) {
        items.push(
            { id: 'colonias', label: 'Colonias', icon: 'bi-building', href: '/html/colonias.html' },
            { id: 'usuarios', label: 'Usuarios', icon: 'bi-people', href: '/html/usuarios.html' },
            { id: 'camiones', label: 'Camiones', icon: 'bi-truck', href: '/html/camiones.html' },
            { id: 'conductores', label: 'Conductores', icon: 'bi-person-badge', href: '/html/conductores.html'},
            { id: 'recolecciones', label: 'Recolecciones', icon: 'bi-trash', href: '/html/recoleccion.html'}
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
                <a class="nav-link" href="${item.href}" data-module="${item.id}">
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
