import api from "./api.js";
import { SwalAlert, handleDeleteError } from "../components/utils.js";

export const getCiudadanos = () => api.get("/ciudadanos");
export const getCiudadano = (id) => api.get(`/ciudadanos/${id}`);
export const createCiudadano = (data) => api.post("/ciudadanos", data);
export const updateCiudadano = (id, data) => api.put(`/ciudadanos/${id}`, data);
export const deleteCiudadano = (id) => api.delete(`/ciudadanos/${id}`);
export const registroCiudadano = (data) =>
  api.post("/ciudadanos/registro", data);

let coloniasList = [];

const loadColonias = async () => {
  try {
    const colonias = await api.get("/colonias");
    coloniasList = colonias;
  } catch (error) {
    console.error("Error cargando colonias:", error);
  }
};

export const loadCiudadanos = async () => {
  try {
    await loadColonias();

    const content = document.getElementById("ciudadanosContent");
    if (!content) return;

    content.innerHTML =
      '<div class="text-center"><div class="spinner-border" role="status"></div></div>';

    const ciudadanos = await getCiudadanos();

    content.innerHTML = `
            <div class="mb-3 d-flex gap-2 flex-wrap align-items-center">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ciudadanoModal" onclick="window.ciudadanoModalMode='create'; window.resetCiudadanoModal();">
                    <i class="bi bi-plus-circle"></i> Nuevo Ciudadano
                </button>
                <button class="btn btn-secondary" onclick="window.loadCiudadanos()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
            <div class="table-header-info">
                <h5><i class="bi bi-people me-2"></i>Ciudadanos</h5>
                <span class="badge-count">${ciudadanos.length} registros</span>
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
                                <th><i class="bi bi-house"></i> Dirección</th>
                                <th><i class="bi bi-building"></i> Colonia</th>
                                <th><i class="bi bi-gear"></i> Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${ciudadanos
                          .map(
                            (c) => `
                            <tr>
                                <td><strong>#${c.idPersona}</strong></td>
                                <td><span class="fw-bold">${c.persona?.nombre || "-"}</span></td>
                                <td>${c.persona?.telefono || "-"}</td>
                                <td>${c.persona?.email || "-"}</td>
                                <td>${c.direccionCalle || "-"}</td>
                                <td>${c.colonia?.nombre || "-"}</td>
                                <td class="table-actions">
                                    <button class="btn btn-warning btn-sm" onclick="window.editarCiudadano(${c.idPersona})">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-danger btn-sm" onclick="window.eliminarCiudadano(${c.idPersona})">
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
            ${renderCiudadanoModal()}
        `;
  } catch (error) {
    console.error("Error cargando ciudadanos:", error);
    SwalAlert.error("Error", error.message || "Error al cargar ciudadanos");
  }
};

const renderCiudadanoModal = () => `
    <div class="modal fade" id="ciudadanoModal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="ciudadanoModalTitle">Nuevo Ciudadano</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="ciudadanoForm">
                        <input type="hidden" id="ciudadanoId">
                        <div class="mb-3">
                            <label class="form-label">Nombre</label>
                            <input type="text" class="form-control" id="ciudadanoNombre" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Teléfono</label>
                            <input type="text" class="form-control" id="ciudadanoTelefono">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" id="ciudadanoEmail" required>
                        </div>
                        <div class="mb-3" id="ciudadanoPasswordGroup">
                            <label class="form-label">Contraseña <small class="text-muted">(solo para nuevo)</small></label>
                            <input type="password" class="form-control" id="ciudadanoPassword">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Dirección</label>
                            <input type="text" class="form-control" id="ciudadanoDireccion">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Colonia</label>
                            <select class="form-select" id="ciudadanoIdColonia">
                                <option value="">Seleccionar colonia...</option>
                                ${(window.ciudadanosColoniasList || []).map((c) => `<option value="${c.idColonia}">${c.nombre}</option>`).join("")}
                            </select>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="window.guardarCiudadano()">Guardar</button>
                </div>
            </div>
        </div>
    </div>
`;

window.resetCiudadanoModal = async () => {
  document.getElementById("ciudadanoModalTitle").textContent =
    "Nuevo Ciudadano";
  document.getElementById("ciudadanoId").value = "";
  document.getElementById("ciudadanoNombre").value = "";
  document.getElementById("ciudadanoTelefono").value = "";
  document.getElementById("ciudadanoEmail").value = "";
  document.getElementById("ciudadanoPassword").value = "";
  document.getElementById("ciudadanoDireccion").value = "";
  document.getElementById("ciudadanoPasswordGroup").style.display = "block";
  document.getElementById("ciudadanoEmail").removeAttribute("readonly");

  const colonias = await api.get("/colonias");
  window.ciudadanosColoniasList = colonias;
  document.getElementById("ciudadanoIdColonia").innerHTML =
    '<option value="">Seleccionar colonia...</option>' +
    colonias
      .map((c) => `<option value="${c.idColonia}">${c.nombre}</option>`)
      .join("");
};

window.editarCiudadano = async (id) => {
  try {
    const ciudadano = await getCiudadano(id);

    document.getElementById("ciudadanoModalTitle").textContent =
      "Editar Ciudadano";
    document.getElementById("ciudadanoId").value = ciudadano.idPersona;
    document.getElementById("ciudadanoNombre").value =
      ciudadano.persona?.nombre || "";
    document.getElementById("ciudadanoTelefono").value =
      ciudadano.persona?.telefono || "";
    document.getElementById("ciudadanoEmail").value =
      ciudadano.persona?.email || "";
    document.getElementById("ciudadanoEmail").setAttribute("readonly", "true");
    document.getElementById("ciudadanoPassword").value = "";
    document.getElementById("ciudadanoPasswordGroup").style.display = "none";
    document.getElementById("ciudadanoDireccion").value =
      ciudadano.direccionCalle || "";

    const colonias = await api.get("/colonias");
    window.ciudadanosColoniasList = colonias;
    const coloniaSelect = document.getElementById("ciudadanoIdColonia");
    coloniaSelect.innerHTML =
      `<option value="">Seleccionar colonia...</option>` +
      colonias
        .map(
          (c) =>
            `<option value="${c.idColonia}" ${c.idColonia === ciudadano.colonia?.idColonia ? "selected" : ""}>${c.nombre}</option>`,
        )
        .join("");

    window.ciudadanoModalMode = "edit";

    const modal = new bootstrap.Modal(
      document.getElementById("ciudadanoModal"),
    );
    modal.show();
  } catch (error) {
    SwalAlert.error("Error", "Error al cargar ciudadano: " + error.message);
  }
};

window.guardarCiudadano = async () => {
  try {
    const id = document.getElementById("ciudadanoId").value;
    const nombre = document.getElementById("ciudadanoNombre").value.trim();
    const telefono = document.getElementById("ciudadanoTelefono").value.trim();
    const email = document.getElementById("ciudadanoEmail").value.trim();
    const password = document.getElementById("ciudadanoPassword").value;
    const direccionCalle = document
      .getElementById("ciudadanoDireccion")
      .value.trim();
    const idColonia = document.getElementById("ciudadanoIdColonia").value;

    if (!nombre || !idColonia) {
      SwalAlert.warning("Advertencia", "Nombre y colonia son requeridos");
      return;
    }

    if (id && window.ciudadanoModalMode === "edit") {
      const data = {
        direccionCalle: direccionCalle || null,
        persona: { nombre, telefono: telefono || null },
        idColonia: parseInt(idColonia),
      };
      await updateCiudadano(id, data);
      SwalAlert.success("Éxito", "Ciudadano actualizado correctamente");
    } else {
      if (!email || !password) {
        SwalAlert.warning("Advertencia", "Email y contraseña son requeridos para nuevo ciudadano");
        return;
      }
      const data = {
        nombre,
        telefono: telefono || null,
        email,
        password,
        direccionCalle: direccionCalle || null,
        idColonia: parseInt(idColonia),
      };
      await registroCiudadano(data);
      SwalAlert.success("Éxito", "Ciudadano registrado correctamente");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("ciudadanoModal"),
    );
    modal.hide();

    loadCiudadanos();
  } catch (error) {
    SwalAlert.error("Error", error.message || "Error al guardar ciudadano");
  }
};

window.eliminarCiudadano = async (id) => {
  const { isConfirmed } = await SwalAlert.confirm("Confirmar eliminación", "¿Está seguro de eliminar este ciudadano?");
  if (!isConfirmed) return;

  try {
    await deleteCiudadano(id);
    SwalAlert.success("Éxito", "Ciudadano eliminado correctamente");
    loadCiudadanos();
  } catch (error) {
    if (!handleDeleteError(error, 'el ciudadano')) {
      SwalAlert.error("Error", error.message || "Error al eliminar ciudadano");
    }
  }
};

window.loadCiudadanos = loadCiudadanos;
