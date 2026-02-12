import axios from 'axios';

const API_URL = 'http://localhost:8000/api';

// Existing api setup
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

// ... existing interceptors and exports ...

// Sandbox API
export const sandboxApi = {
    list: (params) => api.get('/sandboxes', { params }),
    create: (data) => api.post('/sandboxes', data),
    get: (id) => api.get(`/sandboxes/${id}`),
    update: (id, data) => api.put(`/sandboxes/${id}`, data),
    delete: (id) => api.delete(`/sandboxes/${id}`),
    sendMessage: (id, content) => api.post(`/sandboxes/${id}/messages`, { content }),
};
