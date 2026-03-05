// =============================================================================
// 1. CONFIGURACIÓN GLOBAL
// =============================================================================
const APP_VERSION = "v1.1.2";


// Función que carga documentos en el iframe
function loadDocument(url) {
    document.getElementById('documentViewer').src = url;
}

// =============================================================================
// 2. GESTIÓN DE ENLACES (ESTRUCTURA ORIGINAL)
// =============================================================================

// Función para eliminar un enlace
function deleteLink(button) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este enlace?");
    if (confirmDelete) {
        const linkItem = button.parentElement; // El <li>
        const linkAnchor = linkItem.querySelector('a');
        const linkName = linkAnchor.innerText;
        const linkURL = linkAnchor.getAttribute('onclick').match(/'([^']+)'/)[1]; 
        
        const dropdownMenu = linkItem.closest('.dropdown-menu');
        const dropdownButton = dropdownMenu.closest('.nav-item').querySelector('.dropdown-toggle');
        const dropdownId = dropdownButton.id;

        // Eliminar del DOM
        linkItem.remove();

        // Eliminar del localStorage
        let storedLinks = JSON.parse(localStorage.getItem(dropdownId + '_links')) || [];
        storedLinks = storedLinks.filter(link => !(link.name === linkName && link.url === linkURL));
        
        localStorage.setItem(dropdownId + '_links', JSON.stringify(storedLinks));

        alert("¡Enlace eliminado correctamente!");
    }
}

