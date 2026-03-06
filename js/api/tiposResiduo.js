import api from './api.js';
import { SwalAlert } from '../components/utils.js';

export const getTiposResiduo = () => api.get('/tipos-residuo');
export const getTipoResiduo = (id) => api.get(`/tipos-residuo/${id}`);
export const createTipoResiduo = (data) => api.post('/tipos-residuo', data);
export const updateTipoResiduo = (id, data) => api.put(`/tipos-residuo/${id}`, data);
export const deleteTipoResiduo = (id) => api.delete(`/tipos-residuo/${id}`);
export const buscarTiposResiduo = (query) => api.get(`/tipos-residuo/buscar?q=${encodeURIComponent(query)}`);

let tiposResiduoData = [];

const renderTipoResiduoCard = (t) => `
    <div class="col">
        <div class="card h-100 shadow-sm">
            <div class="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center gap-2">
                    <i class="bi bi-recycle"></i> <strong>Tipo #${t.idTipo}</strong>
                    <span class="badge bg-light text-dark ms-1">${t.nombre}</span>
                </div>
                <div class="d-flex gap-2">
                    <button class="btn btn-sm btn-outline-light" onclick="window.editarTipoResiduo(${t.idTipo})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="window.eliminarTipoResiduo(${t.idTipo})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <p class="card-text mb-0">
                    <i class="bi bi-tag me-2"></i>
                    <strong>Nombre:</strong> ${t.nombre}
                </p>
            </div>
        </div>
    </div>
`;

export const loadTiposResiduo = async () => {
    try {
        const content = document.getElementById('tiposResiduoContent');
        if (!content) return;

        content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        const tipos = await getTiposResiduo();
        tiposResiduoData = tipos;

        content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#tipoResiduoModal" onclick="window.tipoResiduoModalMode='create'; window.resetTipoResiduoModal();">
                    <i class="bi bi-plus-circle"></i> Nuevo Tipo
                </button>
                <button class="btn btn-secondary" onclick="window.loadTiposResiduo()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
                <div class="input-group" style="max-width:300px;">
                    <input type="text" class="form-control" id="buscarTipoInput" placeholder="Buscar tipo...">
                    <button class="btn btn-outline-secondary" onclick="window.buscarTipoResiduo()">
                        <i class="bi bi-search"></i>
                    </button>
                </div>
            </div>
            <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4" id="tiposResiduoCardsContainer">
                ${tipos.map(t => renderTipoResiduoCard(t)).join('')}
            </div>
            ${renderTipoResiduoModal()}
        `;
    } catch (error) {
        console.error('Error cargando tipos de residuo:', error);
        SwalAlert.error('Error', error.message || 'Error al cargar tipos de residuo');
    }
};

const renderTipoResiduoModal = () => `
    <div class="modal fade" id="tipoResiduoModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tipoResiduoModalTitle">Nuevo Tipo de Residuo</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="tipoResiduoForm">
                        <input type="hidden" id="tipoResiduoId">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="tipoResiduoNombre" required maxlength="50">
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarTipoResiduo()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetTipoResiduoModal = () => {
    document.getElementById('tipoResiduoModalTitle').textContent = 'Nuevo Tipo de Residuo';
    document.getElementById('tipoResiduoId').value = '';
    document.getElementById('tipoResiduoNombre').value = '';
};

window.editarTipoResiduo = async (id) => {
    try {
        const tipo = await getTipoResiduo(id);

        document.getElementById('tipoResiduoModalTitle').textContent = 'Editar Tipo de Residuo';
        document.getElementById('tipoResiduoId').value = tipo.idTipo;
        document.getElementById('tipoResiduoNombre').value = tipo.nombre || '';

        window.tipoResiduoModalMode = 'edit';

        const modal = new bootstrap.Modal(document.getElementById('tipoResiduoModal'));
        modal.show();
    } catch (error) {
        SwalAlert.error('Error', 'Error al cargar tipo de residuo: ' + error.message);
    }
};

window.guardarTipoResiduo = async () => {
    try {
        const id = document.getElementById('tipoResiduoId').value;
        const nombre = document.getElementById('tipoResiduoNombre').value.trim();

        if (!nombre) {
            SwalAlert.warning('Advertencia', 'El nombre es requerido');
            return;
        }

        const data = { nombre };

        if (id && window.tipoResiduoModalMode === 'edit') {
            await updateTipoResiduo(id, data);
            SwalAlert.success('Éxito', 'Tipo de residuo actualizado correctamente');
        } else {
            await createTipoResiduo(data);
            SwalAlert.success('Éxito', 'Tipo de residuo creado correctamente');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('tipoResiduoModal'));
        modal.hide();

        loadTiposResiduo();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al guardar tipo de residuo');
    }
};

window.eliminarTipoResiduo = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar eliminación', '¿Está seguro de eliminar este tipo de residuo?');
    if (!isConfirmed) return;

    try {
        await deleteTipoResiduo(id);
        SwalAlert.success('Éxito', 'Tipo de residuo eliminado correctamente');
        loadTiposResiduo();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al eliminar tipo de residuo');
    }
};

window.buscarTipoResiduo = async () => {
    const query = document.getElementById('buscarTipoInput')?.value.trim();
    if (!query) {
        loadTiposResiduo();
        return;
    }
    try {
        const tipos = await buscarTiposResiduo(query);
        const container = document.getElementById('tiposResiduoCardsContainer');
        if (container) {
            container.innerHTML = tipos.map(t => renderTipoResiduoCard(t)).join('');
        }
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error en la búsqueda');
    }
};

window.loadTiposResiduo = loadTiposResiduo;
