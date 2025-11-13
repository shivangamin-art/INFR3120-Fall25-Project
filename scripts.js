
// ADD A NEW CAR
if (document.getElementById("addCarForm")) {
    document.getElementById("addCarForm").addEventListener("submit", function (e) {
        e.preventDefault();

        let cars = JSON.parse(localStorage.getItem("cars") || "[]");

        const newCar = {
            id: Date.now(), // unique ID
            model: document.getElementById("model").value,
            type: document.getElementById("type").value,
            year: document.getElementById("year").value,
            dailyRate: document.getElementById("dailyRate").value,
            status: document.getElementById("status").value,
            description: document.getElementById("description").value
        };

        cars.push(newCar);
        localStorage.setItem("cars", JSON.stringify(cars));

        alert("Car added successfully!");
        window.location.href = "cars.html";
    });
}


// LOAD CARS INTO TABLE (cars.html)
function loadCars() {
    const tableBody = document.querySelector("#carsTable tbody");
    if (!tableBody) return;

    let cars = JSON.parse(localStorage.getItem("cars") || "[]");
    tableBody.innerHTML = "";

    cars.forEach(car => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${car.model}</td>
            <td>${car.type}</td>
            <td>${car.year}</td>
            <td>$${car.dailyRate}</td>
            <td>${car.status}</td>
            <td>${car.description || ""}</td>
            <td>
                <a href="editcar.html?id=${car.id}">Edit</a> |
                <a href="#" onclick="deleteCar(${car.id})">Delete</a>
            </td>
        `;

        tableBody.appendChild(row);
    });
}


// DELETE CAR
function deleteCar(id) {
    let cars = JSON.parse(localStorage.getItem("cars") || "[]");

    cars = cars.filter(car => Number(car.id) !== Number(id));
    localStorage.setItem("cars", JSON.stringify(cars));

    loadCars(); // refresh table
}


// AUTO-LOAD WHEN ON cars.html
if (document.getElementById("carsTable")) {
    loadCars();
}
