import api, { showToast } from "./api.js";

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
            <div class="mb-3">
                <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#ciudadanoModal" onclick="window.ciudadanoModalMode='create'; window.resetCiudadanoModal();">
                    <i class="bi bi-plus-circle"></i> Nuevo Ciudadano
                </button>
                <button class="btn btn-secondary" onclick="window.loadCiudadanos()">
                    <i class="bi bi-arrow-clockwise"></i> Actualizar
                </button>
            </div>
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Teléfono</th>
                            <th>Email</th>
                            <th>Dirección</th>
                            <th>Colonia</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ciudadanos
                          .map(
                            (c) => `
                            <tr>
                                <td>${c.idPersona}</td>
                                <td>${c.persona?.nombre || "-"}</td>
                                <td>${c.persona?.telefono || "-"}</td>
                                <td>${c.persona?.email || "-"}</td>
                                <td>${c.direccionCalle || "-"}</td>
                                <td>${c.colonia?.nombre || "-"}</td>
                                <td>
                                    <button class="btn btn-sm btn-warning" onclick="window.editarCiudadano(${c.idPersona})">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="window.eliminarCiudadano(${c.idPersona})">
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
            ${renderCiudadanoModal()}
        `;
  } catch (error) {
    console.error("Error cargando ciudadanos:", error);
    showToast(error.message || "Error al cargar ciudadanos", "danger");
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
    showToast("Error al cargar ciudadano: " + error.message, "danger");
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
      showToast("Nombre y colonia son requeridos", "warning");
      return;
    }

    if (id && window.ciudadanoModalMode === "edit") {
      const data = {
        direccionCalle: direccionCalle || null,
        persona: { nombre, telefono: telefono || null },
        idColonia: parseInt(idColonia),
      };
      await updateCiudadano(id, data);
      showToast("Ciudadano actualizado correctamente", "success");
    } else {
      if (!email || !password) {
        showToast(
          "Email y contraseña son requeridos para nuevo ciudadano",
          "warning",
        );
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
      showToast("Ciudadano registrado correctamente", "success");
    }

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("ciudadanoModal"),
    );
    modal.hide();

    loadCiudadanos();
  } catch (error) {
    showToast(error.message || "Error al guardar ciudadano", "danger");
  }
};

window.eliminarCiudadano = async (id) => {
  if (!confirm("¿Está seguro de eliminar este ciudadano?")) return;

  try {
    await deleteCiudadano(id);
    showToast("Ciudadano eliminado correctamente", "success");
    loadCiudadanos();
  } catch (error) {
    showToast(error.message || "Error al eliminar ciudadano", "danger");
  }
};

window.loadCiudadanos = loadCiudadanos;
