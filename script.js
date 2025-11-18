// Car Rental System with MongoDB
const API_BASE_URL = 'http://localhost:5000/api';

// API Service
const carService = {
    async getAllCars() {
        const response = await fetch(`${API_BASE_URL}/cars`);
        if (!response.ok) throw new Error('Failed to load cars');
        return await response.json();
    },

    async getAvailableCars() {
        const response = await fetch(`${API_BASE_URL}/cars/available`);
        if (!response.ok) throw new Error('Failed to load available cars');
        return await response.json();
    },

    async getCarById(id) {
        const response = await fetch(`${API_BASE_URL}/cars/${id}`);
        if (!response.ok) throw new Error('Failed to load car');
        return await response.json();
    },

    async createCar(carData) {
        const response = await fetch(`${API_BASE_URL}/cars`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });
        if (!response.ok) throw new Error('Failed to create car');
        return await response.json();
    },

    async updateCar(id, carData) {
        const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(carData)
        });
        if (!response.ok) throw new Error('Failed to update car');
        return await response.json();
    },

    async deleteCar(id) {
        const response = await fetch(`${API_BASE_URL}/cars/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete car');
        return await response.json();
    }
};

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    const page = window.location.pathname;
    
    if (page.includes('index.html') || page === '/') {
        loadHomepageCars();
    } else if (page.includes('cars.html')) {
        loadCarsPage();
    } else if (page.includes('add-car.html')) {
        setupAddCarForm();
    } else if (page.includes('edit-car.html')) {
        setupEditCarForm();
    }
});

// Homepage - Card Layout
async function loadHomepageCars() {
    const carsGrid = document.getElementById("carsGrid");
    if (!carsGrid) return;

    try {
        const cars = await carService.getAvailableCars();
        carsGrid.innerHTML = "";

        if (cars.length === 0) {
            carsGrid.innerHTML = `
                <div class="no-cars-message">
                    <h3>No Cars Available</h3>
                    <a href="add-car.html" class="btn btn-primary">Add New Car</a>
                </div>
            `;
            return;
        }

        cars.forEach(car => {
            const carCard = document.createElement("div");
            carCard.className = "car-card";
            carCard.innerHTML = `
                <div class="car-header">
                    <h3 class="car-model">${car.model}</h3>
                    <span class="car-type">${car.type}</span>
                </div>
                <div class="car-details">
                    <div class="car-detail">
                        <span class="detail-label">Year:</span>
                        <span class="detail-value">${car.year}</span>
                    </div>
                    <div class="car-detail">
                        <span class="detail-label">Status:</span>
                        <span class="detail-value status-${car.status.toLowerCase()}">${car.status}</span>
                    </div>
                </div>
                <div class="car-price">$${car.dailyRate}<small>/day</small></div>
                <p class="car-description">${car.description || "No description"}</p>
                <div class="car-actions">
                    <a href="edit-car.html?id=${car._id}" class="btn-edit">Edit</a>
                    <button class="btn-delete" onclick="deleteCar('${car._id}')">Delete</button>
                </div>
            `;
            carsGrid.appendChild(carCard);
        });
    } catch (error) {
        carsGrid.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Cars</h3>
                <button onclick="loadHomepageCars()" class="btn btn-primary">Try Again</button>
            </div>
        `;
    }
}

// Cars Page - Table Layout
async function loadCarsPage() {
    const tableBody = document.querySelector("#carsTable tbody");
    if (!tableBody) return;

    try {
        const cars = await carService.getAllCars();
        tableBody.innerHTML = "";

        if (cars.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No cars available</td></tr>';
            return;
        }

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
                    <a href="edit-car.html?id=${car._id}" class="btn-edit">Edit</a>
                    <button class="btn-delete" onclick="deleteCar('${car._id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Error loading cars</td></tr>';
    }
}

// Add Car Form
function setupAddCarForm() {
    const form = document.getElementById("addCarForm");
    if (!form) return;

    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Adding...';

        try {
            const newCar = {
                model: document.getElementById("model").value,
                type: document.getElementById("type").value,
                year: parseInt(document.getElementById("year").value),
                dailyRate: parseFloat(document.getElementById("dailyRate").value),
                status: document.getElementById("status").value,
                description: document.getElementById("description").value || ""
            };

            await carService.createCar(newCar);
            alert("Car added successfully!");
            window.location.href = "cars.html";
        } catch (error) {
            alert("Error adding car");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Add Car';
        }
    });
}

// Edit Car Form
async function setupEditCarForm() {
    const form = document.getElementById("editCarForm");
    if (!form) return;

    const urlParams = new URLSearchParams(window.location.search);
    const carId = urlParams.get('id');

    if (!carId) {
        alert('Invalid car ID');
        window.location.href = 'cars.html';
        return;
    }

    try {
        const car = await carService.getCarById(carId);
        
        document.getElementById("carId").value = car._id;
        document.getElementById("model").value = car.model;
        document.getElementById("type").value = car.type;
        document.getElementById("year").value = car.year;
        document.getElementById("dailyRate").value = car.dailyRate;
        document.getElementById("status").value = car.status;
        document.getElementById("description").value = car.description || "";

        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const submitBtn = form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Updating...';

            try {
                const updatedCar = {
                    model: document.getElementById("model").value,
                    type: document.getElementById("type").value,
                    year: parseInt(document.getElementById("year").value),
                    dailyRate: parseFloat(document.getElementById("dailyRate").value),
                    status: document.getElementById("status").value,
                    description: document.getElementById("description").value
                };

                await carService.updateCar(carId, updatedCar);
                alert("Car updated successfully!");
                window.location.href = "cars.html";
            } catch (error) {
                alert("Error updating car");
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Update Car';
            }
        });
    } catch (error) {
        alert("Error loading car");
        window.location.href = 'cars.html';
    }
}

// Delete Car
async function deleteCar(carId) {
    if (!confirm("Delete this car?")) return;

    try {
        await carService.deleteCar(carId);
        alert("Car deleted!");
        
        if (window.location.pathname.includes('cars.html')) {
            loadCarsPage();
        } else {
            loadHomepageCars();
        }
    } catch (error) {
        alert("Error deleting car");
    }
}

// Global functions
window.deleteCar = deleteCar;
window.loadHomepageCars = loadHomepageCars;
window.loadCarsPage = loadCarsPage;
