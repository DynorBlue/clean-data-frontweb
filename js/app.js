import { isAuthenticated, isAdmin, getUser } from './auth/auth.js';
import { renderSidebar } from './components/sidebar.js';
import { loadContent } from './components/content.js';

const initApp = () => {
    if (!isAuthenticated()) {
        window.location.href = 'html/login.html';
        return;
    }

    const user = getUser();
    const isUserAdmin = isAdmin();

    renderSidebar();

    if (!isUserAdmin) {
        loadContent('dashboard');
        return;
    }

    const currentModule = new URLSearchParams(window.location.search).get('module') || 'dashboard';
    loadContent(currentModule);
};

document.addEventListener('DOMContentLoaded', initApp);