// Función para mostrar el modal de AGREGAR enlace
function showAddLinkModal() {
    const ids = ['dropdownMenuButton1', 'dropdownMenuButton2', 'dropdownMenuButton3', 'dropdownMenuButton4'];
    let selectOptions = '';
    ids.forEach(id => {
        const button = document.getElementById(id);
        const name = button ? button.innerText : id; 
        selectOptions += `<option value="${id}">${name}</option>`;
    });

    const modalContent = `
        <div id="addLinkModal" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; background: white; border: 1px solid #ccc; border-radius: 5px; width: 320px; position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            <label><b>Categoría:</b></label>
            <select id="dropdownSelection">${selectOptions}</select>
            
            <label><b>Nombre del enlace:</b></label>
            <input type="text" id="linkName" placeholder="Ej: Manual de Usuario">
            
            <label><b>Etiquetas/Temas (IA):</b></label>
            <input type="text" id="linkTags" placeholder="Ej: Meta, chatbot, técnico">
            
            <label><b>URL del enlace:</b></label>
            <input type="text" id="linkURL" placeholder="https://...">
            
            <button class="btn btn-success mt-2" onclick="addLink()">Guardar Enlace</button>
            <button class="btn btn-secondary mt-1" onclick="closeModal()">Cancelar</button>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = "addLinkModalContainer";
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

function closeModal() {
    const modal = document.getElementById('addLinkModalContainer');
    if (modal) modal.remove();
}

function addLink() {
    const dropdownSelection = document.getElementById('dropdownSelection').value;
    const linkName = document.getElementById('linkName').value;
    const linkURL = document.getElementById('linkURL').value;
    const linkTags = document.getElementById('linkTags').value; // Capturamos etiquetas

    if (linkName && linkURL) {
        const dropdownButton = document.getElementById(dropdownSelection);
        const menu = dropdownButton.closest('.nav-item').querySelector('.dropdown-menu');

        if (menu) {
            // Guardar en localStorage incluyendo el nuevo campo 'tags'
            const storedLinks = JSON.parse(localStorage.getItem(dropdownSelection + '_links')) || [];
            storedLinks.push({ 
                name: linkName, 
                url: linkURL, 
                tags: linkTags // Guardamos los tags aquí
            });
            localStorage.setItem(dropdownSelection + '_links', JSON.stringify(storedLinks));

            // Recargar la interfaz para que aparezca el botón de eliminar y el link
            location.reload(); 
        }
    } else {
        alert("Por favor, completa Nombre y URL.");
    }
}

// =============================================================================
// 3. EDICIÓN DE CATEGORÍAS
// =============================================================================

function showEditDropdownModal() {
    const ids = ['dropdownMenuButton1', 'dropdownMenuButton2', 'dropdownMenuButton3', 'dropdownMenuButton4'];
    let selectOptions = '';
    ids.forEach(id => {
        const name = document.getElementById(id)?.innerText || id;
        selectOptions += `<option value="${id}">${name}</option>`;
    });

    const modalContent = `
        <div id="editDropdownModal" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; background: white; border: 1px solid #ccc; border-radius: 8px; width: 400px; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); z-index: 1000; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <h5>Configuración de Categoría</h5>
            
            <label>Selecciona el desplegable:</label>
            <select id="dropdownSelectionEdit" onchange="renderLinksEditor(this.value)">
                <option value="">-- Selecciona --</option>
                ${selectOptions}
            </select>

            <label>Nuevo nombre de la categoría:</label>
            <input type="text" id="dropdownNewName" placeholder="Ej: Recursos Humanos">

            <div id="linksEditorContainer" style="margin-top: 10px; border-top: 1px solid #eee; padding-top: 10px;">
                </div>

            <button class="btn btn-primary mt-2" onclick="updateFullCategory()">Guardar Cambios</button>
            <button class="btn btn-secondary mt-1" onclick="closeEditDropdownModal()">Cancelar</button>
        </div>
    `;

    const modal = document.createElement('div');
    modal.id = "editDropdownModalContainer";
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

function renderLinksEditor(id) {
    const container = document.getElementById('linksEditorContainer');
    if (!id) {
        container.innerHTML = "";
        return;
    }

    const enlaces = JSON.parse(localStorage.getItem(id + '_links')) || [];
    let html = "<h6>Enlaces y Etiquetas IA:</h6>";
    
    if (enlaces.length === 0) {
        html += "<p><small>No hay enlaces en esta categoría.</small></p>";
    } else {
        enlaces.forEach((link, index) => {
            html += `
                <div class="mb-2">
                    <input type="text" class="form-control form-control-sm mb-1" value="${link.name}" id="edit-name-${index}" placeholder="Nombre del enlace">
                    <input type="text" class="form-control form-control-sm" value="${link.tags || ''}" id="edit-tags-${index}" placeholder="Etiquetas (IA)">
                </div>
            `;
        });
    }
    container.innerHTML = html;
    
    // De paso, ponemos el nombre actual de la categoría en el input de arriba
    document.getElementById('dropdownNewName').value = document.getElementById(id).innerText;
}
function closeEditDropdownModal() {
    const modal = document.getElementById('editDropdownModalContainer');
    if (modal) modal.remove();
}

function updateFullCategory() {
    const id = document.getElementById('dropdownSelectionEdit').value;
    const newCatName = document.getElementById('dropdownNewName').value;
    
    if (!id) return alert("Selecciona una categoría");

    // 1. Guardar nuevo nombre de categoría
    if (newCatName) {
        localStorage.setItem(id, newCatName);
        document.getElementById(id).innerText = newCatName;
    }

    // 2. Guardar cambios en enlaces y etiquetas
    let enlaces = JSON.parse(localStorage.getItem(id + '_links')) || [];
    enlaces = enlaces.map((link, index) => {
        return {
            ...link,
            name: document.getElementById(`edit-name-${index}`).value,
            tags: document.getElementById(`edit-tags-${index}`).value
        };
    });
    
    localStorage.setItem(id + '_links', JSON.stringify(enlaces));
    
    alert("¡Cambios guardados con éxito!");
    location.reload(); // Recargamos para que los cambios se vean en los menús
}

function updateDropdownName() {
    const dropdownSelection = document.getElementById('dropdownSelectionEdit').value;
    const newName = document.getElementById('dropdownNewName').value;

    if (newName) {
        localStorage.setItem(dropdownSelection, newName);
        document.getElementById(dropdownSelection).innerText = newName;
        alert(`El nombre se ha cambiado a "${newName}"`);
        closeEditDropdownModal();
    }
}

// =============================================================================
// 4. PERSISTENCIA (DOM CONTENT LOADED)
// =============================================================================

document.addEventListener('DOMContentLoaded', () => {
    const dropdownIds = ["dropdownMenuButton1", "dropdownMenuButton2", "dropdownMenuButton3", "dropdownMenuButton4"];
    
    dropdownIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            const savedName = localStorage.getItem(id);
            if (savedName) btn.innerText = savedName;

            const menu = btn.closest('.nav-item').querySelector('.dropdown-menu');
            const storedLinks = JSON.parse(localStorage.getItem(id + '_links')) || [];
            
            menu.innerHTML = ""; 
            storedLinks.forEach(link => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <a class="dropdown-item" href="#" onclick="loadDocument('${link.url}')">${link.name}</a>
                    <button class="btn btn-danger btn-sm ms-2" onclick="deleteLink(this)">Eliminar</button>
                `;
                menu.appendChild(li);
            });
        }
    });
    // --- NUEVA LÓGICA PARA LA VERSIÓN ---
    const versionLabel = document.getElementById('appVersion');
    if (versionLabel) {
        // Usamos un separador para que no se pegue al texto anterior
        versionLabel.innerText = ` | Versión: ${APP_VERSION}`;
            }
});

// =============================================================================
// 5. EXPORTAR E IMPORTAR
// =============================================================================

window.exportData = function() {
    const backup = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        backup[key] = localStorage.getItem(key);
    }
    if (Object.keys(backup).length === 0) return alert("No hay datos");

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "enlaces_gestor.json";
    a.click();
};

window.importData = function(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            localStorage.clear();
            Object.keys(data).forEach(key => localStorage.setItem(key, data[key]));
            const modalElement = document.getElementById('importConfirmModal');
            if (modalElement) {
                const modal = new bootstrap.Modal(modalElement);
                modal.show();
            }
        } catch (err) { alert("Error en el archivo JSON"); }
    };
    reader.readAsText(file);
}

