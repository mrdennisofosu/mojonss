import api from './api';

// { support: { count, latest }, announcements: { count, latest } }
export async function getBadges() {
  const response = await api.get('notifications/badges/');
  return response.data;
}

// The signed-in person opened this support request
export async function markSupportRead(id) {
  const response = await api.post(`support/${id}/read/`);
  return response.data;
}