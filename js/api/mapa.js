import api from "./api.js";

export const getCamionesGps = () => api.get('/camiones-gps');
export const getCamionGps = (id) => api.get(`/camiones-gps/${id}`);

var map = L.map('map', {
    center: [21.12377, -101.68213],
    zoom: 14,
    zoomControl: false
});

var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var iconA = L.icon({
    iconUrl: 'img/activo.png',
    iconSize: [32, 32]
});

var iconF = L.icon({
    iconUrl: 'img/fueraservicio.png',
    iconSize: [32, 32]
});

var iconM = L.icon({
    iconUrl: 'img/mantenimiento.png',
    iconSize: [32, 32]
});

async function traerCamiones() {
    try {
    const camiones = await getCamionesGps(); 

    camiones.forEach(camion => {

        let estado = camion.camion.estado; 
        let icono;

        if (estado === "ACTIVO") {
            icono = iconA;
        } else if (estado === "FUERA_SERVICIO") {
            icono = iconF;
        } else {
            icono = iconM;
        }

        L.marker([camion.latitud, camion.longitud], { icon: icono })
            .addTo(map)
            .bindPopup(`
                <b>Conductor:</b> ${camion.camion.nombre.nombre} ${camion.camion.nombre.apellido}<br>
                <b>Modelo:</b> ${camion.camion.modelo} <br>
                <b>Placas:</b> ${camion.camion.placas} <br>
                <b>Estado:</b> ${camion.camion.estado} <br>
            `);
    });

} catch (error) {
    console.error("Error al traer camiones:", error);
}
}

traerCamiones()