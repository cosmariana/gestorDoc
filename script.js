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
    if (modal) modal.remove();
}

function guardarNuevoEnlace() {
    const idDesplegable = document.getElementById('selectDesplegableDestino').value;
    const nombre = document.getElementById('inputNombreEnlace').value.trim();
    const url = document.getElementById('inputUrlEnlace').value.trim();
    const etiquetas = document.getElementById('inputEtiquetasIA').value.trim();

    if (nombre && url) {
        const enlacesGuardados = JSON.parse(localStorage.getItem(idDesplegable + '_enlaces')) || [];
        enlacesGuardados.push({ nombre, url, etiquetas });
        localStorage.setItem(idDesplegable + '_enlaces', JSON.stringify(enlacesGuardados));
        
        cerrarModalTemporal();
        dibujarBarraNavegacion();
        comprobarMostrarBienvenida();

        // Cerrar panel lateral si está abierto
        const panelElemento = document.getElementById('panelAdministracion');
        const instanciaPanel = bootstrap.Offcanvas.getInstance(panelElemento);
        if (instanciaPanel) instanciaPanel.hide();

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
        <div id="ventanaModalTemporal" class="p-4 bg-white rounded-3 shadow-lg border" style="width: 360px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000;">
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
    document.body.appendChild(modal);
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
    let opcionesSelect = '';
    desplegables.forEach(item => {
        opcionesSelect += `<option value="${item.id}">${item.nombre}</option>`;
    });

    const contenidoModal = `
        <div id="ventanaModalTemporal" class="p-4 bg-white rounded-3 shadow-lg border" style="width: 360px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000;">
            <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
                <h6 class="fw-bold text-dark m-0">Agregar Nuevo Enlace</h6>
                <button type="button" class="btn-close" onclick="cerrarModalTemporal()" aria-label="Cerrar"></button>
            </div>
            
            <div class="mb-2 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">Desplegable destino:</label>
                <select id="selectDesplegableDestino" class="form-select form-select-sm">${opcionesSelect}</select>
            </div>
            
            <div class="mb-2 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">Nombre del documento:</label>
                <input type="text" id="inputNombreEnlace" class="form-control form-control-sm" placeholder="Ej: Manual de Usuario">
            </div>
            
            <div class="mb-2 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">Etiquetas (IA):</label>
                <input type="text" id="inputEtiquetasIA" class="form-control form-control-sm" placeholder="Ej: Meta, chatbot, técnico">
            </div>
            
            <div class="mb-3 text-start">
                <label class="form-label small fw-bold mb-1 text-dark">URL del documento:</label>
                <input type="text" id="inputUrlEnlace" class="form-control form-control-sm" placeholder="https://...">
            </div>
            
            <div class="d-flex justify-content-end gap-2 pt-2 border-top">
                <button type="button" class="btn btn-secondary" onclick="cerrarModalTemporal()" style="height: 34px; padding: 0 14px; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center;">Cancelar</button>
                <button type="button" class="btn btn-success" onclick="guardarNuevoEnlace()" style="height: 34px; padding: 0 14px; font-size: 0.875rem; display: inline-flex; align-items: center; justify-content: center;">Guardar</button>
            </div>
        </div>
    `;

    cerrarModalTemporal();
    const modal = document.createElement('div');
    modal.id = "contenedorModalTemporal";
    modal.innerHTML = contenidoModal;
    document.body.appendChild(modal);
}

function mostrarModalEditarDesplegable() {
    const desplegables = obtenerDesplegables();
    let opcionesSelect = '';
    desplegables.forEach(item => {
        opcionesSelect += `<option value="${item.id}">${item.nombre}</option>`;
    });

    const contenidoModal = `
        <div id="ventanaModalTemporal" class="p-4 bg-white rounded-3 shadow-lg border" style="width: 380px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 2000;">
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
    document.body.appendChild(modal);
}

function cargarLienzoEdicionDesplegable(id) {
    const contenedor = document.getElementById('contenedorListaEnlacesEditar');
    if (!id) {
        contenedor.innerHTML = "";
        return;
    }

    const desplegables = obtenerDesplegables();
    const objetivo = desplegables.find(d => d.id === id);
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

    contenedor.innerHTML = html;
    if (objetivo) document.getElementById('inputNuevoNombreDesplegable').value = objetivo.nombre;
}

function guardarCambiosDesplegable() {
    const id = document.getElementById('selectDesplegableEditar').value;
    const nuevoNombre = document.getElementById('inputNuevoNombreDesplegable').value.trim();
    
    if (!id) return alert("Seleccioná un desplegable primero.");

    let desplegables = obtenerDesplegables();
    const indice = desplegables.findIndex(d => d.id === id);

    if (indice !== -1 && nuevoNombre) {
        desplegables[indice].nombre = nuevoNombre;
        guardarDesplegables(desplegables);
    }

    let enlaces = JSON.parse(localStorage.getItem(id + '_enlaces')) || [];
    enlaces = enlaces.map((item, index) => ({
        ...item,
        nombre: document.getElementById(`edit-nombre-${index}`).value,
        etiquetas: document.getElementById(`edit-etiquetas-${index}`).value
    }));
    
    localStorage.setItem(id + '_enlaces', JSON.stringify(enlaces));
    
    cerrarModalTemporal();
    dibujarBarraNavegacion();
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