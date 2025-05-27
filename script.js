// Variables globales para mantener el seguimiento de las notas y estudiantes
let totalGrades = 0;
let studentCount = 0;
let gradeChart = null;

// Función para validar el formulario antes de agregar un estudiante
function validateForm() {
    let isValid = true;
    const name = document.getElementById("name").value;
    const lastName = document.getElementById("lastName").value;
    const grade = document.getElementById("grade").value;

    if (!name) {
        document.getElementById("nameError").textContent = "Por favor, complete el campo 'Nombre'";
        isValid = false;
    } else {
        document.getElementById("nameError").textContent = "";
    }

    if (!lastName) {
        document.getElementById("lastNameError").textContent = "Por favor, complete el campo 'Apellido'";
        isValid = false;
    } else {
        document.getElementById("lastNameError").textContent = "";
    }

    if (!grade) {
        document.getElementById("gradeError").textContent = "Por favor, complete el campo 'Nota'";
        isValid = false;
    } else {
        document.getElementById("gradeError").textContent = "";
    }

    return isValid;
}

// Actualiza todas las estadísticas del curso (promedios, aprobados, gráfico, etc.)
function updateStatistics() {
    const table = document.getElementById("StudentTable");
    const rows = table.getElementsByTagName("tbody")[0].getElementsByTagName("tr");
    const grades = [];
    let passCount = 0;
    let failCount = 0;

    for (let row of rows) {
        const grade = parseFloat(row.cells[2].textContent);
        grades.push(grade);
        if (grade >= 4.0) {
            passCount++;
        } else {
            failCount++;
        }
    }

    if (grades.length > 0) {
        const highest = Math.max(...grades);
        const lowest = Math.min(...grades);
        document.getElementById("highestGrade").textContent = highest.toFixed(1);
        document.getElementById("lowestGrade").textContent = lowest.toFixed(1);
    } else {
        document.getElementById("highestGrade").textContent = "No disponible";
        document.getElementById("lowestGrade").textContent = "No disponible";
    }

    document.getElementById("totalStudents").textContent = studentCount;
    
    const passPercentage = studentCount > 0 ? ((passCount / studentCount) * 100).toFixed(1) : 0;
    const failPercentage = studentCount > 0 ? ((failCount / studentCount) * 100).toFixed(1) : 0;
    
    document.getElementById("passPercentage").textContent = `${passPercentage}%`;
    document.getElementById("failPercentage").textContent = `${failPercentage}%`;

    updateChart(grades);
}

