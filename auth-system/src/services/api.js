import axios from 'axios';

// On your machine this falls back to localhost. On Vercel, set VITE_API_URL
// to your deployed backend, for example https://your-backend.onrender.com/auth/
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/auth/';

const api = axios.create({
    baseURL,
    withCredentials: true,
});

// Show the backend's own error text instead of "Request failed with status code 400"
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const backendMessage =
            error.response?.data?.error || error.response?.data?.detail;
        if (backendMessage) {
            error.message = backendMessage;
        }
        return Promise.reject(error);
    },
);

export default api;