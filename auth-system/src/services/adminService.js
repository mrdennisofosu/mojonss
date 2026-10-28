import api from './api';

export async function getOverview() {
  const response = await api.get('admin/overview/');
  return response.data;
}