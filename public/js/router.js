// js/router.js
class Router {
    constructor() {
        this.routes = {};
        window.router = this;
        window.addEventListener('popstate', () => this.handleRoute());
    }

    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    navigate(path, replace = false) {
        if (replace) {
            history.replaceState(null, '', path);
        } else {
            history.pushState(null, '', path);
        }
        this.currentRoute = path;
        this.handleRoute();
    }

    async handleRoute() {
        const path = window.location.pathname;
        this.currentRoute = path;
        const container = document.getElementById('page-container');
        const navbar = document.getElementById('navbar');
        this.renderNavbar(navbar);
        if (this.routes[path]) {
            await this.routes[path](container);
        } else {
            await this.routes['/'](container);
        }
    }

    renderNavbar(navbarEl) {
        const isAuth = AuthManager.isAuthenticated();
        const user = AuthManager.getUser();
        let navHtml = `<div class="logo">🎫 TicketFlow</div><div class="nav-links">`;
        if(isAuth) {
            navHtml += `<span class="nav-link">👋 Hi, ${user?.name || 'User'}</span>`;
            navHtml += `<button class="nav-link" id="navDashboard">Dashboard</button>`;
            navHtml += `<button class="nav-link logout-btn" id="navLogout">Logout</button>`;
        } else {
            navHtml += `<button class="nav-link" id="navLogin">Login</button>`;
            navHtml += `<button class="nav-link" id="navRegister">Register</button>`;
        }
        navHtml += `</div>`;
        navbarEl.innerHTML = navHtml;
        if(isAuth) {
            document.getElementById('navDashboard')?.addEventListener('click', () => this.navigate('/dashboard'));
            document.getElementById('navLogout')?.addEventListener('click', async () => {
                await AuthManager.performLogout();
                this.navigate('/login');
            });
        } else {
            document.getElementById('navLogin')?.addEventListener('click', () => this.navigate('/login'));
            document.getElementById('navRegister')?.addEventListener('click', () => this.navigate('/register'));
        }
    }
}
