import { SwalAlert } from './utils.js';

const { jsPDF } = window.jspdf;

export const exportToExcel = (data, filename = 'export', sheetName = 'Datos') => {
    try {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        SwalAlert.success('Éxito', 'Exportado a Excel correctamente');
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        SwalAlert.error('Error', 'Error al exportar a Excel');
    }
};

export const exportToPDF = (data, filename = 'export', title = 'Datos', columns = null) => {
    try {
        const doc = new jsPDF();
        
        doc.setFontSize(18);
        doc.setTextColor(76, 175, 80);
        doc.text(title, 14, 22);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 30);
        
        let headers = [];
        let rows = [];
        
        if (columns && columns.length > 0) {
            headers = columns.map(c => c.header || c.title || c);
            rows = data.map(item => columns.map(c => {
                const key = c.key || c.dataKey || c;
                let value = item[key];
                if (typeof value === 'object' && value !== null) {
                    value = value.nombre || value.placas || value.persona?.nombre || JSON.stringify(value);
                }
                return value || '-';
            }));
        } else {
            if (data.length > 0) {
                headers = Object.keys(data[0]);
                rows = data.map(item => headers.map(h => {
                    let value = item[h];
                    if (typeof value === 'object' && value !== null) {
                        value = value.nombre || value.placas || value.persona?.nombre || JSON.stringify(value);
                    }
                    return value || '-';
                }));
            }
        }
        
        doc.autoTable({
            head: [headers],
            body: rows,
            startY: 35,
            theme: 'grid',
            headStyles: {
                fillColor: [76, 175, 80],
                textColor: 255,
                fontStyle: 'bold',
                fontSize: 10
            },
            bodyStyles: {
                fontSize: 9,
                textColor: 50
            },
            alternateRowStyles: {
                fillColor: [245, 245, 245]
            },
            margin: { top: 35, right: 14, bottom: 14, left: 14 },
            tableWidth: 'auto'
        });
        
        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        SwalAlert.success('Éxito', 'Exportado a PDF correctamente');
    } catch (error) {
        console.error('Error exportando a PDF:', error);
        SwalAlert.error('Error', 'Error al exportar a PDF');
    }
};

export const exportAllToExcel = async (modulosData, filename = 'clean_data_completo') => {
    try {
        const wb = XLSX.utils.book_new();
        
        const modulos = [
            { key: 'colonias', name: 'Colonias', data: modulosData.colonias || [], columns: ['idColonia', 'nombre', 'codigoPostal', 'latitud', 'longitud'] },
            { key: 'camiones', name: 'Camiones', data: modulosData.camiones || [], columns: ['idCamion', 'placas', 'modelo', 'capacidadKg', 'capacidadM3', 'estado'] },
            { key: 'conductores', name: 'Conductores', data: modulosData.conductores || [], columns: ['idPersona', 'persona.nombre', 'persona.telefono', 'persona.email', 'licencia', 'estadoOperativo'] },
            { key: 'rutas', name: 'Rutas', data: modulosData.rutas || [], columns: ['idRuta', 'nombre', 'descripcion', 'activa'] },
            { key: 'viajes', name: 'Viajes', data: modulosData.viajes || [], columns: ['idViaje', 'camion.placas', 'conductor.persona.nombre', 'ruta.nombre', 'tipoResiduo.nombre', 'fechaInicio', 'fechaFin', 'estado'] },
            { key: 'recolecciones', name: 'Recolecciones', data: modulosData.recolecciones || [], columns: ['idRecoleccion', 'idViaje', 'tipoResiduo.nombre', 'volumenM3', 'pesoKg', 'fechaRegistro'] },
            { key: 'ciudadanos', name: 'Ciudadanos', data: modulosData.ciudadanos || [], columns: ['idPersona', 'persona.nombre', 'persona.telefono', 'persona.email', 'direccionCalle', 'colonia.nombre'] },
            { key: 'reportes', name: 'Reportes', data: modulosData.reportes || [], columns: ['idReporte', 'usuario.email', 'colonia.nombre', 'tipoResiduo.nombre', 'fecha', 'descripcion', 'estado'] }
        ];
        
        modulos.forEach(modulo => {
            if (modulo.data && modulo.data.length > 0) {
                const sheetData = modulo.data.map(item => {
                    const row = {};
                    modulo.columns.forEach(col => {
                        const keys = col.split('.');
                        let value = item;
                        keys.forEach(k => {
                            value = value ? value[k] : null;
                        });
                        row[col] = value || '-';
                    });
                    return row;
                });
                
                const ws = XLSX.utils.json_to_sheet(sheetData);
                XLSX.utils.book_append_sheet(wb, ws, modulo.name);
            }
        });
        
        XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
        SwalAlert.success('Éxito', 'Exportado a Excel correctamente');
    } catch (error) {
        console.error('Error exportando a Excel:', error);
        SwalAlert.error('Error', 'Error al exportar a Excel');
    }
};

