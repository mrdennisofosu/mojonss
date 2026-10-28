import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8000/auth/',
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