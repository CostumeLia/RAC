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