// =============================================================================
// 1. CONFIGURACIÓN INICIAL Y CONSTANTES
// =============================================================================
const VERSION_APLICACION = "v1.2.0";

// Desplegables por defecto cuando la app se usa por primera vez
const DESPLEGABLES_POR_DEFECTO = [
    { id: 'lista_1', nombre: 'Lista 1' },
    { id: 'lista_2', nombre: 'Lista 2' },
    { id: 'lista_3', nombre: 'Lista 3' },
    { id: 'lista_4', nombre: 'Lista 4' }
];

// Obtiene los desplegables guardados o inicializa los por defecto
function obtenerDesplegables() {
    const datosGuardados = localStorage.getItem('gestor_lista_desplegables');
    if (!datosGuardados) {
        localStorage.setItem('gestor_lista_desplegables', JSON.stringify(DESPLEGABLES_POR_DEFECTO));
        return DESPLEGABLES_POR_DEFECTO;
    }
    return JSON.parse(datosGuardados);
}

// Guarda el listado de desplegables en LocalStorage
function guardarDesplegables(lista) {
    localStorage.setItem('gestor_lista_desplegables', JSON.stringify(lista));
}

// Carga el documento seleccionado dentro del iframe central
function cargarDocumentoEnVisor(url) {
    let urlFinal = url;
    if (url.includes('docs.google.com') && url.includes('/edit')) {
        urlFinal = url.split('/edit')[0] + '/preview';
    }
    const visor = document.getElementById('visorDocumentos');
    if (visor) visor.src = urlFinal;
}

// =============================================================================
// 2. INICIALIZACIÓN Y RENDERIZADO DE NAVEGACIÓN
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    dibujarBarraNavegacion();
    comprobarMostrarBienvenida();

    const etiquetaVersion = document.getElementById('versionAplicacion');
    if (etiquetaVersion) {
        etiquetaVersion.innerText = ` | Versión: ${VERSION_APLICACION}`;
    }
});

// Genera los desplegables dinámicos en la barra superior
function dibujarBarraNavegacion() {
    const contenedor = document.getElementById('contenedorDesplegables');
    if (!contenedor) return;

    contenedor.innerHTML = "";
    const desplegables = obtenerDesplegables();

    desplegables.forEach(item => {
        const enlacesGuardados = JSON.parse(localStorage.getItem(item.id + '_enlaces')) || [];
        
        const elementoLi = document.createElement('li');
        elementoLi.className = "nav-item dropdown me-2";
        
        let htmlEnlaces = "";
        enlacesGuardados.forEach(enlace => {
            htmlEnlaces += `
                <li class="d-flex align-items-center border-bottom">
                    <a class="dropdown-item text-wrap" href="#" onclick="cargarDocumentoEnVisor('${enlace.url}'); return false;" style="flex-grow: 1; padding:8px 12px;">${enlace.nombre}</a>
                    <button class="btn btn-outline-danger btn-sm me-2" onclick="eliminarEnlace(this, '${item.id}')" style="padding: 1px 6px;" title="Eliminar enlace">
                       <i class="fi fi-rr-trash"></i>
                    </button>
                </li>
            `;
        });

        elementoLi.innerHTML = `
            <a class="nav-link dropdown-toggle" href="#" id="${item.id}" data-bs-toggle="dropdown">${item.nombre}</a>
            <ul class="dropdown-menu shadow">${htmlEnlaces.length > 0 ? htmlEnlaces : '<li><span class="dropdown-item text-muted disabled">Sin enlaces</span></li>'}</ul>
        `;
        contenedor.appendChild(elementoLi);
    });
}

// Controla la aparición del cartel blanco de bienvenida en el centro
function comprobarMostrarBienvenida() {
    const desplegables = obtenerDesplegables();
    let hayEnlacesCargados = false;

    desplegables.forEach(item => {
        const enlaces = JSON.parse(localStorage.getItem(item.id + '_enlaces')) || [];
        if (enlaces.length > 0) hayEnlacesCargados = true;
    });

    const cartel = document.getElementById('cartelBienvenida');
    if (cartel) {
        cartel.style.display = hayEnlacesCargados ? 'none' : 'block';
    }
}

