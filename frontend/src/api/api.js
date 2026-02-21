import axios from 'axios';

// Create the Axios Instance
const axiosInstance = axios.create();

// Centralized Monolith Port
const API_PORT = import.meta.env.VITE_API_URL ? new URL(import.meta.env.VITE_API_URL).port : 5000;

// Intercept requests to dynamically set the baseURL and attach token
axiosInstance.interceptors.request.use((config) => {
  // 1. Attach JWT token dynamically
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Point to the single Modular Monolith Backend
  const host = window.location.hostname;
  
  // If VITE_API_URL is fully defined (like in production Vercel pointing to Render) use it
  if (import.meta.env.VITE_API_URL) {
    config.baseURL = import.meta.env.VITE_API_URL;
  } else {
    // Local dev fallback
    config.baseURL = `http://${host}:${API_PORT}`;
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default axiosInstance;

// ================================
// API Call Definitions
// ================================

// Auth
export const login  = (data) => axiosInstance.post('/api/auth/login', data);
export const getMe  = ()     => axiosInstance.get('/api/auth/me');
export const logout = ()     => axiosInstance.post('/api/auth/logout');

// Users
export const getUsers    = ()         => axiosInstance.get('/api/users');
export const getUserById = (id)       => axiosInstance.get(`/api/users/${id}`);
export const createUser  = (data)     => axiosInstance.post('/api/users', data);
export const updateUser  = (id, data) => axiosInstance.put(`/api/users/${id}`, data);
export const deleteUser  = (id)       => axiosInstance.delete(`/api/users/${id}`);

// Services
export const getServices   = ()         => axiosInstance.get('/api/services');
export const createService = (data)     => axiosInstance.post('/api/services', data);
export const updateService = (id, data) => axiosInstance.put(`/api/services/${id}`, data);
export const deleteService = (id)       => axiosInstance.delete(`/api/services/${id}`);

// Companies
export const getCompanies   = ()         => axiosInstance.get('/api/companies');
export const createCompany  = (data)     => axiosInstance.post('/api/companies', data);
export const updateCompany  = (id, data) => axiosInstance.put(`/api/companies/${id}`, data);
export const deleteCompany  = (id)       => axiosInstance.delete(`/api/companies/${id}`);

// Service Requests
export const getServiceRequests = ()     => axiosInstance.get('/api/service-requests');
export const createServiceRequest = (data) => axiosInstance.post('/api/service-requests', data);
export const approveRequest = (id)       => axiosInstance.put(`/api/service-requests/${id}/approve`);
export const rejectRequest  = (id)       => axiosInstance.put(`/api/service-requests/${id}/reject`);

// Projects
export const getProjects      = ()            => axiosInstance.get('/api/projects');
export const getProjectById   = (id)          => axiosInstance.get(`/api/projects/${id}`);
export const createProject    = (data)        => axiosInstance.post('/api/projects', data);
export const updateProject    = (id, data)    => axiosInstance.put(`/api/projects/${id}`, data);
export const assignProject    = (id, data)    => axiosInstance.put(`/api/projects/${id}/assign`, data);
export const deleteProject    = (id)          => axiosInstance.delete(`/api/projects/${id}`);
export const uploadProjectFiles = (id, formData) => axiosInstance.post(`/api/projects/${id}/files`, formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const addProjectPayment  = (id, data) => axiosInstance.put(`/api/projects/${id}/payments`, data);
export const createRazorpayOrder = (id) => axiosInstance.post(`/api/projects/${id}/razorpay-order`);
export const verifyRazorpayPayment = (id, data) => axiosInstance.post(`/api/projects/${id}/razorpay-verify`, data);

// Messages
export const getConversations = ()       => axiosInstance.get('/api/messages/conversations');
export const getThread        = (userId) => axiosInstance.get(`/api/messages/${userId}`);
export const sendMessage      = (data)   => axiosInstance.post('/api/messages', data);
