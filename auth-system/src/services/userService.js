
import api from './api';

async function listUsers({ search = '', role = '', status = '', page = 1, pageSize = 8 } = {}) {
  const response = await api.get('users/', {
    params: { search, role, status, page, pageSize }
  });
  return response.data;
}

async function changeUserRole(id, role, actor) {
  const response = await api.patch(`users/${id}/role/`, { role });
  return response.data;
}

async function setUserStatus(id, status, actor) {
  const response = await api.patch(`users/${id}/status/`, { status });
  return response.data;
}

async function createUser({ fullName, email, role }) {
  const response = await api.post('register/', {
    username: email,
    email: email,
    password: 'Welcome@123',
    firstName: fullName,
    role: role,
  });
  return { user: response.data, temporaryPassword: 'Welcome@123' };
}

async function updateUser(id, { fullName, email }) {
  const response = await api.patch(`users/${id}/`, { fullName, email });
  return response.data;
}

export const userService = {
  listUsers,
  changeUserRole,
  setUserStatus,
  createUser,
  updateUser,
};