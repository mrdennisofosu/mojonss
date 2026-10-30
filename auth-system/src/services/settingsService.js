import api from './api';

// The backend wraps everything as { settings: { general, registration, ... } }.
// These functions return just the inner object.
export async function getPublicSettings() {
  const response = await api.get('settings/public/');
  return response.data.settings ?? response.data;
}

export async function getSettings() {
  const response = await api.get('settings/');
  return response.data.settings ?? response.data;
}

export async function updateSettings(newSettings, actor) {
  const response = await api.patch('settings/', newSettings);
  return response.data;
}