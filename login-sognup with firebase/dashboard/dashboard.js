import { app, auth, signOut, onAuthStateChanged } from "../firebase.js";
import { db, collection, addDoc, getDocs, doc, deleteDoc, getDoc, updateDoc } from "../firebase.js";

let logoutBtn = document.getElementById('logoutBtn');
let showOnlyMine = false;
let stdName = document.getElementById('stdName');
let Assignmentlink = document.getElementById('link');
let docBtn = document.getElementById('add');
let data = document.querySelector('.data');
let loader = document.getElementById('loader');

// Initialize loader
loader.style.display = 'none';

// Check Authentication Status
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "../login/index.html";
    } else {
        getAssignment(user.uid);
    }
});

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

// Add Post functionality
const addAssignment = async () => {
    let user = auth.currentUser;

    if (!user) {
        Toastify({
            text: "You must be logged in to add a post!",
            duration: 3000
        }).showToast();
        return;
    }

    if (stdName.value.trim() === '' || Assignmentlink.value.trim() === '') {
        Toastify({
            text: "Please fill all fields!",
            duration: 3000
        }).showToast();
        return;
    }

    // Show loading state
    docBtn.innerText = "Loading...";
    loader.style.display = 'block';
    docBtn.disabled = true;

    try {
        const docRef = await addDoc(collection(db, "assignments"), {
            sttudentName: stdName.value,
            Assignment: Assignmentlink.value,
            userId: user.uid,
            likes: 0,
            timestamp: new Date()
        });

        console.log("Document written with ID: ", docRef.id);
        getAssignment(user.uid);

        // Clear form
        stdName.value = '';
        Assignmentlink.value = '';

        Toastify({
            text: "Post added successfully",
            duration: 3000
        }).showToast();
    } catch (e) {
        console.error("Error adding document: ", e);
        Toastify({
            text: "Error: " + e.message,
            duration: 3000
        }).showToast();
    } finally {
        // Reset loading state
        docBtn.innerText = "Post";
        loader.style.display = 'none';
        docBtn.disabled = false;
    }
};

docBtn.addEventListener('click', addAssignment);

// Get Posts
const getAssignment = async (currentUserId) => {
    data.innerHTML = "";
    loader.style.display = 'block';

    try {
        const querySnapshot = await getDocs(collection(db, "assignments"));

        if (querySnapshot.empty) {
            data.innerHTML = '<h1 style="text-align: center; margin-top: 20px;">No posts found</h1>';
            return;
        }

        // Convert to array for sorting
        const posts = [];
        querySnapshot.forEach((doc) => {
            posts.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by timestamp (newest first)
        posts.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.seconds : 0;
            const timeB = b.timestamp ? b.timestamp.seconds : 0;
            return timeB - timeA;
        });

        posts.forEach((post) => {
            const { sttudentName, Assignment, userId, likes } = post;

            // Filter posts based on current view mode
            if (!showOnlyMine || userId === currentUserId) {
                let editAndDeleteButtons = '';

                // Only show edit/delete buttons for user's own posts
                if (currentUserId === userId) {
                    editAndDeleteButtons = `
                        <div class="post-actions">
                            <button class="btn-danger" onclick="deleteData('${post.id}')">Delete</button>
                            <button class="btn-warning" onclick="editData('${post.id}')">Edit</button>
                        </div>
                    `;
                }

                // Display the post with comment section
                data.innerHTML += `
                    <div class="Postcontainer">
                        <h5 class="card-header">${sttudentName}</h5>
                        <div class="card-body">
                            <p class="card-text">${Assignment}</p>
                            <div class="post-actions">
                                <button class="btn-like" onclick="likePost('${post.id}')">Like 👍 <span id="like-count-${post.id}">${likes || 0}</span></button>
                                ${editAndDeleteButtons}
                            </div>
                        </div>
                        
                        <div class="comment-section">
                            <h4>Comments:</h4>
                            <div class="comments-list" id="comments-list-${post.id}">
                                <!-- Comments will be loaded here -->
                            </div>
                            
                            <div class="comment-input-container">
                                <input type="text" id="comment-input-${post.id}" placeholder="Add a comment...">
                                <button onclick="addComment('${post.id}')">Add Comment</button>
                            </div>
                        </div>
                    </div>
                `;

                // Load comments for this post
                getComments(post.id);
            }
        });
    } catch (error) {
        console.error("Error fetching posts:", error);
        data.innerHTML = `<h1 style="text-align: center; color: red;">Error loading posts: ${error.message}</h1>`;
    } finally {
        loader.style.display = 'none';
    }
};

// Like Post function
window.likePost = async (id) => {
    try {
        const postRef = doc(db, "assignments", id);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const post = postSnap.data();
            const currentLikes = post.likes || 0;

            await updateDoc(postRef, {
                likes: currentLikes + 1
            });

            document.getElementById(`like-count-${id}`).innerText = currentLikes + 1;

            Toastify({
                text: "You liked this post!",
                duration: 3000
            }).showToast();
        }
    } catch (error) {
        console.error("Error liking post:", error);
        Toastify({
            text: "Error liking post: " + error.message,
            duration: 3000
        }).showToast();
    }
};

