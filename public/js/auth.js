// js/auth.js
class AuthManager {
    static isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    }

    static getUser() {
        const userRaw = localStorage.getItem('auth_user');
        if (userRaw) {
            try {
                return JSON.parse(userRaw);
            } catch(e) { return null; }
        }
        return null;
    }

    static setAuth(token, user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
    }

    static clearAuth() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
    }

    static async performLogin(email, password) {
        const response = await ApiClient.login({ email, password });
        if (response?.data?.token) {
            this.setAuth(response.data.token, response.data.user);
            return { success: true, user: response.data.user };
        }
        throw new Error('Invalid login response');
    }

    static async performRegister(name, email, password , password_confirmation) {
        const response = await ApiClient.register({ name, email, password , password_confirmation});
        if (response?.data?.token) {
            this.setAuth(response.data.token, response.data.user);
            return { success: true, user: response.data.user };
        }
        throw new Error('Registration error');
    }

    static async performLogout() {
        try {
            await ApiClient.logout();
        } catch(e) {}
        this.clearAuth();
        window.router.navigate('/login');
    }
}
