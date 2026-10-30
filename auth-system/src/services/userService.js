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

// Admin only. The backend creates the account with a random temporary password
// and returns it once: { user: {...}, temporaryPassword: "..." }
async function createUser({ fullName, email, role }) {
  const response = await api.post('users/create/', { fullName, email, role });
  return response.data;
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