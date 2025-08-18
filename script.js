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
        const linkItem = button.parentElement; // <li>
        const linkName = linkItem.querySelector('a').innerText;
        const dropdownMenu = linkItem.closest('.dropdown-menu');
        const dropdownButton = dropdownMenu.closest('.nav-item').querySelector('.dropdown-toggle');
        const dropdownId = dropdownButton.id;

        // Eliminar del DOM
        linkItem.remove();

        // Eliminar del localStorage
        let storedLinks = JSON.parse(localStorage.getItem(dropdownId + '_links')) || [];
        storedLinks = storedLinks.filter(link => link.name !== linkName);
        localStorage.setItem(dropdownId + '_links', JSON.stringify(storedLinks));

        alert("¡Enlace eliminado correctamente!");
    }
}

// Función para mostrar el modal de agregar enlace
function showAddLinkModal() {
    const dropdownOptions = {
        dropdownMenuButton1: 'Correos OWA',
        dropdownMenuButton2: 'Enlaces docs RUNNA',
        dropdownMenuButton3: 'CRM',
        dropdownMenuButton4: 'Reportero Runna'
    };

    let selectOptions = '';
    Object.keys(dropdownOptions).forEach(id => {
        const name = localStorage.getItem(id) || dropdownOptions[id];
        selectOptions += `<option value="${id}">${name}</option>`;
    });

    const modalContent = `
        <div id="addLinkModal" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; background: white; border: 1px solid #ccc; border-radius: 5px; width: 300px; position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
            <label for="dropdownSelection">Selecciona el desplegable:</label>
            <select id="dropdownSelection">
                ${selectOptions}
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
        // Encontrar el botón del desplegable
        const dropdownButton = document.getElementById(dropdownSelection);
        // Buscar el <li> contenedor
        const parentLi = dropdownButton.closest('.nav-item');
        // Buscar el <ul> con los enlaces
        const dropdownMenu = parentLi.querySelector('.dropdown-menu');

        if (dropdownMenu) {
            const newLink = document.createElement('li');
            newLink.innerHTML = `
                <a class="dropdown-item" href="#" onclick="loadDocument('${linkURL}')">${linkName}</a>
                <button class="btn btn-danger btn-sm ms-2" onclick="deleteLink(this)">Eliminar</button>
            `;
            dropdownMenu.appendChild(newLink);

            // Guardar en localStorage
            const storedLinks = JSON.parse(localStorage.getItem(dropdownSelection + '_links')) || [];
            storedLinks.push({ name: linkName, url: linkURL });
            localStorage.setItem(dropdownSelection + '_links', JSON.stringify(storedLinks));

            alert("¡Enlace agregado correctamente!");
            closeModal();
        } else {
            alert("No se pudo encontrar el menú del desplegable.");
        }
    } else {
        alert("Por favor, completa todos los campos.");
    }
}

// Función para mostrar el modal de edición
function showEditDropdownModal() {
    const dropdownOptions = {
        dropdownMenuButton1: 'Correos OWA',
        dropdownMenuButton2: 'Enlaces docs RUNNA',
        dropdownMenuButton3: 'CRM',
        dropdownMenuButton4: 'Reportero Runna'
    };

    let selectOptions = '';
    Object.keys(dropdownOptions).forEach(id => {
        const name = localStorage.getItem(id) || dropdownOptions[id];
        selectOptions += `<option value="${id}">${name}</option>`;
    });

    const modalContent = `
        <div id="editDropdownModal" style="display: flex; flex-direction: column; gap: 10px; padding: 20px; background: white; border: 1px solid #ccc; border-radius: 5px; width: 300px; position: fixed; top: 25%; left: 50%; transform: translate(-50%, -50%); z-index: 1000;">
            <label for="dropdownSelection">Selecciona el desplegable:</label>
            <select id="dropdownSelection">
                ${selectOptions}
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
         // 🔥 NUEVO: restaurar enlaces guardados
        const storedLinks = JSON.parse(localStorage.getItem(id + '_links')) || [];
        const dropdownButton = document.getElementById(id);
        const parentLi = dropdownButton.closest('.nav-item');
        const dropdownMenu = parentLi.querySelector('.dropdown-menu');

        storedLinks.forEach(link => {
            const newLink = document.createElement('li');
            newLink.innerHTML = `
                <a class="dropdown-item" href="#" onclick="loadDocument('${link.url}')">${link.name}</a>
                <button class="btn btn-danger btn-sm ms-2" onclick="deleteLink(this)">Eliminar</button>
            `;
            dropdownMenu.appendChild(newLink);
        });

    });
});