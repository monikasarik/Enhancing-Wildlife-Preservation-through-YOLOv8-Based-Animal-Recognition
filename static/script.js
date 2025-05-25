let hasDetectedOnce = false;

document.getElementById("detectButton").addEventListener("click", uploadImage);

function uploadImage() {
    const input = document.getElementById("imageInput");
    const spinner = document.getElementById("spinner");
    const resultDiv = document.getElementById("result");
    const factsBox = document.getElementById("factsBox");
    const animalFacts = document.getElementById("animalFacts");
    const outputImage = document.getElementById("outputImage");
    const mainContainer = document.getElementById("mainContainer");
    const rightPanel = document.getElementById("rightPanel");
    const leftPanel = document.getElementById("leftPanel");
    const alertBanner = document.getElementById("alertBanner");

    if (input.files.length === 0) {
        alert("Please select an image first.");
        return;
    }

    const file = input.files[0];
    const formData = new FormData();
    formData.append("file", file);

    spinner.classList.remove("hidden");
    outputImage.classList.add("hidden");
    factsBox.classList.add("hidden");
    resultDiv.innerHTML = "";

    fetch("/predict", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        spinner.classList.add("hidden");

        if (data.animals && data.animals.length > 0) {
            if (!hasDetectedOnce) hasDetectedOnce = true;

            mainContainer.classList.add("move-left");
            rightPanel.classList.remove("hidden");
            leftPanel.classList.add("detected");

            resultDiv.innerHTML = "<h3>Detected Animals:</h3>";
            animalFacts.innerHTML = "";

            const uniqueAnimals = new Set();
            let humanDetected = false;

            data.animals.forEach(animal => {
                const name = animal.name;
                resultDiv.innerHTML += `<p><strong>${name}</strong> - ${(animal.confidence * 100).toFixed(2)}%</p>`;
                if (name.toLowerCase() === "human") humanDetected = true;
                if (!uniqueAnimals.has(name)) {
                    uniqueAnimals.add(name);
                    fetchWikipediaSummary(name);
                }
            });

            if (humanDetected) {
                alertBanner.classList.remove("hidden");
                alertBanner.classList.add("show");
                setTimeout(() => {
                    alertBanner.classList.remove("show");
                    alertBanner.classList.add("hidden");
                }, 5000);
            }

            outputImage.src = data.image_url + "?t=" + new Date().getTime();
            outputImage.classList.remove("hidden");
            factsBox.classList.remove("hidden");
        } else {
            resultDiv.innerHTML = "<p>No animals detected.</p>";
        }
    })
    .catch(error => {
        spinner.classList.add("hidden");
        console.error("Error:", error);
        alert("Something went wrong. Check the console for details.");
    });
}

function fetchWikipediaSummary(animalName) {
    const apiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(animalName)}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const fact = data.extract;
            document.getElementById("animalFacts").innerHTML += `<li><strong>${animalName}:</strong> ${fact}</li>`;
        })
        .catch(error => console.error("Error fetching Wikipedia summary:", error));
}

// Dropdown toggle
function toggleDropdown() {
    const dropdown = document.getElementById("dropdownMenu");
    dropdown.classList.toggle("hidden");
}

// Show login form
function showLoginForm() {
    closeForms();
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("overlay").classList.remove("hidden");
}

// Show signup form
function showSignupForm() {
    closeForms();
    document.getElementById("signupForm").classList.remove("hidden");
    document.getElementById("overlay").classList.remove("hidden");
}

// Close all forms
function closeForms() {
    document.getElementById("loginForm")?.classList.add("hidden");
    document.getElementById("signupForm")?.classList.add("hidden");
    document.getElementById("overlay")?.classList.add("hidden");
}

// Submit login to Flask
async function submitLogin() {
    const username = document.getElementById("loginUsername").value;
    const password = document.getElementById("loginPassword").value;

    if (!username || !password) {
        alert("Please fill in both fields.");
        return;
    }

    const response = await fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, password })
    });

    const result = await response.json();
    if (result.success) {
        window.location.href = "/dashboard";  // Redirect without alert
    } else {
        alert(result.message);  // Only show alert if login fails
    }
}

// Submit signup to Flask
async function submitSignup() {
    const username = document.getElementById("signupUsername").value;
    const email = document.getElementById("signupEmail").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const response = await fetch("/signup", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ username, email, password })
    });

    const result = await response.json();
    alert(result.message);
    if (result.success) {
        closeForms();
        resetForm("signupForm"); // Reset signup form
    }
}

// Function to reset a form
function resetForm(formId) {
    const form = document.getElementById(formId);
    form.reset();  // Reset the form fields
}

// Dropdown toggle
const userIcon = document.getElementById('userIcon');
const userDropdown = document.getElementById('userDropdown');

userIcon.addEventListener('click', () => {
    userDropdown.classList.toggle('hidden');
});

// Close dropdown if clicked outside
document.addEventListener('click', function(event) {
    if (!userIcon.contains(event.target) && !userDropdown.contains(event.target)) {
        userDropdown.classList.add('hidden');
    }
});

// Fetch and display detection history
async function loadDetectionHistory() {
    try {
        const response = await fetch('/api/detection-history');
        const data = await response.json();
        
        const detectionHistory = document.getElementById('detectionHistory');
        detectionHistory.innerHTML = '';

        if (data.length === 0) {
            detectionHistory.innerHTML = '<li>No detections yet.</li>';
        } else {
            data.forEach(detection => {
                const li = document.createElement('li');
                li.textContent = `${detection.timestamp} - ${detection.animal}`;
                detectionHistory.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error fetching detection history:', error);
    }
}

// Download detection logs
const downloadLogsButton = document.getElementById('downloadLogsButton');
downloadLogsButton.addEventListener('click', () => {
    window.location.href = '/download-logs';
});

// Load history when page loads
document.addEventListener('DOMContentLoaded', loadDetectionHistory);