function ocultarCartelBienvenida() {
    const cartel = document.getElementById('cartelBienvenida');
    if (cartel) cartel.style.display = 'none';
}

// =============================================================================
// 3. GESTIÓN DE ENLACES (AGREGAR / ELIMINAR)
// =============================================================================

function eliminarEnlace(boton, idDesplegable) {
    if (confirm("¿Estás seguro/a de que querés eliminar este enlace?")) {
        const itemLi = boton.parentElement; 
        const etiquetaA = itemLi.querySelector('a');
        const nombreEnlace = etiquetaA.innerText;
        const urlEnlace = etiquetaA.getAttribute('onclick').match(/'([^']+)'/)[1]; 

        let enlacesGuardados = JSON.parse(localStorage.getItem(idDesplegable + '_enlaces')) || [];
        enlacesGuardados = enlacesGuardados.filter(item => !(item.nombre === nombreEnlace && item.url === urlEnlace));
        
        localStorage.setItem(idDesplegable + '_enlaces', JSON.stringify(enlacesGuardados));
        dibujarBarraNavegacion();
        comprobarMostrarBienvenida();
    }
}

function mostrarModalAgregarEnlace() {
    const desplegables = obtenerDesplegables();
    let opcionesSelect = '';
    desplegables.forEach(item => {
        opcionesSelect += `<option value="${item.id}">${item.nombre}</option>`;
    });

    const contenidoModal = `
        <div id="ventanaModalTemporal" class="p-4 bg-white rounded-3 shadow-lg border" style="width: 360px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000;">
            <h6 class="fw-bold mb-3 border-bottom pb-2">Agregar Nuevo Enlace</h6>
            
            <div class="mb-2">
                <label class="form-label small fw-bold mb-1">Desplegable destino:</label>
                <select id="selectDesplegableDestino" class="form-select form-select-sm">${opcionesSelect}</select>
            </div>
            
            <div class="mb-2">
                <label class="form-label small fw-bold mb-1">Nombre del documento:</label>
                <input type="text" id="inputNombreEnlace" class="form-control form-control-sm" placeholder="Ej: Manual de Usuario">
            </div>
            
            <div class="mb-2">
                <label class="form-label small fw-bold mb-1">Etiquetas (IA):</label>
                <input type="text" id="inputEtiquetasIA" class="form-control form-control-sm" placeholder="Ej: Meta, chatbot, técnico">
            </div>
            
            <div class="mb-3">
                <label class="form-label small fw-bold mb-1">URL del documento:</label>
                <input type="text" id="inputUrlEnlace" class="form-control form-control-sm" placeholder="https://...">
            </div>
            
            <div class="d-flex justify-content-end gap-2">
                <button class="btn btn-secondary btn-sm" onclick="cerrarModalTemporal()">Cancelar</button>
                <button class="btn btn-success btn-sm" onclick="guardarNuevoEnlace()">Guardar</button>
            </div>
        </div>
    `;

    cerrarModalTemporal();
    const modal = document.createElement('div');
    modal.id = "contenedorModalTemporal";
    modal.innerHTML = contenidoModal;
    document.body.appendChild(modal);
}

function cerrarModalTemporal() {
    const modal = document.getElementById('contenedorModalTemporal');
    if (modal) {
        modal.remove();
}
}

function guardarNuevoEnlace() {
    // Leemos con fallback de IDs para evitar el error 'null'
    const selectEl = document.getElementById('selectDesplegableAgregar') || document.getElementById('selectDesplegableDestino');
    const inputNombreEl = document.getElementById('inputNombreEnlace');
    const inputUrlEl = document.getElementById('inputUrlEnlace');
    const inputEtiqEl = document.getElementById('inputEtiquetasEnlace') || document.getElementById('inputEtiquetasIA');

    const idDesplegable = selectEl ? selectEl.value : '';
    const nombre = inputNombreEl ? inputNombreEl.value.trim() : '';
    const url = inputUrlEl ? inputUrlEl.value.trim() : '';
    const etiquetas = inputEtiqEl ? inputEtiqEl.value.trim() : '';

    if (!idDesplegable) {
        alert("Por favor, seleccioná un desplegable destino.");
        return;
    }

    if (nombre && url) {
        const enlacesGuardados = JSON.parse(localStorage.getItem(idDesplegable + '_enlaces')) || [];
        enlacesGuardados.push({ nombre, url, etiquetas });
        localStorage.setItem(idDesplegable + '_enlaces', JSON.stringify(enlacesGuardados));
        
        cerrarModalTemporal();

        if (typeof dibujarBarraNavegacion === 'function') dibujarBarraNavegacion();
        if (typeof comprobarMostrarBienvenida === 'function') comprobarMostrarBienvenida();

        mostrarNotificacionExito("¡Enlace guardado con éxito!");

    } else {
        alert("Por favor, completá al menos el Nombre y la URL.");
    }
}
// =============================================================================
// 4. CREACIÓN Y EDICIÓN DE DESPLEGABLES (NUEVO MODAL PROPIO)
// =============================================================================

