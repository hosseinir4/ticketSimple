// js/api.js
const API_BASE = '/api';   // adjust if your laravel backend uses different prefix

class ApiClient {
    static getHeaders() {
        const token = localStorage.getItem('auth_token');
        return {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        };
    }

    static async request(endpoint, method = 'GET', body = null, isFormData = false) {
        const url = `${API_BASE}${endpoint}`;
        const options = {
            method,
            headers: !isFormData ? this.getHeaders() : { 'Authorization': this.getHeaders().Authorization },
        };

        if (body) {
            if (isFormData) {
                options.body = body;
            } else {
                options.body = JSON.stringify(body);
                options.headers['Content-Type'] = 'application/json';
            }
        }

        try {
            const response = await fetch(url, options);
            let data = null;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            if (!response.ok) {
                const errorMsg = data?.message || data?.error || 'Request failed';
                throw new Error(errorMsg);
            }
            return data;
        } catch (err) {
            console.error('API Error:', err);
            throw err;
        }
    }

    // auth
    static login(credentials) {
        return this.request('/login', 'POST', credentials);
    }
    static register(userData) {
        return this.request('/register', 'POST', userData);
    }
    static logout() {
        return this.request('/logout', 'POST');
    }

    // tickets
    static fetchTickets() {
        return this.request('/ticket', 'GET');
    }
    static createTicket(formData) {
        return this.request('/ticket', 'POST', formData, true);
    }
    static approveTicket(ticketId) {
        return this.request(`/ticket/${ticketId}/approve`, 'GET');
    }
    static confirmTicket(ticketId) {
        return this.request(`/ticket/${ticketId}/confirm`, 'GET');
    }
    static rejectTicket(ticketId, note) {
        return this.request(`/ticket/${ticketId}/reject`, 'POST', { note });
    }
    static bulkApprove(ticketIds) {
        return this.request('/ticket/bulkApprove', 'POST', { tickets: ticketIds });
    }
    static bulkConfirm(ticketIds) {
        return this.request('/ticket/bulkConfirm', 'POST', { tickets: ticketIds });
    }
}
