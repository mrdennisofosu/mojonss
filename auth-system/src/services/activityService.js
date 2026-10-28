import api from './api';

export async function listActivities({ search = '', group = '', from = '', to = '', page = 1, pageSize = 10 } = {}) {
  const response = await api.get('activity-logs/', {
    params: { search, group, from, to, page, pageSize }
  });
  return response.data;
}

export async function listRecentActivityForUser(email, limit = 5) {
  const response = await api.get(`activity/recent/${email}/`, { params: { limit } });
  return response.data;
}

export async function listFailedSignInsForUser(email, limit = 5) {
  const response = await api.get(`activity/failed/${email}/`, { params: { limit } });
  return response.data;
}