// Reemplaza al prompt() nativo feo por un Modal Elegante
function mostrarModalCrearDesplegable() {
    const contenidoModal = `
        <div id="ventanaModalTemporal" class="p-4 bg-white rounded-3 shadow-lg border" style="width: 360px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h6 class="fw-bold text-dark m-0">Crear Nuevo Desplegable</h6>
                <button type="button" class="btn-close" onclick="cerrarModalTemporal()" aria-label="Cerrar"></button>
            </div>
            
            <div class="mb-3 text-start mt-3">
                <label class="form-label small fw-bold mb-1 text-dark">Nombre del desplegable:</label>
                <input type="text" id="inputNombreNuevoDesplegable" class="form-control form-control-sm" placeholder="Ej: Formularios">
            </div>
            
            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" class="btn btn-secondary" onclick="cerrarModalTemporal()" style="height: 34px; padding: 0 14px; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center;">Cancelar</button>
                <button type="button" class="btn btn-primary" onclick="guardarNuevoDesplegable()" style="height: 34px; padding: 0 14px; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center;">Crear</button>
            </div>
        </div>
    `;

    cerrarModalTemporal();
    const modal = document.createElement('div');
    modal.id = "contenedorModalTemporal";
    modal.innerHTML = contenidoModal;

    // Inyección dentro del panel lateral para conservar el foco del teclado
    const panelAdmin = document.getElementById('panelAdministracion');
    if (panelAdmin) {
        panelAdmin.appendChild(modal);
    } else {
        document.body.appendChild(modal);
    }
}

function guardarNuevoDesplegable() {
    const input = document.getElementById('inputNombreNuevoDesplegable');
    const nombreNuevo = input ? input.value.trim() : '';

    if (!nombreNuevo) {
        alert("Por favor, ingresá un nombre para el desplegable.");
        return;
    }

    const desplegables = obtenerDesplegables();
    const nuevoId = `lista_${Date.now()}`;
    desplegables.push({ id: nuevoId, nombre: nombreNuevo });
    
    guardarDesplegables(desplegables);
    dibujarBarraNavegacion();
    cerrarModalTemporal();

    // Cerrar el panel lateral
    const panelElemento = document.getElementById('panelAdministracion');
    const instanciaPanel = bootstrap.Offcanvas.getInstance(panelElemento);
    if (instanciaPanel) instanciaPanel.hide();
}

