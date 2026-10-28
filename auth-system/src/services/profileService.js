import api from './api';
import { authService } from './authService';

export async function updateProfile(userId, { fullName, email }) {
  const response = await api.patch(`profile/${userId}/`, { fullName, email });
  return authService.toPublicUser(response.data);
}