// Function to show the login form
function showLogin() {
    document.getElementById("login-form").style.display = "block";
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
}

// Function to show the signup form
function showSignup() {
    document.getElementById("login-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
}

// Function to handle login
function login() {
    const phone = document.getElementById("phone").value;
    const password = document.getElementById("password").value;

    // Hardcoded login details
    if (phone === "+2482510123" && password === "Tier$42@OwT&5") {
        document.getElementById("login-form").style.display = "none";
        document.getElementById("signup-form").style.display = "none";
        document.getElementById("dashboard").style.display = "block";
    } else {
        alert("Invalid login details.");
    }
}

// Function to handle sign up
function signup() {
    alert("Sign up functionality is not implemented in this demo.");
}

// Function to show the account settings
function showSettings() {
    document.getElementById("settings").style.display = "block";
}

// Function to handle logout
function logout() {
    document.getElementById("settings").style.display = "none";
    document.getElementById("dashboard").style.display = "none";
    document.getElementById("login-form").style.display = "block";
}