export const exportAllToPDF = async (modulosData, filename = 'clean_data_completo') => {
    try {
        const doc = new jsPDF();
        
        doc.setFontSize(20);
        doc.setTextColor(76, 175, 80);
        doc.text('Clean Data - Reporte Completo', 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Fecha de exportación: ${new Date().toLocaleString()}`, 14, 28);
        
        let currentY = 35;
        
        const modulos = [
            { key: 'colonias', name: 'Colonias', data: modulosData.colonias || [], columns: [
                { header: 'ID', key: 'idColonia' },
                { header: 'Nombre', key: 'nombre' },
                { header: 'CP', key: 'codigoPostal' },
                { header: 'Latitud', key: 'latitud' },
                { header: 'Longitud', key: 'longitud' }
            ]},
            { key: 'camiones', name: 'Camiones', data: modulosData.camiones || [], columns: [
                { header: 'ID', key: 'idCamion' },
                { header: 'Placas', key: 'placas' },
                { header: 'Modelo', key: 'modelo' },
                { header: 'Cap. kg', key: 'capacidadKg' },
                { header: 'Estado', key: 'estado' }
            ]},
            { key: 'conductores', name: 'Conductores', data: modulosData.conductores || [], columns: [
                { header: 'ID', key: 'idPersona' },
                { header: 'Nombre', key: 'persona.nombre' },
                { header: 'Teléfono', key: 'persona.telefono' },
                { header: 'Email', key: 'persona.email' },
                { header: 'Estado', key: 'estadoOperativo' }
            ]},
            { key: 'rutas', name: 'Rutas', data: modulosData.rutas || [], columns: [
                { header: 'ID', key: 'idRuta' },
                { header: 'Nombre', key: 'nombre' },
                { header: 'Descripción', key: 'descripcion' },
                { header: 'Activa', key: 'activa' }
            ]},
            { key: 'viajes', name: 'Viajes', data: modulosData.viajes || [], columns: [
                { header: 'ID', key: 'idViaje' },
                { header: 'Camión', key: 'camion.placas' },
                { header: 'Conductor', key: 'conductor.persona.nombre' },
                { header: 'Estado', key: 'estado' }
            ]},
            { key: 'recolecciones', name: 'Recolecciones', data: modulosData.recolecciones || [], columns: [
                { header: 'ID', key: 'idRecoleccion' },
                { header: 'Viaje', key: 'idViaje' },
                { header: 'Volumen', key: 'volumenM3' },
                { header: 'Peso', key: 'pesoKg' }
            ]},
            { key: 'ciudadanos', name: 'Ciudadanos', data: modulosData.ciudadanos || [], columns: [
                { header: 'ID', key: 'idPersona' },
                { header: 'Nombre', key: 'persona.nombre' },
                { header: 'Teléfono', key: 'persona.telefono' },
                { header: 'Colonia', key: 'colonia.nombre' }
            ]},
            { key: 'reportes', name: 'Reportes', data: modulosData.reportes || [], columns: [
                { header: 'ID', key: 'idReporte' },
                { header: 'Colonia', key: 'colonia.nombre' },
                { header: 'Estado', key: 'estado' },
                { header: 'Fecha', key: 'fecha' }
            ]}
        ];
        
        modulos.forEach(modulo => {
            if (modulo.data && modulo.data.length > 0) {
                if (currentY > 250) {
                    doc.addPage();
                    currentY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(76, 175, 80);
                doc.text(`${modulo.name} (${modulo.data.length})`, 14, currentY);
                currentY += 5;
                
                const rows = modulo.data.slice(0, 30).map(item => {
                    return modulo.columns.map(col => {
                        const keys = col.key.split('.');
                        let value = item;
                        keys.forEach(k => {
                            value = value ? value[k] : null;
                        });
                        return value || '-';
                    });
                });
                
                const headers = modulo.columns.map(c => c.header);
                
                doc.autoTable({
                    head: [headers],
                    body: rows,
                    startY: currentY,
                    theme: 'grid',
                    headStyles: {
                        fillColor: [76, 175, 80],
                        textColor: 255,
                        fontStyle: 'bold',
                        fontSize: 9
                    },
                    bodyStyles: {
                        fontSize: 8,
                        textColor: 50
                    },
                    alternateRowStyles: {
                        fillColor: [245, 245, 245]
                    },
                    margin: { top: currentY, right: 14, bottom: 14, left: 14 },
                    tableWidth: 'auto'
                });
                
                currentY = doc.lastAutoTable.finalY + 10;
            }
        });
        
        doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
        SwalAlert.success('Éxito', 'Exportado a PDF correctamente');
    } catch (error) {
        console.error('Error exportando a PDF:', error);
        SwalAlert.error('Error', 'Error al exportar a PDF');
    }
};

window.exportToExcel = exportToExcel;
window.exportToPDF = exportToPDF;
window.exportAllToExcel = exportAllToExcel;
window.exportAllToPDF = exportAllToPDF;
