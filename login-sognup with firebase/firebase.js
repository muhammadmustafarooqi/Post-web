import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore , collection, addDoc,getDocs ,doc, deleteDoc ,getDoc,updateDoc  } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";


const firebaseConfig = {
  apiKey: "AIzaSyCnzJdPDEWy-WQ7vpbd26mgzuhgXLasruI",
  authDomain: "login-sognup-with-firebase.firebaseapp.com",
  projectId: "login-sognup-with-firebase",
  storageBucket: "login-sognup-with-firebase.firebasestorage.app",
  messagingSenderId: "73571417994",
  appId: "1:73571417994:web:90bbcf122230fc01889273",
  measurementId: "G-F2CY7PH814"
};
// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ✅ Export only **once** to prevent issues
export { app, auth,signOut, onAuthStateChanged };
export { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup };
export { db ,  collection, addDoc , getDocs ,doc, deleteDoc,getDoc,updateDoc  }