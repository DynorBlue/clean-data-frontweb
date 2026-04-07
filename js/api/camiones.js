import api from "./api.js";
import { SwalAlert, handleDeleteError } from "../components/utils.js";

export const getCamiones = () => api.get("/camiones");
export const getCamion = (id) => api.get(`/camiones/${id}`);
export const createCamion = (data) => api.post("/camiones", data);
export const updateCamion = (id, data) => api.put(`/camiones/${id}`, data);
export const patchCamion = (id, data) => api.patch(`/camiones/${id}`, data);
export const deleteCamion = (id) => api.delete(`/camiones/${id}`);
export const getCamionesByEstado = (estado) =>
  api.get(`/camiones/estado/${estado}`);

let camionesData = [];

export const loadCamiones = async () => {
  try {
    const content = document.getElementById("camionesContent");
    if (!content) return;

    content.innerHTML =
      '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    const camiones = await getCamiones();
    camionesData = camiones;

    content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#camionModal" onclick="window.camionModalMode='create'; window.resetCamionModal();">
                    <i class="bi bi-plus-circle"></i> Nuevo Camión
                </button>
                <button class="btn btn-secondary" onclick="window.loadCamiones()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
            <div class="table-header-info">
                <h5><i class="bi bi-truck me-2"></i>Camiones</h5>
                <span class="badge-count">${camiones.length} registros</span>
            </div>
            <div class="table-container">
                <div class="table-responsive">
                    <table class="table table-custom">
                        <thead>
                            <tr>
                                <th><i class="bi bi-hash"></i> ID</th>
                                <th><i class="bi bi-car-front"></i> Placas</th>
                                <th><i class="bi bi-car"></i> Modelo</th>
                                <th><i class="bi bi-speedometer2"></i> Capacidad (kg)</th>
                                <th><i class="bi bi-box-seam"></i> Capacidad (m³)</th>
                                <th><i class="bi bi-info-circle"></i> Estado</th>
                                <th><i class="bi bi-gear"></i> Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${camiones
                              .map(
                                (c) => `
                                <tr>
                                    <td><strong>#${c.idCamion}</strong></td>
                                    <td><span class="fw-bold">${c.placas}</span></td>
                                    <td>${c.modelo}</td>
                                    <td>${c.capacidadKg ? c.capacidadKg.toLocaleString() : "-"}</td>
                                    <td>${c.capacidadM3 || "-"}</td>
                                    <td><span class="badge badge-${getEstadoBadge(c.estado)}">${c.estado.replace("_", " ")}</span></td>
                                    <td class="table-actions">
                                        <button class="btn btn-warning btn-sm" onclick="window.editarCamion(${c.idCamion})">
                                            <i class="bi bi-pencil"></i>
                                        </button>
                                        <button class="btn btn-danger btn-sm" onclick="window.eliminarCamion(${c.idCamion})">
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
            ${renderCamionModal()}
        `;
  } catch (error) {
    console.error("Error cargando camiones:", error);
    SwalAlert.error("Error", error.message || "Error al cargar camiones");
  }
};

const getEstadoColor = (estado) => {
  const colors = {
    ACTIVO: "success",
    EN_MANTENIMIENTO: "warning",
    FUERA_SERVICIO: "danger",
  };
  return colors[estado] || "secondary";
};

const getEstadoBadge = (estado) => {
  const badges = {
    ACTIVO: "activo",
    EN_MANTENIMIENTO: "pendiente",
    FUERA_SERVICIO: "inactivo",
  };
  return badges[estado] || "inactivo";
};

const renderCamionModal = () => `
    <div class="modal fade" id="camionModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="camionModalTitle">Nuevo Camión</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="camionForm">
                        <input type="hidden" id="camionId">
                        <div class="mb-3">
                            <label class="form-label">Placas</label>
                            <input type="text" class="form-control" id="camionPlacas" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Modelo</label>
                            <input type="text" class="form-control" id="camionModelo" required>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Capacidad (kg)</label>
                                <input type="number" step="0.01" class="form-control" id="camionCapacidadKg">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">Capacidad (m³)</label>
                                <input type="number" step="0.01" class="form-control" id="camionCapacidadM3">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Estado</label>
                            <select class="form-select" id="camionEstado">
                                <option value="ACTIVO">Activo</option>
                                <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                                <option value="FUERA_SERVICIO">Fuera de Servicio</option>
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarCamion()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetCamionModal = () => {
  document.getElementById("camionModalTitle").textContent = "Nuevo Camión";
  document.getElementById("camionId").value = "";
  document.getElementById("camionPlacas").value = "";
  document.getElementById("camionModelo").value = "";
  document.getElementById("camionCapacidadKg").value = "";
  document.getElementById("camionCapacidadM3").value = "";
  document.getElementById("camionEstado").value = "ACTIVO";
};

window.editarCamion = async (id) => {
  try {
    const camion = await getCamion(id);

    document.getElementById("camionModalTitle").textContent = "Editar Camión";
    document.getElementById("camionId").value = camion.idCamion;
    document.getElementById("camionPlacas").value = camion.placas || "";
    document.getElementById("camionModelo").value = camion.modelo || "";
    document.getElementById("camionCapacidadKg").value =
      camion.capacidadKg || "";
    document.getElementById("camionCapacidadM3").value =
      camion.capacidadM3 || "";
    document.getElementById("camionEstado").value =
      camion.estado || "DISPONIBLE";

    window.camionModalMode = "edit";

    const modal = new bootstrap.Modal(document.getElementById("camionModal"));
    modal.show();
  } catch (error) {
    SwalAlert.error("Error", "Error al cargar camión: " + error.message);
  }
};

window.guardarCamion = async () => {
  try {
    const id = document.getElementById("camionId").value;
    const placas = document.getElementById("camionPlacas").value.trim();
    const modelo = document.getElementById("camionModelo").value.trim();
    const capacidadKg = document.getElementById("camionCapacidadKg").value;
    const capacidadM3 = document.getElementById("camionCapacidadM3").value;
    const estado = document.getElementById("camionEstado").value;

    if (!placas || !modelo) {
      SwalAlert.warning("Advertencia", "Placas y modelo son requeridos");
      return;
    }

    const data = {
      placas,
      modelo,
      capacidadKg: capacidadKg ? parseFloat(capacidadKg) : null,
      capacidadM3: capacidadM3 ? parseFloat(capacidadM3) : null,
      estado,
    };

    if (id && window.camionModalMode === "edit") {
      await updateCamion(id, data);
      SwalAlert.success("Éxito", "Camión actualizado correctamente");
    } else {
      await createCamion(data);
      SwalAlert.success("Éxito", "Camión creado correctamente");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("camionModal"),
    );
    modal.hide();

    loadCamiones();
  } catch (error) {
    SwalAlert.error("Error", error.message || "Error al guardar camión");
  }
};

window.eliminarCamion = async (id) => {
  const { isConfirmed } = await SwalAlert.confirm(
    "Confirmar eliminación",
    "¿Está seguro de eliminar este camión?",
  );
  if (!isConfirmed) return;

  try {
    await deleteCamion(id);
    SwalAlert.success("Éxito", "Camión eliminado correctamente");
    loadCamiones();
  } catch (error) {
    if (!handleDeleteError(error, "el camión")) {
      SwalAlert.error("Error", error.message || "Error al eliminar camión");
    }
  }
};

window.loadCamiones = loadCamiones;
