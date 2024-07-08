document.getElementById('signup-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const mobile = document.getElementById('mobile').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    fetch('http://127.0.0.1:5000/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, mobile_no: mobile, email, password }),
    })
        .then(response => response.json())
        .then(data => alert(data.message))
        .catch(error => console.error('Error:', error));
});

document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    fetch('http://127.0.0.1:5000/users/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Login successful') {
                alert(data.message);
                localStorage.setItem('user_id', data.user_id);
                loadUsers();
                loadDiscussions();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('discussion-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const user_id = localStorage.getItem('user_id');
    const text = document.getElementById('discussion-text').value;
    const image_url = document.getElementById('discussion-image').value;
    const hashtags = document.getElementById('discussion-tags').value.split(',');

    fetch('http://127.0.0.1:5000/discussions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id, text, image_url, hashtags }),
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadDiscussions();
        })
        .catch(error => console.error('Error:', error));
});

document.getElementById('search-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const tags = document.getElementById('search-tags').value;

    fetch(`http://127.0.0.1:5000/discussions?tags=${tags}`, {
        method: 'GET',
    })
        .then(response => response.json())
        .then(results => {
            const searchResultsContainer = document.getElementById('search-results');
            searchResultsContainer.innerHTML = '';

            results.forEach(result => {
                const div = document.createElement('div');
                div.classList.add('discussion');
                div.innerHTML = `
                    <p><strong>${result.text}</strong></p>
                    ${result.image_url ? `<img src="${result.image_url}" alt="Discussion Image" />` : ''}
                    <p>Tags: ${result.hashtags.join(', ')}</p>
                    <p>Posted by User ${result.user_id} on ${new Date(result.created_at).toLocaleString()}</p>
                    <p>Views: ${result.view_count}</p>
                `;
                searchResultsContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error:', error));
});

function loadUsers() {
    fetch('http://127.0.0.1:5000/users', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(users => {
            const userListContainer = document.getElementById('user-list');
            userListContainer.innerHTML = '';

            users.forEach(user => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <p>${user.name} - ${user.email}</p>
                    <button onclick="followUser(${user.id})">Follow</button>
                `;
                userListContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error:', error));
}

function loadDiscussions() {
    fetch('http://127.0.0.1:5000/discussions', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(discussions => {
            const discussionsContainer = document.getElementById('discussions');
            discussionsContainer.innerHTML = '';

            discussions.forEach(discussion => {
                const div = document.createElement('div');
                div.classList.add('discussion');
                div.innerHTML = `
                    <p><strong>${discussion.text}</strong></p>
                    ${discussion.image_url ? `<img src="${discussion.image_url}" alt="Discussion Image" />` : ''}
                    <p>Tags: ${discussion.hashtags.join(', ')}</p>
                    <p>Posted by User ${discussion.user_id} on ${new Date(discussion.created_at).toLocaleString()}</p>
                    <p>Views: ${discussion.view_count}</p>
                    <button onclick="likeDiscussion(${discussion.id})">Like</button>
                    <button onclick="commentOnDiscussion(${discussion.id})">Comment</button>
                    <button onclick="deleteDiscussion(${discussion.id})">Delete</button>
                `;
                discussionsContainer.appendChild(div);
            });
        })
        .catch(error => console.error('Error:', error));
}

function followUser(userId) {
    // Implement follow user functionality
}

function likeDiscussion(discussionId) {
    // Implement like discussion functionality
}

function commentOnDiscussion(discussionId) {
    // Implement comment on discussion functionality
}

function deleteDiscussion(discussionId) {
    fetch(`http://127.0.0.1:5000/discussions/${discussionId}`, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            loadDiscussions();
        })
        .catch(error => console.error('Error:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    loadUsers();
    loadDiscussions();
});
