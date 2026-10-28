import api from './api';

// export async function getPublishedAnnouncements({ limit } = {}) {
//   const response = await api.get('announcements/published/', { params: { limit } });
//   return response.data;
// }

export async function getPublishedAnnouncements({ limit } = {}) {
  const response = await api.get('announcements/published/', { params: { limit } });
  return response.data.items; // the backend wraps the list in { items, total }
}

export async function getPublishedAnnouncement(id) {
  const response = await api.get(`announcements/published/${id}/`);
  return response.data;
}

export async function listAnnouncements({ search = '', status = '', page = 1, pageSize = 8 } = {}) {
  const response = await api.get('announcements/', {
    params: { search, status, page, pageSize }
  });
  return response.data;
}

export async function createAnnouncement({ title, content, publish }, actor) {
  const response = await api.post('announcements/', { title, content, publish });
  return response.data;
}

export async function updateAnnouncement(id, { title, content }, actor) {
  const response = await api.patch(`announcements/${id}/`, { title, content });
  return response.data;
}

export async function setAnnouncementPublished(id, published, actor) {
  const response = await api.patch(`announcements/${id}/publish/`, { published });
  return response.data;
}

export async function deleteAnnouncement(id, actor) {
  const response = await api.delete(`announcements/${id}/`);
  return response.data;
}

// export async function getAnnouncementTeasers({ limit } = {}) {
//   const response = await api.get('announcements/teasers/', { params: { limit } });
//   return response.data;
// }

export async function getAnnouncementTeasers({ limit } = {}) {
  const response = await api.get('announcements/teasers/', { params: { limit } });
  return response.data.items;
}