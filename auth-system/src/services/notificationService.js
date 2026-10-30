import api from './api';

// { count: 3 }: how many support items are new for the signed-in person
export async function getSupportUnreadCount() {
  const response = await api.get('support/unread/');
  return response.data;
}

// Called when the person opens (or leaves) the Support page
export async function markSupportSeen() {
  const response = await api.post('support/seen/');
  return response.data;
}