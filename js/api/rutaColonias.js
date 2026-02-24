import api from './api.js';

export const addColoniaToRuta = (idRuta, idColonia) => 
    api.post(`/rutas/${idRuta}/colonias`, { idColonia });

export const getColoniasByRuta = (idRuta) => 
    api.get(`/rutas/${idRuta}/colonias`);

export const getRutasByColonia = (idColonia) => 
    api.get(`/colonias/${idColonia}/rutas`);

export const removeColoniaFromRuta = (idRuta, idColonia) => 
    api.delete(`/rutas/${idRuta}/colonias/${idColonia}`);
