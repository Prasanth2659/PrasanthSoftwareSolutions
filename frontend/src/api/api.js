import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const login  = (data) => API.post('/api/auth/login', data);
export const getMe  = ()     => API.get('/api/auth/me');
export const logout = ()     => API.post('/api/auth/logout');

// Users
export const getUsers    = ()         => API.get('/api/users');
export const getUserById = (id)       => API.get(`/api/users/${id}`);
export const createUser  = (data)     => API.post('/api/users', data);
export const updateUser  = (id, data) => API.put(`/api/users/${id}`, data);
export const deleteUser  = (id)       => API.delete(`/api/users/${id}`);

// Services
export const getServices   = ()         => API.get('/api/services');
export const createService = (data)     => API.post('/api/services', data);
export const updateService = (id, data) => API.put(`/api/services/${id}`, data);
export const deleteService = (id)       => API.delete(`/api/services/${id}`);

// Companies
export const getCompanies   = ()         => API.get('/api/companies');
export const createCompany  = (data)     => API.post('/api/companies', data);
export const updateCompany  = (id, data) => API.put(`/api/companies/${id}`, data);
export const deleteCompany  = (id)       => API.delete(`/api/companies/${id}`);

// Service Requests
export const getServiceRequests = ()     => API.get('/api/service-requests');
export const createServiceRequest = (data) => API.post('/api/service-requests', data);
export const approveRequest = (id)       => API.put(`/api/service-requests/${id}/approve`);
export const rejectRequest  = (id)       => API.put(`/api/service-requests/${id}/reject`);

// Projects
export const getProjects      = ()            => API.get('/api/projects');
export const getProjectById   = (id)          => API.get(`/api/projects/${id}`);
export const createProject    = (data)        => API.post('/api/projects', data);
export const updateProject    = (id, data)    => API.put(`/api/projects/${id}`, data);
export const assignProject    = (id, data)    => API.put(`/api/projects/${id}/assign`, data);
export const deleteProject    = (id)          => API.delete(`/api/projects/${id}`);

// Messages
export const getConversations = ()       => API.get('/api/messages/conversations');
export const getThread        = (userId) => API.get(`/api/messages/${userId}`);
export const sendMessage      = (data)   => API.post('/api/messages', data);

export default API;
