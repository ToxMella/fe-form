const students = []

document.getElementById('student-form').addEventListener('submit', function(e){
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const lastName = document.getElementById('last-name').value.trim();
    const grade = document.getElementById('grade').value;

    if(grade <1 || grade>7 ||!name || !lastName || isNaN(grade)){
        alert("error al ingresar los datos")
        return
    }
    
});
const tableBody=document.quertSelector("#studentTable tbody") // studentTable es la id definida en el index y tbody es el destino donde debe guardarse
function addStudentToTable(student){
    const row= document.createElement("tr")
    rpw.innerHTML=`
    <td>${student.name}</td>
    <td>${student.lastName}</td>
    <td>${student.grade}</td>
    `;
}




