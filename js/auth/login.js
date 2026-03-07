import api from '../api/api.js';

const login = async (email, password) => {
    try {
        const data = await api.post('/auth/login', { email, password });
        
        if (data.token) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify({
                id: data.idUsuario,
                email: data.email,
                tipoUsuario: data.tipoUsuario
            }));
            console.log('Login exitoso:', data);
        }
        
        return data;
    } catch (error) {
        console.error('Error en login:', error);
        throw error;
    }
};

const logout = () => {
    const container = document.querySelector('.dashboard-container');
    if (container) {
        container.classList.add('animate-fade-out');
        setTimeout(() => {
            performLogout();
        }, 300);
    } else {
        performLogout();
    }
};

const performLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'html/login.html';
};

export { login, logout };
