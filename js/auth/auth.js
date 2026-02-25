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
        Swal.fire({ icon: 'warning', title: 'Acceso Restringido', text: 'Solo los administradores pueden acceder a esta sección', confirmButtonColor: '#333333' });
        window.location.href = 'index.html';
        return false;
    }
    return true;
};

export { isAuthenticated, isAdmin, getUser, requireAuth, requireAdmin };
