import { auth } from "../firebase.js";
import { 
    createUserWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

console.log(auth);

const signUpBtn = document.getElementById("signUpBtn");

const signup = (event) => {
    event.preventDefault(); 

    let userEmail = document.getElementById("signup-email").value.trim();
    let userPassword = document.getElementById("signup-password").value;
    let confirmPassword = document.getElementById("confirm-password").value;

    if (!userEmail || !userPassword || !confirmPassword) {
        Toastify({ text: "All fields are required!", duration: 3000 }).showToast();
        return;
    }

    if (userPassword.length < 6) {
        Toastify({ text: "Password must be at least 6 characters long!", duration: 3000 }).showToast();
        return;
    }

    if (userPassword !== confirmPassword) {
        Toastify({ text: "Passwords do not match!", duration: 3000 }).showToast();
        return;
    }

    createUserWithEmailAndPassword(auth, userEmail, userPassword)
        .then((userCredential) => {
            console.log("User created successfully:", userCredential.user); 
            Toastify({ text: "Account created successfully!", duration: 3000 }).showToast();

            setTimeout(() => {
                window.location.href = "../login/index.html";
            }, 2000);
        })
        .catch((error) => {
            console.error("Error:", error.code, error.message);
            Toastify({ text: "Error: " + error.message, duration: 3000 }).showToast();
        });
};

signUpBtn.addEventListener("click", signup);

onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("User is signed in:", user.email);
        window.location.href = "../login/index.html";
    } else {
        console.log("User is signed out");
    }
});
