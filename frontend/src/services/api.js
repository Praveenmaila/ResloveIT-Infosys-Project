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
  // Complaint submission
  createAnonymousComplaint: (formData) => 
    axios.post(`${API_URL}/complaints/submit/anonymous`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  
  createComplaint: (formData) => {
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/complaints/submit`, formData, {
      headers: { 
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  },
  
  // Complaint management
  assignComplaint: (id, assignRequest) => 
    api.put(`/complaints/assign/${id}`, assignRequest),
  
  unassignComplaint: (id) => 
    api.put(`/complaints/unassign/${id}`),
  
  updateDeadline: (id, deadlineRequest) => 
    api.put(`/complaints/deadline/${id}`, deadlineRequest),
  
  markCompleted: (id) => 
    api.put(`/complaints/complete/${id}`),
  
  markResolved: (id) => 
    api.put(`/complaints/resolve/${id}`),
  
  editComplaint: (id, updateRequest) => 
    api.put(`/complaints/edit/${id}`, updateRequest),
  
  updateComplaintStatus: (id, status) => 
    api.put(`/complaints/status/${id}`, { status }),
  
  // Information retrieval
  getMyComplaints: () => api.get('/complaints/my'),
  
  getAssignedComplaints: () => api.get('/complaints/assigned'),
  
  getAllComplaints: () => api.get('/complaints/admin/all'),
  
  getPublicComplaints: () => api.get('/complaints/public'),
  
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  
  getComplaintTimeline: (id, includeInternal = false) => 
    api.get(`/complaints/${id}/timeline?includeInternal=${includeInternal}`),
  
  filterComplaints: (status, category, urgency) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (category) params.append('category', category);
    if (urgency) params.append('urgency', urgency);
    return api.get(`/complaints/filter?${params.toString()}`);
  },
  
  // Internal notes
  addInternalNote: (id, noteRequest) => 
    api.post(`/complaints/notes/${id}`, noteRequest),
  
  getInternalNotes: (id) => 
    api.get(`/complaints/notes/${id}`),
  
  // Officers management
  getAllOfficers: () => api.get('/complaints/officers'),
};

export default api;
