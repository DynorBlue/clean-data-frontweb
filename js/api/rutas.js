import api from './api.js';
import { SwalAlert } from '../components/utils.js';
import { getColonias } from './colonias.js';
import { getTiposResiduo } from './tiposResiduo.js';

export const getRutas = () => api.get('/rutas');
export const getRuta = (id) => api.get(`/rutas/${id}`);
export const createRuta = (data) => api.post('/rutas', data);
export const updateRuta = (id, data) => api.put(`/rutas/${id}`, data);
export const deleteRuta = (id) => api.delete(`/rutas/${id}`);
export const getRutasActivas = () => api.get('/rutas/activas');
export const buscarRutas = (query) => api.get(`/rutas/buscar?q=${encodeURIComponent(query)}`);
export const getResiduoHoy = () => api.get('/rutas/residuo-hoy');

export const addColoniaToRuta = (idRuta, idColonia, idTipoResiduo, fechaRecoleccion) => 
    api.post(`/rutas/${idRuta}/colonias`, { 
        colonia: { idColonia: parseInt(idColonia) },
        tipoResiduo: idTipoResiduo ? { idTipo: parseInt(idTipoResiduo) } : null,
        fechaRecoleccion: fechaRecoleccion || null
    });

export const getColoniasByRuta = (idRuta) => api.get(`/rutas/${idRuta}/colonias`);
export const removeColoniaFromRuta = (idRuta, idColonia) => api.delete(`/rutas/${idRuta}/colonias/${idColonia}`);

let rutasData = [];
let todasColonias = [];
let todosTipos = [];