// Modal Editar con BOTONES FORZADOS A TENER MISMA ALTURA Y ALINEACIÓN
function mostrarModalAgregarEnlace() {
    const desplegables = obtenerDesplegables();
    if (desplegables.length === 0) {
        return alert("Primero debés crear un desplegable para agregar enlaces.");
    }

    let opcionesSelect = '';
    desplegables.forEach(item => {
        opcionesSelect += `<option value="${item.id}">${item.nombre}</option>`;
    });

    const contenidoModal = `
        <div id="ventanaModalTemporal" class="p-4 bg-white rounded-3 shadow-lg border text-dark" style="width: 400px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h6 class="fw-bold text-dark m-0">Agregar Nuevo Enlace</h6>
                <button type="button" class="btn-close" onclick="cerrarModalTemporal()" aria-label="Cerrar"></button>
            </div>
            
            <div class="mb-3 text-start mt-2">
                <label class="form-label small fw-bold mb-1 text-dark">Desplegable destino:</label>
                <select id="selectDesplegableAgregar" class="form-select form-select-sm">
                    ${opcionesSelect}
                </select>
            </div>

            <div class="mb-3 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">Nombre del documento:</label>
                <input type="text" id="inputNombreEnlace" class="form-control form-control-sm" placeholder="Ej: Manual de Usuario">
            </div>

            <div class="mb-3 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">Etiquetas (IA):</label>
                <input type="text" id="inputEtiquetasEnlace" class="form-control form-control-sm" placeholder="Ej: Meta, chatbot, técnico">
            </div>

            <div class="mb-3 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">URL del documento:</label>
                <input type="text" id="inputUrlEnlace" class="form-control form-control-sm" placeholder="https://...">
            </div>

            <div class="d-flex justify-content-end align-items-center pt-2 border-top mt-3" style="gap: 8px;">
                <button type="button" class="btn btn-secondary btn-sm" onclick="cerrarModalTemporal()">Cancelar</button>
                <button type="button" class="btn btn-success btn-sm" onclick="guardarNuevoEnlace()">Guardar</button>
            </div>
        </div>
    `;

    cerrarModalTemporal();
    const modal = document.createElement('div');
    modal.id = "contenedorModalTemporal";
    modal.innerHTML = contenidoModal;

    // Inyectamos dentro del panel
    const panelAdmin = document.getElementById('panelAdministracion');
    if (panelAdmin) {
        panelAdmin.appendChild(modal);
    } else {
        document.body.appendChild(modal);
    }
}

function mostrarModalEditarDesplegable() {
    const desplegables = obtenerDesplegables();
    let opcionesSelect = '';
    desplegables.forEach(item => {
        opcionesSelect += `<option value="${item.id}">${item.nombre}</option>`;
    });

    const contenidoModal = `
        <div id="ventanaModalTemporal" class="p-4 bg-white rounded-3 shadow-lg border" style="width: 380px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 9999;">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h6 class="fw-bold text-dark m-0">Editar Desplegable</h6>
                <button type="button" class="btn-close" onclick="cerrarModalTemporal()" aria-label="Cerrar"></button>
            </div>
            
            <div class="mb-3 text-start mt-3">
                <label class="form-label small fw-bold mb-1 text-dark">Seleccioná el desplegable:</label>
                <select id="selectDesplegableEditar" class="form-select form-select-sm" onchange="cargarLienzoEdicionDesplegable(this.value)">
                    <option value="">-- Seleccionar --</option>
                    ${opcionesSelect}
                </select>
            </div>

            <div class="mb-3 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">Nuevo nombre:</label>
                <input type="text" id="inputNuevoNombreDesplegable" class="form-control form-control-sm" placeholder="Ej: Recursos Humanos">
            </div>

            <div id="contenedorListaEnlacesEditar" class="mb-3" style="max-height: 150px; overflow-y: auto;"></div>

            <div class="d-flex justify-content-between align-items-center pt-3 border-top mt-3" style="gap: 10px;">
                <button type="button" 
                        class="btn btn-danger" 
                        onclick="eliminarDesplegableSeleccionado()" 
                        style="height: 34px; padding: 0 14px; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center; line-height: 1;">
                    Eliminar
                </button>
                
                <div class="d-flex align-items-center" style="gap: 8px;">
                    <button type="button" 
                            class="btn btn-secondary" 
                            onclick="cerrarModalTemporal()" 
                            style="height: 34px; padding: 0 14px; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center; line-height: 1;">
                        Cancelar
                    </button>
                    <button type="button" 
                            class="btn btn-primary" 
                            onclick="guardarCambiosDesplegable()" 
                            style="height: 34px; padding: 0 14px; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center; line-height: 1;">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    `;

    cerrarModalTemporal();
    const modal = document.createElement('div');
    modal.id = "contenedorModalTemporal";
    modal.innerHTML = contenidoModal;

    // EN LUGAR DE AGREGAR AL BODY, LO INSERTAMOS DENTRO DEL PANEL DE ADMINISTRACIÓN:
    const panelAdmin = document.getElementById('panelAdministracion');
    if (panelAdmin) {
        panelAdmin.appendChild(modal);
    } else {
        document.body.appendChild(modal);
    }
}

