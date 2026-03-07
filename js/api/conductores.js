import api from "./api.js";
import { showToast } from "../components/utils.js";

export const getConductores = () => api.get("/conductores");
export const getConductor = (id) => api.get(`/conductores/${id}`);
export const createConductor = (data) => api.post("/conductores", data);
export const updateConductor = (id, data) =>
  api.put(`/conductores/${id}`, data);
export const deleteConductor = (id) => api.delete(`/conductores/${id}`);
export const registroConductor = (data) =>
  api.post("/conductores/registro", data);
export const getConductoresByEstado = (estado) =>
  api.get(`/conductores/estado/${estado}`);

let conductoresData = [];

const getEstadoConductorBadge = (estado) => {
  const badges = {
    'ACTIVO': 'activo',
    'INACTIVO': 'inactivo',
    'DISPONIBLE': 'activo',
    'EN_SERVICIO': 'en-atencion',
    'EN_RUTA': 'pendiente'
  };
  return badges[estado] || 'inactivo';
};

export const loadConductores = async () => {
  try {
    const content = document.getElementById("conductoresContent");
    if (!content) return;

    content.innerHTML =
      '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    const conductores = await getConductores();
    conductoresData = conductores;

    content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#conductorModal" onclick="window.conductorModalMode='create'; window.resetConductorModal();">
                    <i class="bi bi-plus-circle"></i> Nuevo Conductor
                </button>
                <button class="btn btn-secondary" onclick="window.loadConductores()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
            <div class="table-header-info">
                <h5><i class="bi bi-people me-2"></i>Conductores</h5>
                <span class="badge-count">${conductores.length} registros</span>
            </div>
            <div class="table-container">
                <div class="table-responsive">
                    <table class="table table-custom">
                        <thead>
                            <tr>
                                <th><i class="bi bi-hash"></i> ID</th>
                                <th><i class="bi bi-person"></i> Nombre</th>
                                <th><i class="bi bi-telephone"></i> Teléfono</th>
                                <th><i class="bi bi-envelope"></i> Email</th>
                                <th><i class="bi bi-card-text"></i> Licencia</th>
                                <th><i class="bi bi-calendar-plus"></i> Fecha Alta</th>
                                <th><i class="bi bi-info-circle"></i> Estado</th>
                                <th><i class="bi bi-gear"></i> Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${conductores
                          .map(
                            (c) => `
                            <tr>
                                <td><strong>#${c.idPersona}</strong></td>
                                <td><span class="fw-bold">${c.persona?.nombre || "-"}</span></td>
                                <td>${c.persona?.telefono || "-"}</td>
                                <td>${c.persona?.email || "-"}</td>
                                <td>${c.licencia || "-"}</td>
                                <td>${c.fechaAlta ? new Date(c.fechaAlta).toLocaleDateString() : "-"}</td>
                                <td><span class="badge badge-${getEstadoConductorBadge(c.estadoOperativo)}">${c.estadoOperativo || "-"}</span></td>
                                <td class="table-actions">
                                    <button class="btn btn-warning btn-sm" onclick="window.editarConductor(${c.idPersona})">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="window.eliminarConductor(${c.idPersona})">
                                        <i class="bi bi-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `,
                          )
                          .join("")}
                        </tbody>
                    </table>
                </div>
            </div>
            ${renderConductorModal()}
        `;
  } catch (error) {
    console.error("Error cargando conductores:", error);
    showToast(error.message || "Error al cargar conductores", "danger");
  }
};

const getEstadoConductorColor = (estado) => {
  const colors = {
    ACTIVO: "success",
    INACTIVO: "secondary",
    SUSPENDIDO: "warning",
    BAJA: "danger",
  };
  return colors[estado] || "secondary";
};

const renderConductorModal = () => `
    <div class="modal fade" id="conductorModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="conductorModalTitle">Nuevo Conductor</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="conductorForm">
                        <input type="hidden" id="conductorId">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="conductorNombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Teléfono</label>
                            <input type="text" class="form-control" id="conductorTelefono">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Licencia</label>
                            <input type="text" class="form-control" id="conductorLicencia" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="conductorEmail" required>
                        </div>
                        <div class="mb-3" id="conductorPasswordGroup">
                            <label class="form-label">Contraseña <small class="text-muted">(solo para nuevo)</small></label>
                            <input type="password" class="form-control" id="conductorPassword">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Fecha de Alta</label>
                            <input type="date" class="form-control" id="conductorFechaAlta">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Estado Operativo</label>
                            <select class="form-select" id="conductorEstado">
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                                <option value="SUSPENDIDO">Suspendido</option>
                                <option value="BAJA">Baja</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarConductor()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetConductorModal = () => {
  document.getElementById("conductorModalTitle").textContent =
    "Nuevo Conductor";
  document.getElementById("conductorId").value = "";
  document.getElementById("conductorNombre").value = "";
  document.getElementById("conductorTelefono").value = "";
  document.getElementById("conductorLicencia").value = "";
  document.getElementById("conductorEmail").value = "";
  document.getElementById("conductorEmail").removeAttribute("readonly");
  document.getElementById("conductorPassword").value = "";
  document.getElementById("conductorPasswordGroup").style.display = "block";
  document.getElementById("conductorFechaAlta").value = "";
  document.getElementById("conductorEstado").value = "ACTIVO";
};

window.editarConductor = async (id) => {
  try {
    const conductor = await getConductor(id);

    document.getElementById("conductorModalTitle").textContent =
      "Editar Conductor";
    document.getElementById("conductorId").value = conductor.idPersona;
    document.getElementById("conductorNombre").value =
      conductor.persona?.nombre || "";
    document.getElementById("conductorTelefono").value =
      conductor.persona?.telefono || "";
    document.getElementById("conductorLicencia").value =
      conductor.licencia || "";
    document.getElementById("conductorEmail").value =
      conductor.persona?.email || "";
    document.getElementById("conductorEmail").setAttribute("readonly", "true");
    document.getElementById("conductorPassword").value = "";
    document.getElementById("conductorPasswordGroup").style.display = "none";
    document.getElementById("conductorFechaAlta").value =
      conductor.fechaAlta || "";
    document.getElementById("conductorEstado").value =
      conductor.estadoOperativo || "ACTIVO";

    window.conductorModalMode = "edit";

    const modal = new bootstrap.Modal(
      document.getElementById("conductorModal"),
    );
    modal.show();
  } catch (error) {
    showToast("Error al cargar conductor: " + error.message, "danger");
  }
};

window.guardarConductor = async () => {
  try {
    const id = document.getElementById("conductorId").value;
    const nombre = document.getElementById("conductorNombre").value.trim();
    const telefono = document.getElementById("conductorTelefono").value.trim();
    const licencia = document.getElementById("conductorLicencia").value.trim();
    const email = document.getElementById("conductorEmail").value.trim();
    const password = document.getElementById("conductorPassword").value;
    const fechaAlta = document.getElementById("conductorFechaAlta").value;
    const estado = document.getElementById("conductorEstado").value;

    if (!nombre || !licencia) {
      showToast("Nombre y licencia son requeridos", "warning");
      return;
    }

    const persona = { nombre, telefono: telefono || null };

    if (id && window.conductorModalMode === "edit") {
      const data = {
        licencia,
        fechaAlta: fechaAlta || null,
        estadoOperativo: estado,
        persona,
      };
      await updateConductor(id, data);
      showToast("Conductor actualizado correctamente", "success");
    } else {
      if (!email || !password) {
        showToast(
          "Email y contraseña son requeridos para nuevo conductor",
          "warning",
        );
        return;
      }
      const data = {
        nombre,
        telefono: telefono || null,
        licencia,
        password,
        email,
        fechaAlta: fechaAlta || null,
      };
      await registroConductor(data);
      showToast("Conductor registrado correctamente", "success");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("conductorModal"),
    );
    modal.hide();

    loadConductores();
  } catch (error) {
    showToast(error.message || "Error al guardar conductor", "danger");
  }
};

window.eliminarConductor = async (id) => {
  if (!confirm("¿Está seguro de eliminar este conductor?")) return;

  try {
    await deleteConductor(id);
    showToast("Conductor eliminado correctamente", "success");
    loadConductores();
  } catch (error) {
    showToast(error.message || "Error al eliminar conductor", "danger");
  }
};

window.loadConductores = loadConductores;
