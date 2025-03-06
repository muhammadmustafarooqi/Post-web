import { 
    app,
    auth,
    signInWithEmailAndPassword, 
    onAuthStateChanged,
    GoogleAuthProvider,     
    signInWithPopup   
} from "../firebase.js";

let loginEmail = document.querySelector("#loginEmail");
let loginPassword = document.querySelector("#loginPassword");
let loginBtn = document.querySelector("#loginBtn");

const Login = (event) => {
    event.preventDefault();

    if (!loginEmail.value.trim() || !loginPassword.value.trim()) {
        Toastify({
            text: "Please fill in both fields.",
            duration: 3000
        }).showToast();
        return;
    }

    signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
    .then((userCredential) => {
        const user = userCredential.user;
        Toastify({
            text: "Logged in successfully",
            duration: 3000
        }).showToast();
        
        // Redirect after a short delay
        setTimeout(() => {   
            window.location.href = "../dashboard/dashboard.html";
        }, 1500);
    })
    .catch((error) => {
        Toastify({
            text: `Login failed: ${error.message}`,
            duration: 3000
        }).showToast();
    });
};

if (loginBtn) {
    loginBtn.addEventListener("click", Login);
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        window.location.href = "../dashboard/dashboard.html";
    }
});

// Google Sign-In
const provider = new GoogleAuthProvider();
auth.languageCode = "en";

document.addEventListener("DOMContentLoaded", function () {
    const googleSignUpBtn = document.getElementById("googleSignUpBtn");

    if (googleSignUpBtn) {
        googleSignUpBtn.addEventListener("click", function () {
            signInWithPopup(auth, provider)
                .then((result) => {
                    Toastify({
                        text: "Signed in with Google!",
                        duration: 3000,
                        gravity: "top",
                        backgroundColor: "green",
                    }).showToast();

                    // Redirect user
                    setTimeout(() => {
                        window.location.href = "../dashboard/dashboard.html";
                    }, 2000);
                })
                .catch((error) => {
                    Toastify({
                        text: `Google Sign-in Failed: ${error.message}`,
                        duration: 3000,
                        gravity: "top",
                        backgroundColor: "red",
                    }).showToast();
                });
        });
    }
});

