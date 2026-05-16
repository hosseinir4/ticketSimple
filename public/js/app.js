// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    const router = new Router();

    // route: login page
    router.addRoute('/login', async (container) => {
        container.innerHTML = `<div class="card" style="max-width:450px;margin:2rem auto;"><h2>Login</h2>
        <form id="loginForm"><div class="form-group"><label>Email</label><input type="email" id="email" required></div>
        <div class="form-group"><label>Password</label><input type="password" id="password" required></div>
        <button type="submit" class="btn btn-primary">Login</button><p style="margin-top:1rem;"><a href="#" id="gotoRegister">No account? Register</a></p></form></div>`;
        document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                await AuthManager.performLogin(email, password);
                router.navigate('/dashboard');
                TicketUI.showToast('Login success', 'success');
            } catch(err) { TicketUI.showToast(err.message, 'error'); }
        });
        document.getElementById('gotoRegister')?.addEventListener('click', (e) => { e.preventDefault(); router.navigate('/register'); });
    });

    router.addRoute('/register', async (container) => {
        container.innerHTML = `<div class="card" style="max-width:450px;margin:2rem auto;"><h2>Register</h2>
        <form id="regForm"><div class="form-group"><label>Name</label><input id="name" required></div>
        <div class="form-group"><label>Email</label><input id="email" type="email" required></div>
        <div class="form-group"><label>Password</label><input id="password" type="password" required></div>
        <div class="form-group"><label>Password confirm</label><input id="password_confirmation" type="password" required></div>
        <button type="submit" class="btn btn-primary">Register</button><p><a href="#" id="gotoLogin">Already have account?</a></p></form></div>`;
        document.getElementById('regForm')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password_confirmation = document.getElementById('password_confirmation').value;
            try {
                await AuthManager.performRegister(name, email, password,password_confirmation);
                router.navigate('/dashboard');
                TicketUI.showToast('Registration success', 'success');
            } catch(err) { TicketUI.showToast(err.message, 'error'); }
        });
        document.getElementById('gotoLogin')?.addEventListener('click', (e) => { e.preventDefault(); router.navigate('/login'); });
    });

    router.addRoute('/dashboard', async (container) => {
        if(!AuthManager.isAuthenticated()) { router.navigate('/login'); return; }
        await TicketUI.renderTicketPage(container);
    });

    router.addRoute('/', async (container) => {
        if(AuthManager.isAuthenticated()) router.navigate('/dashboard');
        else router.navigate('/login');
    });

    // handle initial route
    const initialPath = window.location.pathname;
    if(initialPath === '/' || initialPath === '') router.navigate('/', true);
    else router.navigate(initialPath, true);
});
