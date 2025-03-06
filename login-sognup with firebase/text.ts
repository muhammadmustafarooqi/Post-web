// import { auth } from "../firebase.js"; 
// import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
// import Toastify from "toastify-js";

// let signUpBtn = document.getElementById("signUpBtn");

// const signup = (event) => {
//     event.preventDefault(); // ✅ Fix: Prevent default form submission

//     // ✅ Fix: Correct input field selection
//     let userName = document.getElementById("userName").value.trim();
//     let userEmail = document.getElementById("userEmail").value.trim();
//     let userPassword = document.getElementById("userPassword").value;
//     let confirmPassword = document.getElementById("ConfirmPassword").value;

//     // ✅ Validation
//     if (!userName || !userEmail || !userPassword || !confirmPassword) {
//         showToast("All fields are required!", "error");
//         return;
//     }

//     if (userPassword.length < 6) {
//         showToast("Password must be at least 6 characters!", "error");
//         return;
//     }

//     if (userPassword !== confirmPassword) {
//         showToast("Passwords do not match!", "error");
//         return;
//     }

//     // ✅ Firebase Signup
//     createUserWithEmailAndPassword(auth, userEmail, userPassword)
//         .then((userCredential) => {
//             const user = userCredential.user;
            
//             // ✅ Update user profile with username
//             return updateProfile(user, { displayName: userName }).then(() => {
//                 showToast("Account created successfully!", "success");
//                 setTimeout(() => {
//                     window.location.href = "../login/index.html"; // Redirect after signup
//                 }, 2000);
//             });
//         })
//         .catch((error) => {
//             showToast(error.message, "error");
//         });
// };

// // ✅ Attach event listener
// signUpBtn.addEventListener("click", signup);

// // ✅ Toastify function for alerts
// function showToast(message, type) {
//     Toastify({
//         text: message,
//         duration: 3000,
//         gravity: "top",
//         position: "right",
//         backgroundColor: type === "success" ? "#28a745" : "#dc3545",
//     }).showToast();
// }