// Función para actualizar el gráfico de distribución de notas
function updateChart(grades) {
    // Objeto para agrupar las notas en rangos
    const gradeRanges = {
        '1.0-1.9': 0,
        '2.0-2.9': 0,
        '3.0-3.9': 0,
        '4.0-4.9': 0,
        '5.0-5.9': 0,
        '6.0-7.0': 0
    };

    grades.forEach(grade => {
        if (grade < 2.0) gradeRanges['1.0-1.9']++;
        else if (grade < 3.0) gradeRanges['2.0-2.9']++;
        else if (grade < 4.0) gradeRanges['3.0-3.9']++;
        else if (grade < 5.0) gradeRanges['4.0-4.9']++;
        else if (grade < 6.0) gradeRanges['5.0-5.9']++;
        else gradeRanges['6.0-7.0']++;
    });

    const ctx = document.getElementById('gradeDistribution').getContext('2d');
    
    if (gradeChart) {
        gradeChart.destroy();
    }

    gradeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(gradeRanges),
            datasets: [{
                label: 'Distribución de Notas',
                data: Object.values(gradeRanges),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(255, 159, 64, 0.5)',
                    'rgba(255, 205, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(153, 102, 255, 0.5)'
                ],
                borderColor: [
                    'rgb(255, 99, 132)',
                    'rgb(255, 159, 64)',
                    'rgb(255, 205, 86)',
                    'rgb(75, 192, 192)',
                    'rgb(54, 162, 235)',
                    'rgb(153, 102, 255)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Determina si un estudiante está aprobado (>=4.0) o reprobado y retorna el HTML con el estilo correspondiente
function getStatusHTML(grade) {
    const status = grade >= 4.0 ? 'Aprobado' : 'Reprobado';
    const statusClass = grade >= 4.0 ? 'status-approved' : 'status-failed';
    return `<span class="${statusClass}">${status}</span>`;
}

// Agrega los botones de editar (✏️) y eliminar (❌) a una fila
function addActionButtons(row) {
    const actionsCell = row.cells[4];
    actionsCell.innerHTML = '';

    const editButton = document.createElement("button");
    editButton.textContent = "✏️";
    editButton.style.marginRight = "5px";
    editButton.addEventListener("click", function() {
        const name = row.cells[0].textContent;
        const lastName = row.cells[1].textContent;
        const grade = parseFloat(row.cells[2].textContent);
        editRow(row, name, lastName, grade);
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "❌";
    deleteButton.addEventListener("click", function() {
        if (confirm("¿Estás seguro de que deseas eliminar este estudiante?")) {
            const gradeToRemove = parseFloat(row.cells[2].textContent);
            totalGrades -= gradeToRemove;
            studentCount--;
            
            if (studentCount > 0) {
                const newAverage = (totalGrades / studentCount).toFixed(2);
                document.getElementById("promedioCurso").textContent = `Promedio general del curso: ${newAverage}`;
            } else {
                document.getElementById("promedioCurso").textContent = "Promedio general del curso: No disponible";
            }
            
            row.parentNode.removeChild(row);
            updateStatistics();
        }
    });

    actionsCell.appendChild(editButton);
    actionsCell.appendChild(deleteButton);
}

// Función para manejar la edición de una fila, reemplaza el contenido con inputs editables
function editRow(row, currentName, currentLastName, currentGrade) {
    const cells = row.cells;
    // Guardamos la nota anterior para actualizar el promedio correctamente
    const oldGrade = currentGrade;
    
    cells[0].innerHTML = `<input type="text" value="${currentName}" class="edit-input">`;
    cells[1].innerHTML = `<input type="text" value="${currentLastName}" class="edit-input">`;
    cells[2].innerHTML = `<input type="number" value="${currentGrade}" step="0.1" min="1" max="7" class="edit-input">`;
    
    const actionsCell = cells[4];
    actionsCell.innerHTML = '';
    
    const saveButton = document.createElement("button");
    saveButton.textContent = "💾";
    saveButton.style.marginRight = "5px";
    
    const cancelButton = document.createElement("button");
    cancelButton.textContent = "↩️";
    
    actionsCell.appendChild(saveButton);
    actionsCell.appendChild(cancelButton);
    
    saveButton.addEventListener("click", function() {
        const newName = cells[0].querySelector("input").value.trim();
        const newLastName = cells[1].querySelector("input").value.trim();
        const newGrade = parseFloat(cells[2].querySelector("input").value);
        
        if (!newName || !newLastName || isNaN(newGrade) || newGrade < 1 || newGrade > 7) {
            alert("Por favor, ingrese datos válidos");
            return;
        }
        
        totalGrades = totalGrades - oldGrade + newGrade;
        const newAverage = (totalGrades / studentCount).toFixed(2);
        document.getElementById("promedioCurso").textContent = `Promedio general del curso: ${newAverage}`;
        
        cells[0].textContent = newName;
        cells[1].textContent = newLastName;
        cells[2].textContent = newGrade;
        updateStatus(cells[3], newGrade);
        
        addActionButtons(row);
        updateStatistics();
    });
    
    cancelButton.addEventListener("click", function() {
        cells[0].textContent = currentName;
        cells[1].textContent = currentLastName;
        cells[2].textContent = currentGrade;
        updateStatus(cells[3], currentGrade);
        
        addActionButtons(row);
    });
}

// Event listener principal para el formulario de agregar estudiantes
document.getElementById("StudentForm").addEventListener("submit", function (event) {
    event.preventDefault();

    // Validar el formulario antes de procesar
    if (!validateForm()) {
        return;
    }

    // Obtener y procesar los datos del nuevo estudiante
    const name = document.getElementById("name").value;
    const lastName = document.getElementById("lastName").value;
    const grade = parseFloat(document.getElementById("grade").value);

    const table = document.getElementById("StudentTable").querySelector("tbody");
    const newRow = table.insertRow();

    const nameCell = newRow.insertCell();
    nameCell.textContent = name;

    const lastNameCell = newRow.insertCell();
    lastNameCell.textContent = lastName;

    const gradeCell = newRow.insertCell();
    gradeCell.textContent = grade;

    const statusCell = newRow.insertCell();
    updateStatus(statusCell, grade);

    const actionsCell = newRow.insertCell();
    addActionButtons(newRow);

    totalGrades += grade;
    studentCount++;
    const average = (totalGrades / studentCount).toFixed(2);
    document.getElementById("promedioCurso").textContent = `Promedio general del curso: ${average}`;

    document.getElementById("StudentForm").reset();
    updateStatistics();
}); 