

async function getAll() {
    console.log("getAll function is called");  // Check if function is triggered
    const loader = document.getElementById("loader");
    const tbody = document.getElementById('table-test');
    let read = true;
    const url =
        "https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024.json";

    // Show the loader
    loader.classList.remove("d-none");

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        const json = await response.json();

        // Populate the dropdown with keys from the JSON
        Object.keys(json).forEach((key) => {
            // ***************** 1. Crear una nueva fila *****************
            const row = document.createElement('tr');
            // ***************** 2. Crea datos para cada columna *****************

            //ID
            const id = document.createElement('td');
            id.textContent = key;
            //FECHA
            const timestamp = document.createElement('td');
            timestamp.textContent = json[key].fechaHora;
            //IDM
            const idm = document.createElement('td');
            idm.textContent = json[key].idM;
            //ncontrol
            const ncontrol = document.createElement('td');
            ncontrol.textContent = json[key].nControl;



            /********************************************************************* */
            //ACCIONES
            const acciones = document.createElement('td');
            // ****Grupo de botones****
            const group = document.createElement('div');
            group.className = "btn-group custom-btn-group";
            group.role = "group";
            // Boton ver
            const btnVer = document.createElement('a');
            btnVer.href = `test1.html?key=${key}&status=${read}`;
            btnVer.className = "btn btn-success"
            btnVer.textContent = "Ver";



            //boton borrar
            const btnDelete = document.createElement('button');
            btnDelete.className = "btn btn-danger";
            btnDelete.textContent = "Borrar"
            btnDelete.onclick = async function () {
                if (confirm("¿Estás seguro de que quieres borrar esta evaluación?")) {
                    try {
                        // Send DELETE request to Firebase
                        const deleteUrl = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${key}.json`;
                        const deleteResponse = await fetch(deleteUrl, {
                            method: 'DELETE',
                        });

                        if (deleteResponse.ok) {
                            // Remove the row from the table if deletion is successful
                            row.remove();
                            alert("Evaluación borrada exitosamente.");
                        } else {
                            alert("Error al borrar la evaluación.");
                        }
                    } catch (error) {
                        console.error("Error al intentar borrar:", error);
                        alert("Ocurrió un error al intentar borrar.");
                    }
                }
            };




            // ****AGREGA BOTONES AL GRUPO****
            group.appendChild(btnVer);
            console.log(btnVer);  // Check if the button is being created and has the correct text


            group.appendChild(btnDelete);

            acciones.appendChild(group);

            /********************************************************************* */

            //***************** 3. Agrega cada columna a la fila *****************
            row.appendChild(id);
            row.appendChild(timestamp);
            row.appendChild(idm);
            row.appendChild(ncontrol)
            row.appendChild(acciones);


            //***************** 4. Agrega la fila al cuerpo de la tabla *****************
            tbody.appendChild(row);






        });
    } catch (error) {
        console.error(error.message);
    } finally {
        loader.classList.add("d-none"); // Hide the loader
    }
}



async function create_stars(id) {
    const rating_table = document.getElementById('rating_table');

    const url = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${id}/evaluacion.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        // Clear existing rows (if any)
        rating_table.innerHTML = '';

        // Loop through each rating category (e.g., aireAcondicionado, atenciondelPersonal)
        Object.keys(json).forEach((key) => {
            const ratingValue = parseInt(json[key]);  // Convert rating to a number

            // Create a new row for each rating category
            const row = document.createElement('tr');
            row.classList.add('rating-row');

            // Create a cell for the description (key)
            const descriptionCell = document.createElement('td');
            descriptionCell.textContent = key;  // Category name (e.g., aireAcondicionado)
            row.appendChild(descriptionCell);

            // Create a cell for the rating (stars)
            const ratingCell = document.createElement('td');
            ratingCell.classList.add('star-rating-cell');

            // Create and append stars for the rating
            for (let i = 1; i <= 5; i++) {
                const star = document.createElement('span');
                star.classList.add('fa', 'fa-star', 'star');
                star.setAttribute('data-value', i);

                // Add 'checked' class if the current star is part of the rating
                if (i <= ratingValue) {
                    star.classList.add('checked');
                }

                // Make stars clickable for editing
                star.addEventListener('click', (event) => update_rating(event, key));

                // Append the star to the rating cell
                ratingCell.appendChild(star);
            }

            // Append the rating cell to the row
            row.appendChild(ratingCell);

            // Append the row to the table body
            rating_table.appendChild(row);
        });

    } catch (error) {
        console.error(error.message);
    }
}

let editing = false;  // Flag to check if we are in editing mode
let currentRatings = {};  // Store the current ratings

// Function to enable editing of the star ratings
function enable_editing() {
    editing = true;
    alert('Editing mode enabled');
    document.querySelectorAll('.star').forEach(star => {
        star.classList.add('editable');
    });
}

// Function to save the updated ratings
async function save_ratings(id) {
    const url = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${id}/evaluacion.json`;

    try {
        const response = await fetch(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(currentRatings),
        });

        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        alert('Ratings updated successfully');
        editing = false;
        document.querySelectorAll('.star').forEach(star => {
            star.classList.remove('editable');
        });

    } catch (error) {
        console.error(error.message);
    }
}

// Function to update the rating of a particular category
function update_rating(event, category) {
    if (!editing) return;  // Only allow updating in edit mode

    const newRating = parseInt(event.target.getAttribute('data-value'));

    // Update the class of the stars for the selected category
    const stars = event.target.parentElement.querySelectorAll('.star');
    stars.forEach(star => {
        const starValue = parseInt(star.getAttribute('data-value'));
        if (starValue <= newRating) {
            star.classList.add('checked');
        } else {
            star.classList.remove('checked');
        }
    });

    // Update the current ratings object
    currentRatings[category] = newRating;
}

// Event listener for the Edit button
document.querySelector('.btn-warning').addEventListener('click', () => {
    if (!editing) {
        enable_editing();
    }
});

// Event listener for the Save button
document.querySelector('.btn-success').addEventListener('click', () => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("key");
    if (key) {
        save_ratings(key);
    }
});


function get_current_time() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function get_personal_data(id) {
    const data_container = document.getElementById('output');

    const url = `https://encuesta-servicios-aldo-default-rtdb.firebaseio.com/evaluaciones22024/${id}.json`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }
        const json = await response.json();

        // Container for data with styling
        const card = document.createElement('div');
        card.classList.add('card', 'shadow-sm', 'p-4', 'mb-4');

        // Current Time (from get_current_time function)
        const currentTime = get_current_time(); // Get current time
        const currentTimeElement = document.createElement('h4');
        currentTimeElement.textContent = `Current Time: ${currentTime}`;
        currentTimeElement.classList.add('card-subtitle', 'text-muted');
        card.appendChild(currentTimeElement);

        // ID
        const id_e = document.createElement('h1');
        id_e.textContent = `ID: ${id}`;
        id_e.classList.add('card-title', 'text-primary');
        card.appendChild(id_e);

        // IDM
        const idm = document.createElement('h2');
        idm.textContent = `IDM: ${json["idM"]}`;
        idm.classList.add('card-subtitle', 'text-muted');
        card.appendChild(idm);

        // Fecha y Hora (from Firebase data)
        const timestamp = document.createElement('h3');
        timestamp.textContent = `Fecha y Hora: ${json["fechaHora"]}`;
        timestamp.classList.add('text-secondary');
        card.appendChild(timestamp);

        // Append the card to the data container
        data_container.appendChild(card);

    } catch (error) {
        console.error(error.message);
    }
}





