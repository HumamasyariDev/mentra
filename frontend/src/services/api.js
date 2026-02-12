import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mentra_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('mentra_token');
      localStorage.removeItem('mentra_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const authApi = {
  register: (data) => api.post('/register', data),
  login: (data) => api.post('/login', data),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get('/dashboard'),
};

// Tasks
export const taskApi = {
  list: (params) => api.get('/tasks', { params }),
  create: (data) => api.post('/tasks', data),
  show: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.post(`/tasks/${id}/complete`),
  uncomplete: (id) => api.post(`/tasks/${id}/uncomplete`),
};

// Pomodoro
export const pomodoroApi = {
  list: (params) => api.get('/pomodoro', { params }),
  stats: () => api.get('/pomodoro/stats'),
  start: (data) => api.post('/pomodoro/start', data),
  pause: (id) => api.post(`/pomodoro/${id}/pause`),
  resume: (id) => api.post(`/pomodoro/${id}/resume`),
  complete: (id) => api.post(`/pomodoro/${id}/complete`),
  cancel: (id) => api.post(`/pomodoro/${id}/cancel`),
};

// Schedules
export const scheduleApi = {
  list: (params) => api.get('/schedules', { params }),
  create: (data) => api.post('/schedules', data),
  show: (id) => api.get(`/schedules/${id}`),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  complete: (id) => api.post(`/schedules/${id}/complete`),
  uncomplete: (id) => api.post(`/schedules/${id}/uncomplete`),
};

// Moods
export const moodApi = {
  list: (params) => api.get('/moods', { params }),
  create: (data) => api.post('/moods', data),
  today: () => api.get('/moods/today'),
  weekly: () => api.get('/moods/weekly'),
};

// AI Chat
export const chatApi = {
  send: (message) => api.post('/chat/send', { message }),
  history: (params) => api.get('/chat/history', { params }),
  clear: () => api.delete('/chat/clear'),
};

export default api;
