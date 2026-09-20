import api from './api';

export const authService = {
  register: (payload: { name: string; email: string; password: string }) =>
    api.post('/auth/register', payload),
  login: (payload: { email: string; password: string }) => api.post('/auth/login', payload),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
  verifyEmail: (token: string) => api.post('/auth/verify-email', { token }),
};
