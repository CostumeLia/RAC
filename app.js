const main = document.querySelector('main');

async function loadContent(pageName) {
    try {
        const response = await fetch(`${pageName}.html`);
        if (!response.ok) {
            throw new Error(`Failed to load ${pageName}.html`);
        }
        const html = await response.text();
        main.innerHTML = html;
    } catch (error) {
        console.error(error);
        main.innerHTML = '<p>Error loading content.</p>';
    }
}

// Get the page name from the URL
function getPageName() {
    const path = window.location.pathname;
    if (path === '/' || path === '/index.html') {
        return 'home';
    } else {
        const match = path.match(/^\/([a-zA-Z_]+)\.html$/); // Match filenames like /calendar.html
        return match ? match[1] : 'home'; // Default to 'home' if no match
    }
}

// Load content on page load
const pageName = getPageName();
loadContent(pageName);

// Override link behavior to load content dynamically
document.addEventListener('click', function (event) {
    if (event.target.tagName === 'A') {
        const href = event.target.getAttribute('href');
        if (href.endsWith('.html') && href !== 'index.html') { // Only intercept internal .html links
            event.preventDefault();
            const newPageName = href.slice(0, -5);  // Remove ".html"
            history.pushState(null, '', href); // Update URL
            loadContent(newPageName);

            // Scroll to top after loading new content
            window.scrollTo(0, 0);

        } else if (href === 'index.html') {
            event.preventDefault();
            history.pushState(null, '', 'index.html');
            loadContent('home');
            // Scroll to top after loading new content
            window.scrollTo(0, 0);
        }
    }
});

// Handle browser back/forward buttons
window.addEventListener('popstate', function (event) {
    const pageName = getPageName();
    loadContent(pageName);
    // Scroll to top after loading new content
    window.scrollTo(0, 0);
});

//Form Script
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('mailingListForm');
    const messageArea = document.getElementById('form-message');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Get form data
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const interests = [];
        document.querySelectorAll('input[name="interests"]:checked').forEach(function(checkbox) {
            interests.push(checkbox.value);
        });

        // Basic client-side validation (still need server-side validation!)
        if (!name || !email) {
            messageArea.textContent = "Please fill out all required fields.";
            messageArea.style.color = "red";
            return;
        }

        if (!isValidEmail(email)) { // You'll need to implement this function
            messageArea.textContent = "Please enter a valid email address.";
            messageArea.style.color = "red";
            return;
        }

        if (interests.length === 0) {
            messageArea.textContent = "Please select at least one interest.";
            messageArea.style.color = "red";
            return;
        }

        // Prepare data for sending
        const formData = {
            name: name,
            email: email,
            interests: interests
        };

        // Send data to the server (using Fetch API)
        fetch('/api/signup', { // Replace with your server endpoint
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json(); // Or response.text() if your server returns plain text
        })
        .then(data => {
            // Handle success
            messageArea.textContent = "Thank you for signing up!";
            messageArea.style.color = "green";

            // Reset the form (optional)
            form.reset();
        })
        .catch(error => {
            // Handle errors
            console.error('There was an error!', error);
            messageArea.textContent = "An error occurred. Please try again later.";
            messageArea.style.color = "red";
        });
    });

    // Helper function for email validation
    function isValidEmail(email) {
        // Basic email validation regex (you can use a more robust one)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
});