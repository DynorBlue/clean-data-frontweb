const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    return token !== null && token !== '';
};

const isAdmin = () => {
    const user = getUser();
    return user && user.tipoUsuario === 'ADMIN';
};

const getUser = () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
};

const requireAuth = () => {
    if (!isAuthenticated()) {
        window.location.href = 'html/login.html';
        return false;
    }
    return true;
};

const requireAdmin = () => {
    if (!requireAuth()) return false;
    if (!isAdmin()) {
        alert('Acceso restringido solo para administradores');
        window.location.href = 'index.html';
        return false;
    }
    return true;
};

export { isAuthenticated, isAdmin, getUser, requireAuth, requireAdmin };
