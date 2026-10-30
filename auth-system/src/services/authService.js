import api from './api';

async function login(username, password) {
    const response = await api.post('login/', { username, password });
    return response.data;
}

async function register(userData) {
    const response = await api.post('register/', userData);
    return response.data;
}

async function logout() {
    const response = await api.post('logout/');
    return response.data;
}

async function checkStatus() {
    const response = await api.get('status/');
    return response.data;
}

async function changePassword(currentPassword, newPassword) {
    const response = await api.post('change-password/', {
        currentPassword,
        newPassword,
    });
    return response.data;
}

async function verifyEmail(token) {
    const response = await api.post('verify-email/', { token });
    return response.data;
}

// Signed-in person asks for a verification link for their own email
async function sendVerificationEmail() {
    const response = await api.post('send-verification/');
    return response.data;
}

// Public: used on the verify-email page by someone who is not signed in
async function resendVerificationEmail(email) {
    const response = await api.post('resend-verification/', { email });
    return response.data;
}

async function requestPasswordReset(email) {
    const response = await api.post('request-password-reset/', { email });
    return response.data;
}

async function resetPassword(token, newPassword) {
    const response = await api.post('reset-password/', { token, newPassword });
    return response.data;
}

export const authService = {
    login,
    register,
    logout,
    checkStatus,
    changePassword,
    verifyEmail,
    sendVerificationEmail,
    resendVerificationEmail,
    requestPasswordReset,
    resetPassword,
};