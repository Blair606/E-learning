// Auth utilities
const Auth = {
    // Store token in localStorage
    setToken(token) {
        localStorage.setItem('token', token);
    },

    // Get token from localStorage
    getToken() {
        return localStorage.getItem('token');
    },

    // Remove token from localStorage
    removeToken() {
        localStorage.removeItem('token');
    },

    // Check if user is logged in
    isLoggedIn() {
        return !!this.getToken();
    },

    // Login function
    async login(email, password) {
        try {
            const response = await fetch('api/auth/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            
            if (data.success) {
                this.setToken(data.token);
                return data;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            throw error;
        }
    },

    // Logout function
    logout() {
        this.removeToken();
        window.location.href = 'login.php';
    },

    // Function to make authenticated API calls
    async fetchWithAuth(url, options = {}) {
        const token = this.getToken();
        
        if (!token) {
            throw new Error('No authentication token found');
        }

        const headers = {
            'Authorization': `Bearer ${token}`,
            ...options.headers
        };

        const response = await fetch(url, {
            ...options,
            headers
        });

        if (response.status === 401) {
            this.removeToken();
            window.location.href = 'login.php';
            throw new Error('Session expired');
        }

        return response;
    }
};

// Export Auth object
window.Auth = Auth; 