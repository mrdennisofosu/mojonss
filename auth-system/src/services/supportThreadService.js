import api from './api';

// One support request with its replies (the owner or an admin can read it)
export async function getSupportRequest(id) {
  const response = await api.get(`support/${id}/`);
  return response.data;
}