export const loadRutas = async () => {
    try {
        const content = document.getElementById('rutasContent');
        if (!content) return;

        content.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

        const [rutas, colonias, tipos] = await Promise.all([
            getRutas(),
            getColonias(),
            getTiposResiduo()
        ]);

        rutasData = rutas;
        todasColonias = colonias;
        todosTipos = tipos;

        content.innerHTML = `
            <div class="mb-3">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#rutaModal" onclick="window.rutaModalMode='create'; window.resetRutaModal();">
                    <i class="bi bi-plus-circle"></i> Nueva Ruta
                </button>
                <button class="btn btn-secondary" onclick="window.loadRutas()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Activa</th>
                            <th>Colonias</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rutas.map(r => `
                            <tr>
                                <td>${r.idRuta}</td>
                                <td>${r.nombre}</td>
                                <td>${r.descripcion || '-'}</td>
                                <td><span class="badge bg-${r.activa ? 'success' : 'secondary'}">${r.activa ? 'Activa' : 'Inactiva'}</span></td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="window.verColoniasRuta(${r.idRuta}, '${r.nombre.replace(/'/g, "\\'")}')">
                                        <i class="bi bi-building"></i> Ver
                                    </button>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-warning" onclick="window.editarRuta(${r.idRuta})">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="window.eliminarRuta(${r.idRuta})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
            ${renderRutaModal()}
            ${renderColoniasRutaModal()}
        `;
    } catch (error) {
        console.error('Error cargando rutas:', error);
        SwalAlert.error('Error', error.message || 'Error al cargar rutas');
    }
};

const renderRutaModal = () => `
    <div class="modal fade" id="rutaModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="rutaModalTitle">Nueva Ruta</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="rutaForm">
                        <input type="hidden" id="rutaId">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="rutaNombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Descripción</label>
                            <textarea class="form-control" id="rutaDescripcion" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input type="checkbox" class="form-check-input" id="rutaActiva">
                                <label class="form-check-label">Ruta Activa</label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarRuta()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

const renderColoniasRutaModal = () => `
    <div class="modal fade" id="coloniasRutaModal" tabindex="-1">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="coloniasRutaModalTitle">Colonias de la Ruta</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <h6>Agregar Colonia</h6>
                        <div class="row g-2">
                            <div class="col-md-5">
                                <select class="form-select" id="nuevaColoniaRuta">
                                    <option value="">Seleccionar colonia</option>
                                    ${todasColonias.map(c => `<option value="${c.idColonia}">${c.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-4">
                                <select class="form-select" id="nuevaColoniaTipoResiduo">
                                    <option value="">Tipo residuo (opcional)</option>
                                    ${todosTipos.map(t => `<option value="${t.idTipo}">${t.nombre}</option>`).join('')}
                                </select>
                            </div>
                            <div class="col-md-3">
                                <input type="date" class="form-control" id="nuevaColoniaFecha">
                            </div>
                        </div>
                        <button class="btn btn-primary mt-2" onclick="window.agregarColoniaARuta()">
                            <i class="bi bi-plus-circle"></i> Agregar
                        </button>
                    </div>
                    <hr>
                    <h6>Colonias Asignadas</h6>
                    <div class="table-responsive">
                        <table class="table table-sm table-hover">
                            <thead>
                                <tr>
                                    <th>Colonia</th>
                                    <th>Tipo Residuo</th>
                                    <th>Fecha Recolección</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="coloniasRutaBody">
                                <tr><td colspan="4" class="text-center">Cargando...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetRutaModal = () => {
    document.getElementById('rutaModalTitle').textContent = 'Nueva Ruta';
    document.getElementById('rutaId').value = '';
    document.getElementById('rutaNombre').value = '';
    document.getElementById('rutaDescripcion').value = '';
    document.getElementById('rutaActiva').checked = false;
};

window.editarRuta = async (id) => {
    try {
        const ruta = await getRuta(id);

        document.getElementById('rutaModalTitle').textContent = 'Editar Ruta';
        document.getElementById('rutaId').value = ruta.idRuta;
        document.getElementById('rutaNombre').value = ruta.nombre || '';
        document.getElementById('rutaDescripcion').value = ruta.descripcion || '';
        document.getElementById('rutaActiva').checked = ruta.activa || false;

        window.rutaModalMode = 'edit';

        const modal = new bootstrap.Modal(document.getElementById('rutaModal'));
        modal.show();
    } catch (error) {
        SwalAlert.error('Error', 'Error al cargar ruta: ' + error.message);
    }
};

window.guardarRuta = async () => {
    try {
        const id = document.getElementById('rutaId').value;
        const nombre = document.getElementById('rutaNombre').value.trim();
        const descripcion = document.getElementById('rutaDescripcion').value.trim();
        const activa = document.getElementById('rutaActiva').checked;

        if (!nombre) {
            SwalAlert.warning('Advertencia', 'El nombre es requerido');
            return;
        }

        const data = {
            nombre,
            descripcion: descripcion || null,
            activa
        };

        if (id && window.rutaModalMode === 'edit') {
            await updateRuta(id, data);
            SwalAlert.success('Éxito', 'Ruta actualizada correctamente');
        } else {
            await createRuta(data);
            SwalAlert.success('Éxito', 'Ruta creada correctamente');
        }

        const modal = bootstrap.Modal.getInstance(document.getElementById('rutaModal'));
        modal.hide();

        loadRutas();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al guardar ruta');
    }
};

window.eliminarRuta = async (id) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar eliminación', '¿Está seguro de eliminar esta ruta?');
    if (!isConfirmed) return;

    try {
        await deleteRuta(id);
        SwalAlert.success('Éxito', 'Ruta eliminada correctamente');
        loadRutas();
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al eliminar ruta');
    }
};

let rutaColoniasActual = null;

window.verColoniasRuta = async (idRuta, nombreRuta) => {
    rutaColoniasActual = idRuta;
    document.getElementById('coloniasRutaModalTitle').textContent = `Colonias de la Ruta: ${nombreRuta}`;
    
    const [colonias, todas] = await Promise.all([
        getColoniasByRuta(idRuta),
        getColonias()
    ]);
    
    const coloniaIdsAsignadas = new Set(colonias.map(c => c.colonia?.idColonia));
    const coloniasDisponibles = todas.filter(c => !coloniaIdsAsignadas.has(c.idColonia));
    
    document.getElementById('nuevaColoniaRuta').innerHTML = 
        '<option value="">Seleccionar colonia</option>' + 
        coloniasDisponibles.map(c => `<option value="${c.idColonia}">${c.nombre}</option>`).join('');
    
    window.cargarTablaColoniasRuta(colonias);
    
    const modal = new bootstrap.Modal(document.getElementById('coloniasRutaModal'));
    modal.show();
};

window.cargarTablaColoniasRuta = (colonias) => {
    const tbody = document.getElementById('coloniasRutaBody');
    if (!tbody) return;
    
    if (!colonias || colonias.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No hay colonias asignadas</td></tr>';
        return;
    }
    
    tbody.innerHTML = colonias.map(c => `
        <tr>
            <td>${c.colonia?.nombre || '-'}</td>
            <td>${c.tipoResiduo?.nombre || '-'}</td>
            <td>${c.fechaRecoleccion || '-'}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="window.eliminarColoniaDeRuta(${c.colonia?.idColonia})">
                    <i class="bi bi-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
};

window.agregarColoniaARuta = async () => {
    if (!rutaColoniasActual) return;
    
    const idColonia = document.getElementById('nuevaColoniaRuta').value;
    const idTipoResiduo = document.getElementById('nuevaColoniaTipoResiduo').value;
    const fechaRecoleccion = document.getElementById('nuevaColoniaFecha').value;
    
    if (!idColonia) {
        SwalAlert.warning('Advertencia', 'Selecciona una colonia');
        return;
    }
    
    try {
        await addColoniaToRuta(rutaColoniasActual, parseInt(idColonia), idTipoResiduo ? parseInt(idTipoResiduo) : null, fechaRecoleccion || null);
        SwalAlert.success('Éxito', 'Colonia agregada correctamente');
        
        const colonias = await getColoniasByRuta(rutaColoniasActual);
        window.cargarTablaColoniasRuta(colonias);
        
        const todas = await getColonias();
        const coloniaIdsAsignadas = new Set(colonias.map(c => c.colonia?.idColonia));
        const coloniasDisponibles = todas.filter(c => !coloniaIdsAsignadas.has(c.idColonia));
        document.getElementById('nuevaColoniaRuta').innerHTML = 
            '<option value="">Seleccionar colonia</option>' + 
            coloniasDisponibles.map(c => `<option value="${c.idColonia}">${c.nombre}</option>`).join('');
        
        document.getElementById('nuevaColoniaTipoResiduo').value = '';
        document.getElementById('nuevaColoniaFecha').value = '';
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al agregar colonia');
    }
};

window.eliminarColoniaDeRuta = async (idColonia) => {
    const { isConfirmed } = await SwalAlert.confirm('Confirmar', '¿Eliminar esta colonia de la ruta?');
    if (!isConfirmed) return;
    
    try {
        await removeColoniaFromRuta(rutaColoniasActual, idColonia);
        SwalAlert.success('Éxito', 'Colonia eliminada de la ruta');
        
        const colonias = await getColoniasByRuta(rutaColoniasActual);
        window.cargarTablaColoniasRuta(colonias);
        
        const todas = await getColonias();
        const coloniaIdsAsignadas = new Set(colonias.map(c => c.colonia?.idColonia));
        const coloniasDisponibles = todas.filter(c => !coloniaIdsAsignadas.has(c.idColonia));
        document.getElementById('nuevaColoniaRuta').innerHTML = 
            '<option value="">Seleccionar colonia</option>' + 
            coloniasDisponibles.map(c => `<option value="${c.idColonia}">${c.nombre}</option>`).join('');
    } catch (error) {
        SwalAlert.error('Error', error.message || 'Error al eliminar colonia');
    }
};

window.loadRutas = loadRutas;
