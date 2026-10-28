import api from './api';

export async function listSupportRequests({ search = '', status = '', page = 1, pageSize = 8 } = {}) {
  const response = await api.get('support/', {
    params: { search, status, page, pageSize }
  });
  return response.data;
}

export async function replyToRequest(id, message, author) {
  const response = await api.post(`support/${id}/reply/`, { message });
  return response.data;
}

export async function updateRequestStatus(id, status, actor) {
  const response = await api.patch(`support/${id}/status/`, { status });
  return response.data;
}


export async function listMyRequests() {
  const response = await api.get('support/my/');
  return response.data.items; // backend wraps the list in { items, total }
}

export async function createSupportRequest({ subject, message }, user) {
  const response = await api.post('support/', { subject, message });
  return response.data;
}

export async function sendQuickReply(id, presetId, user) {
  const response = await api.post(`support/${id}/quick-reply/`, { presetId });
  return response.data;
}

