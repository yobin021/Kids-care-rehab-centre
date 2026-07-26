// ==============================
// Current Selected Role
// ==============================

let currentRole = "Admin";


// ==============================
// Change Role
// ==============================

function changeRole(role){

    currentRole = role;

    // Update button highlight
    let buttons = document.querySelectorAll(".role");

    buttons.forEach(btn=>{
        btn.classList.remove("active");

        if(btn.innerText===role){
            btn.classList.add("active");
        }
    });

    // Update headings

    document.getElementById("loginTitle").innerText =
        role + " Login";

    document.getElementById("registerTitle").innerText =
        role + " Register";

}


// ==============================
// Show Register Form
// ==============================

function showRegister(event){

    event.preventDefault();

    document.getElementById("loginForm").style.display="none";

    document.getElementById("registerForm").style.display="block";

}


// ==============================
// Show Login Form
// ==============================

function showLogin(event){

    event.preventDefault();

    document.getElementById("registerForm").style.display="none";

    document.getElementById("loginForm").style.display="block";

}


// ==============================
// Prevent Form Refresh
// ==============================

document.querySelectorAll("button").forEach(btn=>{

    btn.addEventListener("click",function(e){

        if(this.classList.contains("main-btn")){

            e.preventDefault();

            alert("This is a UI Demo.");

        }

    });

});


// ==============================
// Default
// ==============================

changeRole("Admin");