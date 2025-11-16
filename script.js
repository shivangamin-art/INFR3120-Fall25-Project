// Car Rental Management System
// Complete working version with proper saving/loading

// Initialize default cars
const defaultCars = [
    {
        id: 1,
        model: "Toyota Camry",
        type: "Sedan",
        year: 2023,
        dailyRate: 45,
        status: "Available",
        description: "Comfortable and reliable sedan perfect for daily commuting"
    },
    {
        id: 2,
        model: "Honda CR-V",
        type: "SUV",
        year: 2024,
        dailyRate: 65,
        status: "Available",
        description: "Spacious SUV with excellent safety features for family trips"
    },
    {
        id: 3,
        model: "Ford Mustang",
        type: "Sports Car",
        year: 2023,
        dailyRate: 95,
        status: "Rented",
        description: "Powerful sports car for an exciting driving experience"
    }
];

// Get cars from localStorage or initialize with defaults
function getCars() {
    const storedCars = localStorage.getItem('cars');
    if (storedCars) {
        return JSON.parse(storedCars);
    } else {
        // Save default cars to localStorage
        localStorage.setItem('cars', JSON.stringify(defaultCars));
        return defaultCars;
    }
}

// Save cars to localStorage
function saveCars(cars) {
    localStorage.setItem('cars', JSON.stringify(cars));
    console.log('Cars saved:', cars);
}

// Generate unique ID
function generateId() {
    return Date.now();
}

// Load when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded successfully');
    console.log('Current page:', window.location.pathname);
    console.log('Cars in localStorage:', getCars());
    
    // Initialize based on current page
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('index.html') || currentPage === '/' || currentPage.endsWith('.html') === false) {
        loadHomepageCars();
    } else if (currentPage.includes('cars.html')) {
        loadCarsPage();
    } else if (currentPage.includes('add-car.html')) {
        setupAddCarForm();
    } else if (currentPage.includes('edit-car.html')) {
        setupEditCarForm();
    }
});

// LOAD CARS FOR HOMEPAGE - CARD LAYOUT
function loadHomepageCars() {
    const carsGrid = document.getElementById("carsGrid");
    if (!carsGrid) {
        console.log('carsGrid not found on this page');
        return;
    }

    const cars = getCars();
    carsGrid.innerHTML = "";

    // Show only available cars on homepage
    const availableCars = cars.filter(car => car.status === "Available");
    
    if (availableCars.length === 0) {
        carsGrid.innerHTML = `
            <div class="no-cars-message">
                <h3>No Cars Available</h3>
                <p>All our cars are currently rented or under maintenance.</p>
                <a href="add-car.html" class="btn btn-primary">Add New Car</a>
            </div>
        `;
        return;
    }

    availableCars.forEach(car => {
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
            
            <p class="car-description">${car.description || "No description available"}</p>
            
            <div class="car-actions">
                <a href="edit-car.html?id=${car.id}" class="btn-edit">Edit Car</a>
                <button class="btn-delete" onclick="deleteCar(${car.id})">Delete</button>
            </div>
        `;
        carsGrid.appendChild(carCard);
    });
}

// LOAD CARS FOR CARS PAGE - TABLE LAYOUT
function loadCarsPage() {
    const tableBody = document.querySelector("#carsTable tbody");
    if (!tableBody) {
        console.log('Cars table not found on this page');
        return;
    }

    const cars = getCars();
    tableBody.innerHTML = "";

    if (cars.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No cars available in the fleet</td></tr>';
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
                <a href="edit-car.html?id=${car.id}" class="btn-edit">Edit</a>
                <button class="btn-delete" onclick="deleteCar(${car.id})">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// SETUP ADD CAR FORM
function setupAddCarForm() {
    const form = document.getElementById("addCarForm");
    if (!form) {
        console.log('Add car form not found');
        return;
    }

    form.addEventListener("submit", function(e) {
        e.preventDefault();

        const cars = getCars();

        const newCar = {
            id: generateId(),
            model: document.getElementById("model").value,
            type: document.getElementById("type").value,
            year: parseInt(document.getElementById("year").value),
            dailyRate: parseFloat(document.getElementById("dailyRate").value),
            status: document.getElementById("status").value,
            description: document.getElementById("description").value || "No description provided"
        };

        // Add new car to array
        cars.push(newCar);
        
        // Save to localStorage
        saveCars(cars);

        alert("Car added successfully!");
        window.location.href = "cars.html";
    });
}

// SETUP EDIT CAR FORM
function setupEditCarForm() {
    const form = document.getElementById("editCarForm");
    if (!form) {
        console.log('Edit car form not found');
        return;
    }

    // Get car ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const carId = parseInt(urlParams.get('id'));

    if (!carId) {
        alert('Invalid car ID');
        window.location.href = 'cars.html';
        return;
    }

    const cars = getCars();
    const car = cars.find(c => c.id === carId);

    if (!car) {
        alert('Car not found');
        window.location.href = 'cars.html';
        return;
    }

    // Fill form with car data
    document.getElementById("carId").value = car.id;
    document.getElementById("model").value = car.model;
    document.getElementById("type").value = car.type;
    document.getElementById("year").value = car.year;
    document.getElementById("dailyRate").value = car.dailyRate;
    document.getElementById("status").value = car.status;
    document.getElementById("description").value = car.description || "";

    // Handle form submission
    form.addEventListener("submit", function(e) {
        e.preventDefault();

        // Update car data
        car.model = document.getElementById("model").value;
        car.type = document.getElementById("type").value;
        car.year = parseInt(document.getElementById("year").value);
        car.dailyRate = parseFloat(document.getElementById("dailyRate").value);
        car.status = document.getElementById("status").value;
        car.description = document.getElementById("description").value;

        // Save updated cars
        saveCars(cars);

        alert("Car updated successfully!");
        window.location.href = "cars.html";
    });
}

// DELETE CAR FUNCTION
function deleteCar(carId) {
    if (!confirm("Are you sure you want to delete this car?")) return;

    const cars = getCars();
    const updatedCars = cars.filter(car => car.id !== carId);
    
    saveCars(updatedCars);
    alert("Car deleted successfully!");

    // Refresh the current page
    if (window.location.pathname.includes('cars.html')) {
        loadCarsPage();
    } else if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.endsWith('.html') === false) {
        loadHomepageCars();
    }
}

// Debug function to check localStorage
function debugCars() {
    console.log('Current cars in localStorage:', getCars());
    console.log('Raw localStorage:', localStorage.getItem('cars'));
}

// Make functions available globally
window.deleteCar = deleteCar;
window.debugCars = debugCars;