// Edit Post function
window.editData = async (id) => {
    try {
        let docRef = doc(db, "assignments", id);
        let currentData = await getDoc(docRef);

        if (!currentData.exists()) {
            Toastify({
                text: "Post not found!",
                duration: 3000
            }).showToast();
            return;
        }

        let data = currentData.data();

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

        if (newName !== null && newAssignment !== null && newName.trim() !== "" && newAssignment.trim() !== "") {
            await updateDoc(docRef, {
                sttudentName: newName,
                Assignment: newAssignment,
                lastEdited: new Date()
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
            text: "Error updating post: " + e.message,
            duration: 3000
        }).showToast();
    }
};

// Delete Post function
window.deleteData = async (id) => {
    if (!confirm("Are you sure you want to delete this post?")) {
        return;
    }

    try {
        let docRef = doc(db, "assignments", id);
        let currentData = await getDoc(docRef);

        if (!currentData.exists()) {
            Toastify({
                text: "Post not found!",
                duration: 3000
            }).showToast();
            return;
        }

        let data = currentData.data();

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
        Toastify({
            text: "Error deleting post: " + e.message,
            duration: 3000
        }).showToast();
    }
};

// Comment Functions
// Get Comments for a post
const getComments = async (postId) => {
    try {
        const commentsRef = collection(db, "assignments", postId, "comments");
        const querySnapshot = await getDocs(commentsRef);

        const commentsList = document.getElementById(`comments-list-${postId}`);
        commentsList.innerHTML = '';

        if (querySnapshot.empty) {
            commentsList.innerHTML = '<p style="font-style: italic; color: #95a5a6;">No comments yet. Be the first to comment!</p>';
            return;
        }

        // Convert to array for sorting
        const comments = [];
        querySnapshot.forEach((doc) => {
            comments.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by timestamp (newest first)
        comments.sort((a, b) => {
            const timeA = a.timestamp ? a.timestamp.seconds : 0;
            const timeB = b.timestamp ? b.timestamp.seconds : 0;
            return timeB - timeA;
        });

        comments.forEach((comment) => {
            const { userId, comment: commentText } = comment;
            const user = auth.currentUser;

            const commentElement = document.createElement('div');
            commentElement.classList.add('comment');

            // Only show delete button for user's own comments
            const deleteButton = userId === user?.uid ?
                `<button onclick="deleteComment('${postId}', '${comment.id}')">Delete</button>` : '';

            // Inside getComments function, modify the commentElement.innerHTML assignment:
            commentElement.innerHTML = `
                <div><strong>${postId}</strong>: ${commentText}</div>
                ${deleteButton}
            `;

            commentsList.appendChild(commentElement);
        });
    } catch (error) {
        console.error("Error fetching comments:", error);
    }
};

// Add Comment function
window.addComment = async (postId) => {
    const commentInput = document.getElementById(`comment-input-${postId}`);
    const commentText = commentInput.value.trim();

    if (commentText === '') {
        Toastify({
            text: "Comment cannot be empty!",
            duration: 3000
        }).showToast();
        return;
    }

    const user = auth.currentUser;
    if (!user) {
        Toastify({
            text: "You must be logged in to comment!",
            duration: 3000
        }).showToast();
        return;
    }

    try {
        await addDoc(collection(db, "assignments", postId, "comments"), {
            userId: user.uid,
            comment: commentText,
            timestamp: new Date()
        });

        // Clear input and refresh comments
        commentInput.value = '';
        getComments(postId);

        Toastify({
            text: "Comment added successfully!",
            duration: 3000
        }).showToast();
    } catch (error) {
        console.error("Error adding comment: ", error);
        Toastify({
            text: "Error adding comment: " + error.message,
            duration: 3000
        }).showToast();
    }
};

// Delete Comment function
window.deleteComment = async (postId, commentId) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
        return;
    }

    try {
        const commentRef = doc(db, "assignments", postId, "comments", commentId);
        const commentSnap = await getDoc(commentRef);

        // Check if comment exists and user owns it
        if (commentSnap.exists()) {
            const commentData = commentSnap.data();
            const user = auth.currentUser;

            if (user.uid !== commentData.userId) {
                Toastify({
                    text: "You can only delete your own comments!",
                    duration: 3000
                }).showToast();
                return;
            }

            await deleteDoc(commentRef);
            getComments(postId); // Refresh comments list

            Toastify({
                text: "Comment deleted successfully!",
                duration: 3000
            }).showToast();
        } else {
            Toastify({
                text: "Comment not found!",
                duration: 3000
            }).showToast();
        }
    } catch (error) {
        console.error("Error deleting comment: ", error);
        Toastify({
            text: "Error deleting comment: " + error.message,
            duration: 3000
        }).showToast();
    }
};

// Filter buttons
let showAllBtn = document.getElementById("showAllBtn");
let showMyBtn = document.getElementById("showMyBtn");

showAllBtn.addEventListener("click", () => {
    showOnlyMine = false;
    showAllBtn.classList.add("active");
    showMyBtn.classList.remove("active");
    getAssignment(auth.currentUser.uid);
});

showMyBtn.addEventListener("click", () => {
    showOnlyMine = true;
    showMyBtn.classList.add("active");
    showAllBtn.classList.remove("active");
    getAssignment(auth.currentUser.uid);
});
