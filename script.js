const API_URL = "/api/blogs";

const authorInput = document.getElementById("author");
const titleInput = document.getElementById("title");
const contentInput = document.getElementById("content");
const publishBtn = document.getElementById("publishBtn");
const blogsList = document.getElementById("blogsList");

publishBtn.addEventListener("click", createBlog);

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
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                author: author || "Anonymous",
                title,
                content
            })
        });

        const blog = await response.json();

        if (!response.ok) {
            throw new Error(blog.message || "Unable to publish blog");
        }

        authorInput.value = "";
        titleInput.value = "";
        contentInput.value = "";

        alert("Blog published successfully!");
        loadBlogs();
    } catch (error) {
        alert("Error: " + error.message);
    }
}

async function loadBlogs() {
    try {
        const response = await fetch(API_URL);
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
                await addComment(
                    blog._id,
                    nameInput.value.trim(),
                    commentInput.value.trim(),
                    commentList
                );

                nameInput.value = "";
                commentInput.value = "";
            });

            card.append(
                heading,
                author,
                content,
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
        blogsList.textContent =
            "Unable to load blogs. Please check whether the server is running.";
    }
}

async function loadComments(blogId, commentList) {
    try {
        const response = await fetch(`${API_URL}/${blogId}/comments`);
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

async function addComment(blogId, name, text, commentList) {
    if (!name || !text) {
        alert("Please enter your name and comment.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${blogId}/comments`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, text })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || "Unable to add comment");
        }

        await loadComments(blogId, commentList);
        alert("Comment added successfully!");
    } catch (error) {
        alert("Error: " + error.message);
    }
}

loadBlogs();