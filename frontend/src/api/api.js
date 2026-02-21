import axios from 'axios';

// Create the Axios Instance
const axiosInstance = axios.create();

// Map of route prefixes to their respective microservice ports
const servicePorts = {
  '/api/auth': 5001,
  '/api/users': 5002,
  '/api/projects': 5003,
  '/api/services': 5004,
  '/api/companies': 5004,
  '/api/service-requests': 5005,
  '/api/messages': 5006,
};

// Intercept requests to dynamically set the baseURL and attach token
axiosInstance.interceptors.request.use((config) => {
  // 1. Attach JWT token dynamically
  const token = localStorage.getItem('token');
  if (token) {
    // In newer Axios versions, config.headers is an AxiosHeaders object.
    // Re-assigning it with spread syntax destroys the class instance.
    // Use .set() or direct property assignment instead.
    config.headers.Authorization = `Bearer ${token}`;
  }

  // 2. Dynamically set the correct Base URL depending on the route path
  const host = window.location.hostname;
  for (const [prefix, port] of Object.entries(servicePorts)) {
    if (config.url.startsWith(prefix)) {
      config.baseURL = `http://${host}:${port}`;
      break;
    }
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

// Messages
export const getConversations = ()       => axiosInstance.get('/api/messages/conversations');
export const getThread        = (userId) => axiosInstance.get(`/api/messages/${userId}`);
export const sendMessage      = (data)   => axiosInstance.post('/api/messages', data);