function cargarLienzoEdicionDesplegable(id) {
    const contenedor = document.getElementById('contenedorListaEnlacesEditar');
    const inputNombre = document.getElementById('inputNuevoNombreDesplegable');

    if (!id) {
        if (contenedor) contenedor.innerHTML = "";
        if (inputNombre) inputNombre.value = "";
        return;
    }

    const desplegables = obtenerDesplegables();
    const objetivo = desplegables.find(d => String(d.id) === String(id));
    const enlaces = JSON.parse(localStorage.getItem(id + '_enlaces')) || [];
    
    let html = "<small class='fw-bold text-muted d-block mb-1'>Enlaces cargados:</small>";
    if (enlaces.length === 0) {
        html += "<p><small class='text-muted'>Sin enlaces en este desplegable.</small></p>";
    } else {
        enlaces.forEach((item, indice) => {
            html += `
                <div class="mb-2 p-2 border rounded bg-light">
                    <input type="text" class="form-control form-control-sm mb-1" value="${item.nombre}" id="edit-nombre-${indice}" placeholder="Nombre del enlace">
                    <input type="text" class="form-control form-control-sm" value="${item.etiquetas || ''}" id="edit-etiquetas-${indice}" placeholder="Etiquetas (IA)">
                </div>
            `;
        });
    }

    if (contenedor) contenedor.innerHTML = html;
    if (objetivo && inputNombre) {
        inputNombre.value = objetivo.nombre;
    }
}

function guardarCambiosDesplegable() {
    console.log("=== EJECUTANDO: guardarCambiosDesplegable ===");
    
    const select = document.getElementById('selectDesplegableEditar');
    const inputNombre = document.getElementById('inputNuevoNombreDesplegable');

    const id = select ? select.value : '';
    const nuevoNombre = inputNombre ? inputNombre.value.trim() : '';

    if (!id) {
        alert("Seleccioná un desplegable primero.");
        return;
    }

    if (!nuevoNombre) {
        alert("El nombre del desplegable no puede estar vacío.");
        return;
    }

    // 1. Actualizar el desplegable en el array
    let desplegables = obtenerDesplegables();
    const indice = desplegables.findIndex(d => String(d.id) === String(id));

    if (indice !== -1) {
        desplegables[indice].nombre = nuevoNombre;
        guardarDesplegables(desplegables);
    } else {
        console.error("No se encontró el desplegable con ID:", id);
        return;
    }

    // 2. Actualizar la lista de enlaces de este desplegable
    let enlaces = JSON.parse(localStorage.getItem(id + '_enlaces')) || [];
    const enlacesActualizados = enlaces.map((item, index) => {
        const elNombre = document.getElementById(`edit-nombre-${index}`);
        const elEtiq = document.getElementById(`edit-etiquetas-${index}`);
        return {
            ...item,
            nombre: elNombre ? elNombre.value.trim() : item.nombre,
            etiquetas: elEtiq ? elEtiq.value.trim() : item.etiquetas
        };
    });
    
    localStorage.setItem(id + '_enlaces', JSON.stringify(enlacesActualizados));

    // 3. Cerrar modal y redibujar interfaz
    cerrarModalTemporal();

    if (typeof dibujarBarraNavegacion === 'function') {
        dibujarBarraNavegacion();
    } else {
        console.warn("La función dibujarBarraNavegacion() no está definida.");
    }
    mostrarNotificacionExito("¡Desplegable actualizado con éxito!");
}
function eliminarDesplegableSeleccionado() {
    const id = document.getElementById('selectDesplegableEditar').value;
    if (!id) return alert("Seleccioná un desplegable para eliminar.");

    if (confirm("¿Estás seguro/a de borrar este desplegable y todos sus enlaces?")) {
        let desplegables = obtenerDesplegables();
        desplegables = desplegables.filter(d => d.id !== id);
        
        guardarDesplegables(desplegables);
        localStorage.removeItem(id + '_enlaces');
        
        cerrarModalTemporal();
        dibujarBarraNavegacion();
        comprobarMostrarBienvenida();
    }
}

// =============================================================================
// 5. RESPALDO DE DATOS (EXPORTAR E IMPORTAR JSON)
// =============================================================================

