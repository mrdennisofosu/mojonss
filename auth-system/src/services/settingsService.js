import api from './api';

export async function getPublicSettings() {
  const response = await api.get('settings/public/');
  return response.data;
}

export async function getSettings() {
  const response = await api.get('settings/');
  return response.data;
}

export async function updateSettings(newSettings, actor) {
  const response = await api.patch('settings/', newSettings);
  return response.data;
}