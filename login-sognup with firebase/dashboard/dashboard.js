import { app, auth, signOut, onAuthStateChanged } from "../firebase.js";
import { db, collection, addDoc, getDocs, doc, deleteDoc, getDoc, updateDoc } from "../firebase.js";

let logoutBtn = document.getElementById('logoutBtn');

// Logout functionality
const logout = () => {
    signOut(auth).then(() => {
        Toastify({
            text: "Logout successfully completed",
            duration: 3000
        }).showToast();

        window.location.href = "../login/index.html";
    }).catch((error) => {
        Toastify({
            text: "Logout Failed: " + error.message,
            duration: 3000
        }).showToast();
    });
};

logoutBtn.addEventListener('click', logout);

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login/index.html";
    } else {
        getAssignment(user.uid); 
    }
});

let stdName = document.getElementById('stdName');
let Assignmentlink = document.getElementById('link');
let docBtn = document.getElementById('add');
let data = document.querySelector('.data');
let loader = document.getElementById('loader');
loader.style.display = 'none';

const addAssignment = async () => {
    let user = auth.currentUser; 

    if (!user) {
        Toastify({
            text: "You must be logged in to add an assignment!",
            duration: 3000
        }).showToast();
        return;
    }

    if (stdName.value !== '' && Assignmentlink.value !== '') {
        docBtn.innerText = "Loading...";
        try {
            const docRef = await addDoc(collection(db, "assignments"), {
                sttudentName: stdName.value,
                Assignment: Assignmentlink.value,
                userId: user.uid 
            });

            console.log("Document written with ID: ", docRef.id);
            getAssignment(user.uid); 
        } catch (e) {
            console.error("Error adding document: ", e);
        } finally {
            docBtn.innerText = "Add";
            stdName.value = '';
            Assignmentlink.value = '';
            Toastify({
                text: "Post added successfully",
                duration: 3000
            }).showToast();
        }
    }
};

docBtn.addEventListener('click', addAssignment);

const getAssignment = async (currentUserId) => {
    data.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "assignments"));

    if (querySnapshot.empty) {
        data.innerHTML = '<h1>No data found</h1>';
        return;
    }

    querySnapshot.forEach((doc) => {
        const { sttudentName, Assignment, userId } = doc.data();

        let editAndDeleteButtons = '';
        
        if (currentUserId === userId) {
            editAndDeleteButtons = `
                <button class="btn btn-danger deleteBtn" onclick="deleteData('${doc.id}')" data-id="${doc.id}">Delete</button>
                <button class="btn btn-warning editBtn" onclick="editData('${doc.id}')" data-id="${doc.id}">Edit</button>
            `;
        }

        data.innerHTML += `
            <div class="Postcontainer">
                <h5 class="card-header">${sttudentName}</h5>
                <div class="card-body">
                    <p class="card-text">${Assignment}</p>
                </div>
                ${editAndDeleteButtons}
            </div>
        `;
    });
};

// Editdata Function
window.editData = async (id) => {
    try {
        let docRef = doc(db, "assignments", id);
        let Currentdata = await getDoc(docRef);

        if (!Currentdata.exists()) {
            Toastify({
                text: "Post not found!",
                duration: 3000
            }).showToast();
            return;
        }

        let data = Currentdata.data();

        // Check if the logged-in user is the owner
        let user = auth.currentUser;
        if (user.uid !== data.userId) {
            Toastify({
                text: "You can only edit your own posts!",
                duration: 3000
            }).showToast();
            return;
        }

        let newName = prompt("Edit Student Name:", data.sttudentName);
        let newAssignment = prompt("Edit Assignment Link:", data.Assignment);

        if (newName !== null && newAssignment !== null && newName !== "" && newAssignment !== "") {
            await updateDoc(docRef, {
                sttudentName: newName,
                Assignment: newAssignment
            });

            Toastify({
                text: "Post updated successfully",
                duration: 3000
            }).showToast();

            getAssignment(user.uid);
        } else {
            Toastify({
                text: "Edit canceled or invalid input!",
                duration: 3000
            }).showToast();
        }
    } catch (e) {
        console.error("Error updating document: ", e);
        Toastify({
            text: "Error updating post!",
            duration: 3000
        }).showToast();
    }
};

// Delete Data function
window.deleteData = async (id) => {
    try {
        let docRef = doc(db, "assignments", id);
        let Currentdata = await getDoc(docRef);

        if (!Currentdata.exists()) {
            Toastify({
                text: "Post not found!",
                duration: 3000
            }).showToast();
            return;
        }

        let data = Currentdata.data();

        // Check if the logged-in user is the owner
        let user = auth.currentUser;
        if (user.uid !== data.userId) {
            Toastify({
                text: "You can only delete your own posts!",
                duration: 3000
            }).showToast();
            return;
        }

        await deleteDoc(docRef);
        Toastify({
            text: "Post deleted successfully",
            duration: 3000
        }).showToast();

        getAssignment(user.uid);
    } catch (e) {
        console.error("Error deleting document: ", e);
    }
};
