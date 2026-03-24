import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("mentra_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    // Detect Pomodoro animation triggers
    const url = response.config.url;
    if (url?.includes('/pomodoro/') && response.config.method === 'post') {
      if (url.includes('/pause')) {
        localStorage.setItem('pom-pending-anim', JSON.stringify({ type: 'paused', timestamp: Date.now() }));
      } else if (url.includes('/resume')) {
        localStorage.setItem('pom-pending-anim', JSON.stringify({ type: 'resumed', timestamp: Date.now() }));
      } else if (url.includes('/cancel')) {
        localStorage.setItem('pom-pending-anim', JSON.stringify({ type: 'stopped', timestamp: Date.now() }));
      }
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("mentra_token");
      localStorage.removeItem("mentra_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Auth
export const authApi = {
  register: (data) => api.post("/register", data),
  login: (data) => api.post("/login", data),
  logout: () => api.post("/logout"),
  me: () => api.get("/me"),
  sendOtp: (email) => api.post("/auth/send-otp", { email }),
  verifyOtp: (email, code) => api.post("/auth/verify-otp", { email, code }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (data) => api.post("/auth/reset-password", data),
};

// Dashboard
export const dashboardApi = {
  get: () => api.get("/dashboard"),
};

// Tasks
export const taskApi = {
  list: (params) => api.get("/tasks", { params }),
  create: (data) => api.post("/tasks", data),
  show: (id) => api.get(`/tasks/${id}`),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
  complete: (id) => api.post(`/tasks/${id}/complete`),
  uncomplete: (id) => api.post(`/tasks/${id}/uncomplete`),
};

// Pomodoro
export const pomodoroApi = {
  list: (params) => api.get("/pomodoro", { params }),
  stats: () => api.get("/pomodoro/stats"),
  start: (data) => api.post("/pomodoro/start", data),
  pause: (id) => api.post(`/pomodoro/${id}/pause`),
  resume: (id) => api.post(`/pomodoro/${id}/resume`),
  complete: (id) => api.post(`/pomodoro/${id}/complete`),
  cancel: (id) => api.post(`/pomodoro/${id}/cancel`),
};

// Schedules
export const scheduleApi = {
  list: (params) => api.get("/schedules", { params }),
  create: (data) => api.post("/schedules", data),
  show: (id) => api.get(`/schedules/${id}`),
  update: (id, data) => api.put(`/schedules/${id}`, data),
  delete: (id) => api.delete(`/schedules/${id}`),
  complete: (id) => api.post(`/schedules/${id}/complete`),
  uncomplete: (id) => api.post(`/schedules/${id}/uncomplete`),
};

// Moods
export const moodApi = {
  list: (params) => api.get("/moods", { params }),
  create: (data) => api.post("/moods", data),
  today: () => api.get("/moods/today"),
  weekly: () => api.get("/moods/weekly"),
};

// AI Chat
export const chatApi = {
  send: (message) => api.post("/chat/send", { message }),
  history: (params) => api.get("/chat/history", { params }),
  clear: () => api.delete("/chat/clear"),
};

// Sandboxes
export const sandboxApi = {
  list: (params) => api.get("/sandboxes", { params }),
  create: (data) => api.post("/sandboxes", data),
  get: (id) => api.get(`/sandboxes/${id}`),
  update: (id, data) => api.put(`/sandboxes/${id}`, data),
  delete: (id) => api.delete(`/sandboxes/${id}`),
  sendMessage: (id, content) =>
    api.post(`/sandboxes/${id}/messages`, { content }),
};

// Agent API (LangChain Tools)
export const agentApi = {
  vectorSearch: (query, limit = 3) =>
    api.post("/agent/vector-search", { query, limit }),
  createTask: (data) => api.post("/agent/tasks", data),
  addKnowledge: (content, source = "user_note", metadata = {}) =>
    api.post("/agent/knowledge", { content, source, metadata }),
};

// Quiz API
export const quizApi = {
  get: (taskId) => api.get(`/tasks/${taskId}/quiz`),
  save: (taskId, questions, material = null) =>
    api.post(`/tasks/${taskId}/quiz`, { questions, material }),
  attempt: (taskId, score, total, answers = null) =>
    api.post(`/tasks/${taskId}/quiz/attempt`, { score, total, answers }),
};

// Chat Sessions API
export const chatSessionApi = {
  list: () => api.get("/chat-sessions"),
  create: (data) => api.post("/chat-sessions", data),
  get: (id) => api.get(`/chat-sessions/${id}`),
  update: (id, data) => api.put(`/chat-sessions/${id}`, data),
  delete: (id) => api.delete(`/chat-sessions/${id}`),
  storeMessage: (id, data) => api.post(`/chat-sessions/${id}/messages`, data),
  getMessages: (id) => api.get(`/chat-sessions/${id}/messages`),
  clearMessages: (id) => api.delete(`/chat-sessions/${id}/messages`),
};

// Forum Posts API
export const forumPostApi = {
  list: () => api.get("/posts"),
  create: (data) => api.post("/posts", data),
  update: (id, data) => api.put(`/posts/${id}`, data),
  delete: (id) => api.delete(`/posts/${id}`),
};

// User Profile API
export const profileApi = {
  update: (data) => api.put("/user/profile", data),
  deleteAccount: (confirm) => api.delete("/user/account", { data: { confirm } }),
};

// Forest API (Tree Care)
export const forestApi = {
  getForest: () => api.get("/forest"),
  plantTree: (treeTypeId) => api.post("/forest/plant", { tree_type_id: treeTypeId }),
  waterTree: (treeId) => api.post(`/forest/water/${treeId}`),
  getTreeTypes: () => api.get("/forest/tree-types"),
  debugSkipStage: (treeId) => api.post(`/forest/debug/skip-stage/${treeId}`),
};

export default api;
