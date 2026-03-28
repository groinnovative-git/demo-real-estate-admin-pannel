import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '',
    headers: { 'Content-Type': 'application/json' },
    timeout: 60000, // 60 s default
});

// ── Request interceptor — attach Bearer token + fix FormData Content-Type ──
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('re_admin_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // For FormData, delete Content-Type so the browser sets it with the
        // correct multipart boundary automatically.
        if (config.data instanceof FormData) {
            delete config.headers['Content-Type'];
            config.timeout = 120000; // 2 min for file uploads
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response interceptor — handle 401 auto-logout ─────────────────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('re_admin_token');
            localStorage.removeItem('re_admin_user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
