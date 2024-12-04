document.addEventListener('DOMContentLoaded', () => {
    const url = 'https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024.json';
    const tbody = document.getElementById('evaluaciones-body');

    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Llenar la tabla
            for (const [id, evaluacion] of Object.entries(data)) {
                const row = document.createElement('tr'); // Crear una nueva fila

                // Crear celdas para los datos de la evaluación
                const idCell = document.createElement('td');
                idCell.textContent = id;

                const fechaCell = document.createElement('td');
                fechaCell.textContent = formatDate(evaluacion.fechaHora); // Formatear la fecha

                const idmCell = document.createElement('td');
                idmCell.textContent = evaluacion.idM;

                const nControlCell = document.createElement('td');
                nControlCell.textContent = evaluacion.nControl;

                // Crear la celda para las acciones
                const accionesCell = document.createElement('td');
                accionesCell.innerHTML = `
                    <a href="../pages/ver_evaluaciones.html?id=${id}" class="btn btn-info btn-sm">Ver</a>
                    <button class="btn btn-warning btn-sm" onclick="editarEvaluacion('${id}')">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="eliminarEvaluacion('${id}', this)">Eliminar</button>
                `;

                // Agregar todas las celdas a la fila
                row.appendChild(idCell);
                row.appendChild(fechaCell);
                row.appendChild(idmCell);
                row.appendChild(nControlCell);
                row.appendChild(accionesCell); // Agregar la celda de acciones

                // Agregar la fila al cuerpo de la tabla
                tbody.appendChild(row);
            }
        })
        .catch(error => {
            console.error('Error al cargar los datos:', error);
        });
});

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id'); // Obtiene el ID de la evaluación de la URL

    if (id) {
        verEvaluacion(id); // Llama a la función para mostrar la evaluación
    }
});


function verEvaluacion(id) {
    const url = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${id}.json`;

    fetch(url)
        .then(response => response.json())
        .then(evaluacion => {
            const detalleBody = document.getElementById('detalle-body');
            detalleBody.innerHTML = ''; // Limpiar contenido anterior

            // Mostrar información del registro
            const infoDiv = document.getElementById('info-registro');
            infoDiv.innerHTML = `<h3>Información del Registro</h3>
                                 <p><strong>ID:</strong> <span id="info-id">${id}</span></p>
                                 <p><strong>Fecha y Hora:</strong> <span id="info-fecha-hora">${formatDate(evaluacion.fechaHora)}</span></p> <!-- Formatear la fecha -->
                                 <p><strong>ID de Módulo:</strong> <span id="info-id-modulo">${evaluacion.idM}</span></p>
                                 <p><strong>Número de Control:</strong> <span id="info-n-control">${evaluacion.nControl}</span></p>`;

            // Crear filas para cada evaluación
            for (const [key, value] of Object.entries(evaluacion.evaluacion)) {
                const row = document.createElement('tr');
                const cellKey = document.createElement('td');
                const cellValue = document.createElement('td');

                // Formatear el nombre del campo
                cellKey.innerHTML = `<strong>${formatFieldName(key)}</strong>`; // Usar negrita para el nombre del campo
                cellValue.innerHTML = getStarInputs(key, value); // Mostrar estrellas como inputs

                row.appendChild(cellKey);
                row.appendChild(cellValue);
                detalleBody.appendChild(row);
            }

            // Agregar botones de editar y eliminar
            const btnDiv = document.createElement('div');
            btnDiv.classList.add('mb-5', 'mt-5');
            btnDiv.innerHTML = `
                <button id="btn-editar" class="btn btn-primary" onclick="editarEvaluacion('${id}')">Editar</button>
                <button id="btn-eliminar" class="btn btn-danger" onclick="eliminarEvaluacion('${id}')">Eliminar</button>
            `;
            infoDiv.appendChild(btnDiv);

            // Mostrar el contenedor con los detalles
            document.getElementById('evaluacion-detalle').style.display = 'block';
        })
        .catch(error => {
            console.error('Error al cargar los detalles de la evaluación:', error);
        });
}

function getStarInputs(fieldName, currentRating) {
    let starInputs = '';
    for (let i = 5; i >= 1; i--) {
        starInputs += `
            <input type="radio" id="${fieldName}-${i}" name="${fieldName}" value="${i}" ${currentRating == i ? 'checked' : ''}>
            <label for="${fieldName}-${i}" class="star-rating">
                <i class="fas fa-star"></i>
            </label>
        `;
    }
    return `<div class="rating-wrapper">${starInputs}</div>`;
}

// Función para formatear el nombre del campo
function formatFieldName(fieldName) {
    // Reemplazar guiones bajos por espacios y usar expresiones regulares para insertar espacios antes de letras mayúsculas
    return fieldName
        .replace(/_/g, ' ') // Reemplazar guiones bajos por espacios
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Insertar espacio entre letras minúsculas y mayúsculas
        .replace(/\b\w/g, char => char.toUpperCase()) // Capitalizar la primera letra de cada palabra
        .trim(); // Eliminar espacios en blanco al principio y al final
}
function formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('es-ES', { // Formato de fecha en español
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}

function editarEvaluacion(id) {
    const infoDiv = document.getElementById('info-registro');
    const fields = {
        id: document.getElementById('info-id').innerText,
        idModulo: document.getElementById('info-id-modulo').innerText,
        nControl: document.getElementById('info-n-control').innerText,
        fechaHora: new Date().toISOString() // Timestamp actual
    };

    // Formatear la fecha y hora para el campo datetime-local
    const date = new Date(fields.fechaHora);
    const formattedFechaHora = date.toISOString().slice(0, 16); // Formato YYYY-MM-DDTHH:MM

    infoDiv.innerHTML = `
        <h3>Editar Información del Registro</h3>
        <p><strong>ID:</strong> <input type="text" id="edit-id" value="${fields.id}" disabled /></p>
        <p><strong>ID de Módulo:</strong> <input type="text" id="edit-id-modulo" value="${fields.idModulo}" /></p>
        <p><strong>Número de Control:</strong> <input type="text" id="edit-n-control" value="${fields.nControl}" /></p>
        <p><strong>Fecha y Hora:</strong> <input type="datetime-local" id="edit-fecha-hora" value="${formattedFechaHora}" disabled /></p>
    `;

    const detalleBody = document.getElementById('detalle-body');
    detalleBody.innerHTML = ''; // Limpiar contenido anterior

    // Crear filas para cada evaluación
    const url = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${id}.json`;
    fetch(url)
        .then(response => response.json())
        .then(evaluacion => {
            for (const [key, value] of Object.entries(evaluacion.evaluacion)) {
                const row = document.createElement('tr');
                const cellKey = document.createElement('td');
                const cellValue = document.createElement('td');

                // Formatear el nombre del campo
                cellKey.innerHTML = `<strong>${formatFieldName(key)}</strong>`; // Usar negrita para el nombre del campo
                cellValue.innerHTML = getStarInputs(key, value); // Mostrar estrellas como inputs

                row.appendChild(cellKey);
                row.appendChild(cellValue);
                detalleBody.appendChild(row);
            }

            // Agregar botón de guardar cambios
            const btnDiv = document.createElement('div');
            btnDiv.classList.add('mb-5', 'mt-5');
            btnDiv.innerHTML = `
                <button id="btn-guardar" class="btn btn-primary" onclick="guardarEvaluacion('${id}')">Guardar Cambios</button>
            `;
            infoDiv.appendChild(btnDiv);
        })
        .catch(error => {
            console.error('Error al cargar los detalles de la evaluación:', error);
        });
}

