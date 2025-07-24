// Simple SPA router for handling direct URL access and refresh
(function() {
    // Check if we're on a route that should be handled by React Router
    const path = window.location.pathname;
    const validRoutes = [
        '/admin-dashboard',
        '/admin-crud',
        '/shared-pass/',
        '/scan-pass/',
        '/scan-user-pass',
        '/employee-login',
        '/elogin'
    ];
    
    // Check if current path matches any valid route
    const isValidRoute = validRoutes.some(route => {
        if (route.endsWith('/')) {
            return path.startsWith(route);
        }
        return path === route;
    });
    
    // If we're on a valid route but not on the root, redirect to root with hash
    if (isValidRoute && path !== '/') {
        // Store the original path in sessionStorage
        sessionStorage.setItem('spa-redirect-path', path + window.location.search + window.location.hash);
        // Redirect to root
        window.location.replace('/');
    }
})();