function exportarCopiaSeguridad() {
    const copia = {};
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        copia[clave] = localStorage.getItem(clave);
    }
    if (Object.keys(copia).length === 0) return alert("No hay datos cargados para exportar.");

    const archivoBlob = new Blob([JSON.stringify(copia, null, 2)], { type: "application/json" });
    const enlaceDescarga = document.createElement("a");
    enlaceDescarga.href = URL.createObjectURL(archivoBlob);
    enlaceDescarga.download = `gestor_documentos_backup_${VERSION_APLICACION}.json`;
    enlaceDescarga.click();
}

function importarCopiaSeguridad(archivo) {
    if (!archivo) return;
    const lector = new FileReader();
    lector.onload = function(e) {
        try {
            const datosImportados = JSON.parse(e.target.result);
            localStorage.clear();
            Object.keys(datosImportados).forEach(clave => {
                localStorage.setItem(clave, datosImportados[clave]);
            });
            
            dibujarBarraNavegacion();
            comprobarMostrarBienvenida();
            alert("¡Datos importados con éxito!");
        } catch (err) { 
            alert("El archivo subido no es un JSON válido."); 
        }
    };
    lector.readAsText(archivo);
}

// =============================================================================
// 6. ASISTENTE VIRTUAL IA (GEMINI API)
// =============================================================================

function abrirModalIA() {
    const elementoModal = document.getElementById('iaModal');
    if (!elementoModal) return;
    const instancia = bootstrap.Modal.getOrCreateInstance(elementoModal);
    
    if (elementoModal.classList.contains('show')) {
        instancia.hide();
    } else {
        instancia.show();
    }
}

function armarContextoParaIA() {
    let contexto = "Categorías y enlaces disponibles actualmente:\n";
    let hayDatos = false;

    const desplegables = obtenerDesplegables();
    desplegables.forEach(item => {
        const enlaces = JSON.parse(localStorage.getItem(item.id + '_enlaces')) || [];
        if (enlaces.length > 0) {
            hayDatos = true;
            contexto += `\n[Categoría: ${item.nombre}]:\n`;
            enlaces.forEach(enlace => {
                const tags = enlace.etiquetas ? ` (Etiquetas: ${enlace.etiquetas})` : "";
                contexto += `- ${enlace.nombre}${tags} | URL: ${enlace.url}\n`;
            });
        }
    });

    return hayDatos ? contexto : "No hay documentos cargados en el sistema actualmente.";
}

function verificarEntradaTextoIA() {
    const input = document.getElementById('entradaTextoIA');
    const boton = document.getElementById('botonEnviarIA');
    if (!input || !boton) return;

    if (input.value.trim().length > 0) {
        boton.style.backgroundColor = "#28a745";
        boton.style.color = "#ffffff";
    } else {
        boton.style.backgroundColor = "#f0f2f5";
        boton.style.color = "#888";
    }
}