function guardarEvaluacion(id) {
    const fields = {
        id: document.getElementById('edit-id').value, // Este campo está deshabilitado, pero se mantiene para referencia
        idModulo: document.getElementById('edit-id-modulo').value,
        nControl: document.getElementById('edit-n-control').value,
        fechaHora: new Date().toISOString() // Actualiza la fecha y hora automáticamente
    };

    const evaluacion = {};
    const detalleBody = document.getElementById('detalle-body');
    for (const row of detalleBody.children) {
        const key = row.children[0].innerText.toLowerCase().replace(/\s+/g, '_');
        const value = row.children[1].querySelector('input:checked').value;
        evaluacion[key] = value;
    }

    const url = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${id}.json`;

    // Actualizar el registro existente
    fetch(url, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: fields.id, // Mantener el ID original
            idM: fields.idModulo,
            nControl: fields.nControl,
            fechaHora: fields.fechaHora,
            evaluacion: evaluacion
        })
    })
        .then(response => response.json())
        .then(data => {
            console.log('Evaluación actualizada con éxito:', data);
            // Recargar la página para mostrar los cambios
            window.location.reload();
        })
        .catch(error => {
            console.error('Error al guardar la evaluación:', error);
        });
}




function eliminarEvaluacion(id, button) {
    const confirmacion = confirm(`¿Estás seguro de que deseas eliminar la evaluación con ID: ${id}?`);
    if (!confirmacion) {
        return;
    }

    const deleteUrl = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${id}.json`;

    fetch(deleteUrl, { method: 'DELETE' })
        .then(response => {
            if (response.ok) {
                alert(`La evaluación con ID ${id} ha sido eliminada exitosamente.`);
                // Eliminar la fila de la tabla usando el botón
                const row = button.closest('tr'); // Obtener la fila más cercana al botón
                row.remove();
            } else {
                throw new Error('Error al eliminar la evaluación');
            }
        })
        .catch(error => {
            console.error('Error al eliminar la evaluación:', error);
            alert('Hubo un problema al intentar eliminar la evaluación.');
        });
}