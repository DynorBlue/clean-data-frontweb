const SwalAlert = {
    success: (title, text) => {
        Swal.fire({ icon: 'success', title, text, confirmButtonColor: '#333333' });
    },
    error: (title, text) => {
        Swal.fire({ icon: 'error', title, text, confirmButtonColor: '#333333' });
    },
    warning: (title, text) => {
        Swal.fire({ icon: 'warning', title, text, confirmButtonColor: '#333333' });
    },
    info: (title, text) => {
        Swal.fire({ icon: 'info', title, text, confirmButtonColor: '#333333' });
    },
    confirm: (title, text, confirmText = 'Aceptar', cancelText = 'Cancelar') => {
        return Swal.fire({
            icon: 'question',
            title,
            text,
            showCancelButton: true,
            confirmButtonText: confirmText,
            cancelButtonText: cancelText,
            confirmButtonColor: '#333333',
            cancelButtonColor: '#d9d2c0'
        });
    }
};

const showToast = (message, type = 'success') => {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
        </div>
    `;
    
    toastContainer.appendChild(toast);
    const bsToast = new bootstrap.Toast(toast);
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', () => toast.remove());
};

const showLoading = (containerId) => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Cargando datos...</p>
        </div>
    `;
};

const showEmptyState = (containerId, message = 'No hay datos disponibles') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-4">
            <i class="bi bi-inbox fs-1 text-muted"></i>
            <p class="mt-2 text-muted">${message}</p>
        </div>
    `;
};

const showErrorState = (containerId, message = 'Error al cargar los datos') => {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = `
        <div class="text-center py-4">
            <i class="bi bi-exclamation-triangle fs-1 text-danger"></i>
            <p class="mt-2 text-danger">${message}</p>
            <button class="btn btn-primary btn-retry">Reintentar</button>
        </div>
    `;
};

const confirmDelete = (itemName) => {
    return new Promise((resolve) => {
        const modalHtml = `
            <div class="modal fade" id="confirmDeleteModal" tabindex="-1">
                <div class="modal-dialog">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Confirmar eliminación</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>¿Está seguro de eliminar <strong>${itemName}</strong>?</p>
                            <p class="text-muted">Esta acción no se puede deshacer.</p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger" id="confirmDeleteBtn">Eliminar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        const existingModal = document.getElementById('confirmDeleteModal');
        if (existingModal) {
            existingModal.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('confirmDeleteModal'));
        modal.show();
        
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => {
            modal.hide();
            resolve(true);
        });
        
        document.getElementById('confirmDeleteModal').addEventListener('hidden.bs.modal', () => {
            document.getElementById('confirmDeleteModal')?.remove();
            resolve(false);
        });
    });
};

const createModal = (id, title, bodyContent, footerContent = '') => {
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="modal fade" id="${id}" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">${bodyContent}</div>
                    ${footerContent ? `<div class="modal-footer">${footerContent}</div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    return new bootstrap.Modal(document.getElementById(id));
};

const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
};

const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const getEnumLabel = (enumValue, enumType) => {
    const labels = {
        ESTADO_CAMION: { 'ACTIVO': 'Activo', 'EN_MANTENIMIENTO': 'En Mantenimiento', 'FUERA_SERVICIO': 'Fuera de Servicio' },
        ESTADO_VIAJE: { 'EN_CURSO': 'En Curso', 'FINALIZADO': 'Finalizado', 'CANCELADO': 'Cancelado' },
        ESTADO_REPORTE: { 'PENDIENTE': 'Pendiente', 'EN_ATENCION': 'En Atención', 'RESUELTO': 'Resuelto' },
        ESTADO_CONDUCTOR: { 'ACTIVO': 'Activo', 'INACTIVO': 'Inactivo', 'SUSPENDIDO': 'Suspendido' }
    };
    return labels[enumType]?.[enumValue] || enumValue;
};

const getBadgeClass = (enumValue, enumType) => {
    const classes = {
        ESTADO_CAMION: { 'ACTIVO': 'success', 'EN_MANTENIMIENTO': 'warning', 'FUERA_SERVICIO': 'danger' },
        ESTADO_VIAJE: { 'EN_CURSO': 'primary', 'FINALIZADO': 'success', 'CANCELADO': 'danger' },
        ESTADO_REPORTE: { 'PENDIENTE': 'warning', 'EN_ATENCION': 'info', 'RESUELTO': 'success' },
        ESTADO_CONDUCTOR: { 'ACTIVO': 'success', 'INACTIVO': 'secondary', 'SUSPENDIDO': 'danger' }
    };
    return classes[enumType]?.[enumValue] || 'secondary';
};

export { showToast, showLoading, showEmptyState, showErrorState, confirmDelete, createModal, formatDate, formatDateTime, getEnumLabel, getBadgeClass, SwalAlert };
