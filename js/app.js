import { isAuthenticated, isAdmin, getUser } from './auth/auth.js';
import { renderSidebar } from './components/sidebar.js';
import { loadContent, modules } from './components/content.js';

const validModules = Object.keys(modules);

const getModuleFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    return params.get('module') || 'dashboard';
};

const navigateTo = (moduleId) => {
    if (!validModules.includes(moduleId)) {
        console.warn(`Módulo no válido: ${moduleId}, redirigiendo a dashboard`);
        moduleId = 'dashboard';
    }
    
    const url = new URL(window.location.href);
    url.searchParams.set('module', moduleId);
    window.history.pushState({ module: moduleId }, '', url);
    
    loadContent(moduleId);
    updateActiveNavItem(moduleId);
};

const updateActiveNavItem = (moduleId) => {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.module === moduleId) {
            link.classList.add('active');
        }
    });
};

const initApp = () => {
    if (!isAuthenticated()) {
        window.location.href = 'html/login.html';
        return;
    }

    const user = getUser();
    const userIsAdmin = isAdmin();

    renderSidebar();
    setupNavigation();

    if (!userIsAdmin) {
        navigateTo('dashboard');
        return;
    }

    const currentModule = getModuleFromUrl();
    navigateTo(currentModule);
};

const setupNavigation = () => {
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-module]');
        if (link) {
            e.preventDefault();
            const moduleId = link.dataset.module;
            navigateTo(moduleId);
        }
    });

    window.addEventListener('popstate', (e) => {
        const moduleId = e.state?.module || getModuleFromUrl();
        loadContent(moduleId);
        updateActiveNavItem(moduleId);
    });
};

document.addEventListener('DOMContentLoaded', initApp);

export { navigateTo, getModuleFromUrl };
