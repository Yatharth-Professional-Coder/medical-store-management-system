import axios from 'axios';

const getBaseUrl = () => {
    let url = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    if (!url.endsWith('/api')) {
        url += '/api';
    }
    return url;
};

const api = axios.create({
    baseURL: getBaseUrl(),
});

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            const token = JSON.parse(userInfo).token;
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle global errors like 403 Paused
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 403) {
            // Check if the backend sent a specific 403 message (e.g., Paused)
            const message = error.response.data?.message;
            if (message && !window.location.pathname.includes('/login')) {
                // Ensure we don't spam the alert if there are multiple concurrent requests
                if (!window.sessionStorage.getItem('pausedAlertShown')) {
                    alert(`ACCESS DENIED: ${message}`);
                    window.sessionStorage.setItem('pausedAlertShown', 'true');
                    setTimeout(() => window.sessionStorage.removeItem('pausedAlertShown'), 5000);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default api;
