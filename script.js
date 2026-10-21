// API URLS
const API_URL = "http://localhost:3000/api/blogs";
const REGISTER_URL = "http://localhost:3000/api/register";
const LOGIN_URL = "http://localhost:3000/api/login";

// REGISTER
const registerBtn = document.getElementById("registerBtn");

if (registerBtn) {
    registerBtn.addEventListener("click", async () => {
        const username = document.getElementById("regName").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const message = document.getElementById("registerMessage");

        if (!username || !email || !password) {
            message.textContent = "Please fill in all fields.";
            return;
        }

        message.textContent = "Registering...";

        try {
            const response = await fetch(REGISTER_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                message.textContent = result.message || "Registration failed!";
                return;
            }

            message.textContent = "Registration successful!";
        } catch (error) {
            console.error(error);
            message.textContent = "Cannot connect to server.";
        }
    });
}


// LOGIN
const loginBtn = document.getElementById("loginBtn");

if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;
        const message = document.getElementById("loginMessage");

        if (!email || !password) {
            message.textContent = "Please enter email and password.";
            return;
        }

        message.textContent = "Logging in...";

        try {
            const response = await fetch(LOGIN_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                message.textContent = result.message || "Login failed!";
                return;
            }

            localStorage.setItem("loggedInUser", JSON.stringify(result.user));

            message.textContent = "Login successful! Welcome, " + result.user.username + "!";

            const authorInput = document.getElementById("author");
            if (authorInput) {
                authorInput.value = result.user.username;
            }
        } catch (error) {
            console.error(error);
            message.textContent = "Cannot connect to server.";
        }
    });
}


// BLOG ELEMENTS
const authorInput = document.getElementById("author");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const publishBtn = document.getElementById("publishBtn");
const blogsList = document.getElementById("blogsList");


// PUBLISH BLOG
if (publishBtn) {
    publishBtn.addEventListener("click", createBlog);
}

async function createBlog() {
    const author = authorInput.value.trim();
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();

    if (!title || !content) {
        alert("Please enter a blog title and content.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                author: author || "Anonymous",
                title,
                content
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to publish blog.");
        }

        authorInput.value = "";
        titleInput.value = "";
        contentInput.value = "";

        alert("Blog published successfully!");
        await loadBlogs();
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
    }
}


// LOAD BLOGS
async function loadBlogs() {
    if (!blogsList) return;

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load blogs.");
        }

        const blogs = await response.json();
        blogsList.replaceChildren();

        if (!blogs.length) {
            blogsList.textContent = "No blogs yet. Be the first to publish!";
            return;
        }

        blogs.forEach((blog) => {
            const card = document.createElement("article");
            card.className = "blog-card";

            const heading = document.createElement("h3");
            heading.textContent = blog.title;

            const author = document.createElement("small");
            author.textContent = "By " + (blog.author || "Anonymous");

            const content = document.createElement("p");
            content.textContent = blog.content;

            // EDIT BUTTON
            const editBtn = document.createElement("button");
            editBtn.textContent = "Edit Blog";

            editBtn.addEventListener("click", async () => {
                const newTitle = prompt("Enter new blog title:", blog.title);
                if (newTitle === null) return;

                const newContent = prompt("Enter new blog content:", blog.content);
                if (newContent === null) return;

                if (!newTitle.trim() || !newContent.trim()) {
                    alert("Title and content cannot be empty.");
                    return;
                }

                try {
                    const response = await fetch(`${API_URL}/${blog._id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            title: newTitle.trim(),
                            content: newContent.trim(),
                            author: blog.author || "Anonymous"
                        })
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.message || "Unable to edit blog.");
                    }

                    alert("Blog updated successfully!");
                    await loadBlogs();
                } catch (error) {
                    alert("Error: " + error.message);
                }
            });

            // DELETE BUTTON
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete Blog";

            deleteBtn.addEventListener("click", async () => {
                const confirmDelete = confirm("Are you sure you want to delete this blog?");
                if (!confirmDelete) return;

                try {
                    const response = await fetch(`${API_URL}/${blog._id}`, {
                        method: "DELETE"
                    });

                    const result = await response.json();

                    if (!response.ok) {
                        throw new Error(result.message || "Unable to delete blog.");
                    }

                    alert("Blog deleted successfully!");
                    await loadBlogs();
                } catch (error) {
                    alert("Error: " + error.message);
                }
            });

            // COMMENTS
            const commentHeading = document.createElement("h4");
            commentHeading.textContent = "Comments";

            const nameInput = document.createElement("input");
            nameInput.placeholder = "Your name";
            nameInput.className = "comment-input";

            const commentInput = document.createElement("textarea");
            commentInput.placeholder = "Write a comment...";
            commentInput.className = "comment-input";

            const commentButton = document.createElement("button");
            commentButton.textContent = "Add Comment";

            const commentList = document.createElement("div");
            commentList.className = "comment-list";

            commentButton.addEventListener("click", async () => {
                const name = nameInput.value.trim();
                const commentText = commentInput.value.trim();

                const success = await addComment(
                    blog._id,
                    name,
                    commentText,
                    commentList
                );

                if (success) {
                    nameInput.value = "";
                    commentInput.value = "";
                }
            });

            card.append(
                heading,
                author,
                content,
                editBtn,
                deleteBtn,
                commentHeading,
                nameInput,
                commentInput,
                commentButton,
                commentList
            );

            blogsList.appendChild(card);
            loadComments(blog._id, commentList);
        });
    } catch (error) {
        console.error(error);
        blogsList.textContent = "Unable to load blogs. Please check the server.";
    }
}


// LOAD COMMENTS
async function loadComments(blogId, commentList) {
    try {
        const response = await fetch(`${API_URL}/${blogId}/comments`);

        if (!response.ok) {
            throw new Error("Unable to load comments.");
        }

        const comments = await response.json();
        commentList.replaceChildren();

        comments.forEach((comment) => {
            const item = document.createElement("div");
            item.className = "comment-item";

            const name = document.createElement("strong");
            name.textContent = comment.name + ": ";

            const text = document.createElement("span");
            text.textContent = comment.text;

            item.append(name, text);
            commentList.appendChild(item);
        });
    } catch (error) {
        console.error("Unable to load comments:", error);
    }
}


// ADD COMMENT
async function addComment(blogId, name, text, commentList) {
    if (!name || !text) {
        alert("Please enter your name and comment.");
        return false;
    }

    try {
        const response = await fetch(`${API_URL}/${blogId}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, text })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to add comment.");
        }

        await loadComments(blogId, commentList);
        alert("Comment added successfully!");
        return true;
    } catch (error) {
        console.error(error);
        alert("Error: " + error.message);
        return false;
    }
}


// LOAD BLOGS WHEN PAGE OPENS
loadBlogs();