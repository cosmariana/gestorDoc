//Función que carga documentos en el iframe
function loadDocument(url) {
    document.getElementById('documentViewer').src = url;
}

// Función para cargar el documento en el iframe
function loadDocument(url) {
    document.getElementById('documentViewer').src = url;
}

// Función para eliminar un enlace
function deleteLink(button) {
    const confirmDelete = confirm("¿Estás seguro de que deseas eliminar este enlace?");
    if (confirmDelete) {
        const linkItem = button.parentElement; // Obtén el elemento <li> del enlace
        linkItem.remove(); // Elimina el enlace del DOM
        alert("¡Enlace eliminado correctamente!");
    }
}

// Función para mostrar el modal de agregar enlace
function showAddLinkModal() {
    const modalContent = `
        <div id="addLinkModal" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; background: white; border: 1px solid #ccc; border-radius: 5px; width: 300px; position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
            <label for="dropdownSelection">Selecciona el desplegable:</label>
            <select id="dropdownSelection">
                <option value="dropdownMenuButton1">Correos OWA</option>
                <option value="dropdownMenuButton2">Enlaces docs RUNNA</option>
                <option value="dropdownMenuButton3">CRM</option>
                <option value="dropdownMenuButton4">Reportero Runna</option>
            </select>
            <label for="linkName">Nombre del enlace:</label>
            <input type="text" id="linkName" placeholder="Ej: Manual de Usuario">
            <label for="linkURL">URL del enlace:</label>
            <input type="text" id="linkURL" placeholder="Ej: https://ejemplo.com">
            <button id="Agregar" onclick="addLink()">Guardar</button>
            <button id="Cancelar" onclick="closeModal()">Cancelar</button>
        </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

// Función para cerrar el modal de agregar enlace
function closeModal() {
    const modal = document.getElementById('addLinkModal');
    if (modal) modal.remove();
}

// Función para agregar un nuevo enlace
function addLink() {
    const dropdownSelection = document.getElementById('dropdownSelection').value;
    const linkName = document.getElementById('linkName').value;
    const linkURL = document.getElementById('linkURL').value;

    if (linkName && linkURL) {
        const selectedList = document.getElementById(dropdownSelection);
        const newLink = document.createElement('li');
        newLink.innerHTML = `
            <a class="dropdown-item" href="#" onclick="loadDocument('${linkURL}')">${linkName}</a>
            <button class="btn btn-danger btn-sm ms-2" onclick="deleteLink(this)">Eliminar</button>
        `;
        selectedList.appendChild(newLink);

        alert("¡Enlace agregado correctamente!");
        closeModal();
    } else {
        alert("Por favor, completa todos los campos.");
    }
}

// Función para mostrar el modal de edición
function showEditDropdownModal() {
    const modalContent = `
        <div id="editDropdownModal" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; background: white; border: 1px solid #ccc; border-radius: 5px; width: 300px; position: fixed; top: 25%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
            <label for="dropdownSelection">Selecciona el desplegable:</label>
            <select id="dropdownSelection">
                <option value="dropdownMenuButton1">Correos OWA</option>
                <option value="dropdownMenuButton2">Enlaces docs RUNNA</option>
                <option value="dropdownMenuButton3">CRM</option>
                <option value="dropdownMenuButton4">Reportero Runna</option>
            </select>
            <label for="dropdownNewName">Nuevo nombre:</label>
            <input type="text" id="dropdownNewName" placeholder="Ej: Nuevo nombre">
            <button id="Guardar" onclick="updateDropdownName()">Guardar</button>
            <button id="Cancelar" onclick="closeEditDropdownModal()">Cancelar</button>
        </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = modalContent;
    document.body.appendChild(modal);
}

// Función para cerrar el modal de edición
function closeEditDropdownModal() {
    const modal = document.getElementById('editDropdownModal');
    if (modal) modal.remove();
}

// Función para actualizar el nombre del desplegable
function updateDropdownName() {
    const dropdownSelection = document.getElementById('dropdownSelection').value;
    const newName = document.getElementById('dropdownNewName').value;

    if (newName) {
        localStorage.setItem(dropdownSelection, newName);
        document.getElementById(dropdownSelection).innerText = newName;

        alert(`El nombre del desplegable se ha cambiado a "${newName}"`);
        closeEditDropdownModal();
    } else {
        alert("Por favor, ingresa un nuevo nombre para el desplegable.");
    }
}

// Inicializar nombres al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    const dropdownOptions = {
        dropdownMenuButton1: 'Correos OWA',
        dropdownMenuButton2: 'Enlaces docs RUNNA',
        dropdownMenuButton3: 'CRM',
        dropdownMenuButton4: 'Reportero Runna'
    };

    Object.keys(dropdownOptions).forEach(id => {
        const savedName = localStorage.getItem(id) || dropdownOptions[id];
        document.getElementById(id).innerText = savedName;
    });
});