// =============================================================================
// 6. SECCIÓN ASISTENTE IA (MODAL Y CONSULTA)
// =============================================================================

// Función para abrir el modal del HTML (ID: iaModal)
window.abrirModalIA = function() {
    const modalIA = document.getElementById('iaModal');
    if (modalIA) {
        const myModal = new bootstrap.Modal(modalIA);
        myModal.show();
    }
};

// Función para el contexto dinámico
function prepararContextoIA() {
    let textoContexto = "Categorías y enlaces actuales:\n";
    let hayDatos = false;

    for (let i = 1; i <= 4; i++) {
        const btnId = `dropdownMenuButton${i}`;
        const nombreCategoria = localStorage.getItem(btnId) || `Categoría ${i}`;
        const enlaces = JSON.parse(localStorage.getItem(btnId + '_links')) || [];
        
        if (enlaces.length > 0) {
            hayDatos = true;
            textoContexto += `\n[${nombreCategoria}]:\n`;
            
            // EL CAMBIO ESTÁ AQUÍ:
            enlaces.forEach(link => {
                // Primero definimos las etiquetas si existen
                const etiquetas = link.tags ? ` [Etiquetas: ${link.tags}]` : "";
                // Luego construimos la línea completa
                textoContexto += `- ${link.name}${etiquetas} (URL: ${link.url})\n`;
            });
        }
    }
    return hayDatos ? textoContexto : "No hay documentos cargados.";
}

// Función principal para enviar consulta a Gemini 2.5 Flash
window.sendIAQuery = async function() {
    const input = document.getElementById('iaInput');
    const chat = document.getElementById('iaChatWindow');
    const userText = input.value.trim();
    
    if (!userText) return;

    // Mostrar lo que escribe el usuario
    chat.innerHTML += `<div class="text-end text-primary mb-2"><b>Tú:</b> ${userText}</div>`;
    input.value = '';

    const iaMsg = document.createElement('div');
    iaMsg.className = 'text-start text-success mb-2';
    iaMsg.innerHTML = "<b>IA:</b> Pensando...";
    chat.appendChild(iaMsg);
    chat.scrollTop = chat.scrollHeight;

    try {
        const contexto = prepararContextoIA();
        
        // CAMBIO AQUÍ: Usamos gemini-1.5-flash que tiene cuota garantizada
        const url = `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ 
                        text: `Eres un asistente experto en gestión de docuemtos para el Ministerio de Desarrollo Humano. 
       Tu tono debe ser profesional y servicial. 
       Si no conoces el nombre del usuario, no inventes uno.
       Cuando menciones un documento que está en el contexto, proporciona el enlace SIEMPRE en este formato exacto de HTML para que el usuario pueda abrirlo en el visor: 
       <a href="#" onclick="loadDocument('URL_DEL_DOC'); return false;">NOMBRE_DEL_DOC</a> No uses markdown normal, usa esa etiqueta <a> de HTML.

       REGLAS DE ORO:
                        1. Usa el "Contexto actual" para responder. Si algo no está ahí, di que no lo encuentras en el sistema.
                        2. Si el usuario te pregunta quién eres, preséntate como el asistente del Ministerio.
                        3. Sé amable pero profesional. No asumas nombres de usuario a menos que te lo digan.
                        4. Si ves que un documento tiene "tags" o "etiquetas", úsalas para saber si ese doc es relevante.
                        5. SOBRE ESTA APP (Guía de Ayuda): 
                        Esta aplicación es el "Gestor de Documentos v1.1.2", creada para solucionar el desorden de archivos en Drive y centralizar el acceso rápido a la documentación de la oficina.
                        - Propósito: Evitar que los documentos se pierdan. Permite tener a mano los links directos de Drive o Web organizados por categorías.
                        - Visor: Al hacer click en un enlace, el documento se abre en el panel central sin salir de la app.
                        - Gestión: El usuario puede "Agregar enlace" para guardar sus propios documentos de Drive o "Editar" categorías existentes para mejorar su organización como asi también etiquetas, todo desde los botones de la interfaz.
                        - Sincronización: Si el usuario cambia de PC, debe usar "Exportar" para bajar un archivo .json con sus links y luego "Importar" en la nueva máquina para recuperar sus enlaces.
   
       Contexto actual de los documentos disponibles: ${contexto}
                        Pregunta del usuario: ${userText}` 
                    }]
                }]
            })
        });

        const data = await response.json();

        // Si el servidor responde 429 o error
        if (data.error) {
            throw new Error(data.error.message);
        }

        const respuestaTexto = data.candidates[0].content.parts[0].text;
        iaMsg.innerHTML = `<b>IA:</b> ${respuestaTexto}`;

    } catch (error) {
        iaMsg.innerHTML = `<b class="text-danger">IA: Error. Detalle: ${error.message}</b>`;
        console.error("Error completo:", error);
    }
    chat.scrollTop = chat.scrollHeight;
};

