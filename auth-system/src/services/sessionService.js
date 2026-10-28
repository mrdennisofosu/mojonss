import api from './api';

async function listSessions(userId) {
  console.log('listSessions called with userId:', userId);
  const hasId = userId && userId !== 'undefined';
  const url = hasId ? `sessions/${userId}/` : 'sessions/';
  const response = await api.get(url);
  console.log('listSessions response:', response.data);
  return response.data;
}

async function revokeSession(userId, sessionId) {
  const response = await api.delete(`sessions/revoke/${sessionId}/`);
  return response.data;
}

async function revokeOtherSessions(userId) {
  if (!userId || userId === 'undefined') {
    return { status: 'error', error: 'User ID is required' };
  }
  const response = await api.post(`sessions/${userId}/revoke-others/`);
  return response.data;
}

export { listSessions, revokeSession, revokeOtherSessions };

export const sessionService = {
  listSessions,
  revokeSession,
  revokeOtherSessions,
};