async function enviarConsultaIA() {
    const input = document.getElementById('entradaTextoIA');
    const ventanaChat = document.getElementById('ventanaChatIA');
    const textoUsuario = input.value.trim();
    
    if (!textoUsuario) return;

    ventanaChat.innerHTML += `<div class="text-end text-primary mb-2"><b>Tú:</b> ${textoUsuario}</div>`;
    input.value = '';
    verificarEntradaTextoIA();

    const mensajeIA = document.createElement('div');
    mensajeIA.className = 'text-start text-success mb-2';
    mensajeIA.innerHTML = "<b>IA:</b> Pensando...";
    ventanaChat.appendChild(mensajeIA);
    ventanaChat.scrollTop = ventanaChat.scrollHeight;

    try {
        if (typeof API_KEY === 'undefined') {
            throw new Error("Clave API no encontrada. Asegurate de definir API_KEY en config.js.");
        }

        const contextoActual = armarContextoParaIA();
        const urlEndpoint = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const respuesta = await fetch(urlEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `Eres un asistente experto en gestión de documentos para el Ministerio de Desarrollo Humano. 
                        Tu tono debe ser profesional y servicial. 
                        Fecha y hora actual: ${new Date().toLocaleString()}

                        REGLAS DE FORMATO:
                        1. Usa **negritas** para resaltar nombres de documentos.
                        2. Divide la información en frases cortas.
                        3. Para enlaces usa este formato: <a href="#" onclick="cargarDocumentoEnVisor('URL_DEL_DOC'); return false;">NOMBRE_DEL_DOC</a>

                        INSTRUCCIONES SOBRE GOOGLE DRIVE:
                        Si el usuario pregunta cómo agregar un PDF/documento de Google Drive o menciona problemas de acceso/error 403:
                        1. Explicar que debe ir a Google Drive, hacer clic en "Compartir" y cambiar el acceso general a "Cualquier persona con el enlace" en modo Lector.
                        2. Aclarar que NO use enlaces de carpetas (/folders/). Debe ser el enlace directo del archivo.
                        3. Explicar que debe cambiar el final de la URL reemplazando '/view' (y sus parámetros) por '/preview'.
                           Ejemplo: cambiar https://drive.google.com/file/d/ID/view?usp=sharing por https://drive.google.com/file/d/ID/preview
                        4. Indicar que pegue la URL modificada con '/preview' en "Panel de Control" > "Agregar Enlace".

                        Contexto actual del sistema:
                        ${contextoActual}

                        Pregunta del usuario: ${textoUsuario}` 
                    }]
                }]
            })
        });

        const datos = await respuesta.json();
        if (datos.error) throw new Error(datos.error.message);

        const respuestaTexto = datos.candidates[0].content.parts[0].text;

        let textoProcesado = respuestaTexto
            .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
            .replace(/^\*\s+/gm, "• ")
            .replace(/\n/g, "<br>");

        mensajeIA.className = 'text-start mb-3 p-3 rounded-3 shadow-sm'; 
        mensajeIA.style.backgroundColor = "#f8f9fa";
        mensajeIA.style.borderLeft = "4px solid #28a745";
        mensajeIA.innerHTML = `<small class="fw-bold text-success d-block mb-1">Asistente</small>${textoProcesado}`;

    } catch (error) {
        mensajeIA.className = 'text-start mb-3 p-3 rounded-3 shadow-sm bg-light border-danger';
        mensajeIA.innerHTML = `<b class="text-danger">Error IA:</b> ${error.message}`;
    }
    ventanaChat.scrollTop = ventanaChat.scrollHeight;
}

//=========================
//notificaciones exitosas
//=========================
function mostrarNotificacionExito(mensaje) {
    // Removemos notificaciones previas si quedaron en pantalla
    const notifPrevia = document.getElementById('notificacionToast');
    if (notifPrevia) notifPrevia.remove();

    const notificacion = document.createElement('div');
    notificacion.id = 'notificacionToast';
    notificacion.className = 'alert alert-success shadow-lg d-flex align-items-center position-fixed top-0 start-50 translate-middle-x mt-4 py-2 px-4';
    notificacion.style.zIndex = '99999';
    notificacion.style.borderRadius = '10px';
    
    notificacion.innerHTML = `
        <i class="bi bi-check-circle-fill me-2 fs-5"></i>
        <span>${mensaje}</span>
    `;

    document.body.appendChild(notificacion);

    // Se auto-elimina suavemente a los 3 segundos
    setTimeout(() => {
        notificacion.style.transition = 'opacity 0.5s ease';
        notificacion.style.opacity = '0';
        setTimeout(() => notificacion.remove(), 500);
    }, 3000);
}

//===================
//EDICION EN DRIVE
//===================
function cargarDocumentoEnVisor(urlOriginal) {
    const iframe = document.getElementById('visorDocumentos');
    const btnEditar = document.getElementById('btnEditarDrive');
    const barraAcciones = document.getElementById('barraAccionesVisor');

    if (!iframe) return;

    // 1. Convertir a /preview para el iframe
    const urlPreview = typeof formatearUrlParaIframe === 'function' 
        ? formatearUrlParaIframe(urlOriginal) 
        : urlOriginal;

    iframe.src = urlPreview;

    // 2. Controlar visibilidad del botón de edición
    if (urlOriginal && urlOriginal.includes('drive.google.com')) {
        const urlEdicion = urlOriginal.replace(/\/(preview|view).*/, '/edit');
        if (btnEditar) btnEditar.href = urlEdicion;
        if (barraAcciones) barraAcciones.classList.remove('d-none');
        if (barraAcciones) barraAcciones.style.setProperty('display', 'flex', 'important');
    } else {
        if (barraAcciones) barraAcciones.style.setProperty('display', 'none', 'important');
    }
}