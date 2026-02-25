const API_BASE_URL = 'http://localhost:8080/api';

const api = {
    get: async (endpoint) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    },

    post: async (endpoint, data) => {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify(data)
        });
        
        return handleResponse(response);
    },

    put: async (endpoint, data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    patch: async (endpoint, data) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });
        return handleResponse(response);
    },

    delete: async (endpoint) => {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse(response);
    }
};

async function handleResponse(response) {
    if (!response) {
        throw new Error('No response from server - possible CORS/network error');
    }
    if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'html/login.html';
        throw new Error('Unauthorized');
    }
    if (response.status === 403) {
        throw new Error('Acceso denegado. No tienes permisos para esta acción.');
    }
    if (response.status === 404) {
        throw new Error('Recurso no encontrado');
    }
    if (response.status >= 500) {
        throw new Error('Error del servidor. Intenta más tarde.');
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
        if (response.ok) return { success: true };
        throw new Error('Respuesta inválida del servidor');
    }
    
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || data.error || 'Error en la solicitud');
    }
    return data;
}

export default api;
