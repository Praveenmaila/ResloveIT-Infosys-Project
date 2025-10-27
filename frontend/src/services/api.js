import axios from 'axios';

const API_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) => 
    api.post('/auth/login', { username, password }),
  
  signup: (username, email, password, fullName, roles) => 
    api.post('/auth/signup', { username, email, password, fullName, roles }),
};

export const complaintService = {
  createAnonymousComplaint: (formData) => 
    axios.post(`${API_URL}/complaints/anonymous`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  createComplaint: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/complaints`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  getMyComplaints: () => api.get('/complaints/my'),
  
  getAllComplaints: () => api.get('/complaints/admin/all'),
  
  getComplaintById: (id) => api.get(`/complaints/admin/${id}`),
  
  updateComplaintStatus: (id, status) => 
    api.put(`/complaints/admin/${id}/status`, { status }),
  
  addComment: (id, comment) => 
    api.post(`/complaints/admin/${id}/comment`, { comment }),
  
  filterComplaints: (status, category, urgency) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (urgency) params.append('urgency', urgency);
    return api.get(`/complaints/admin/filter?${params.toString()}`);
  },
};

export default api;
