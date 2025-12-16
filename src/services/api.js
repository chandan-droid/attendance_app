import axios from 'axios'

const API_BASE_URL = 'https://attendance-server-fvvv.onrender.com/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Auth APIs
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
}

// User APIs
export const userAPI = {
  getCurrentUser: () => api.get('/users/me'),
  getAllUsers: () => api.get('/users'),
  updateWorkMode: (userId, workMode) => api.put(`/users/${userId}/work-mode?workMode=${workMode}`),
}

// Attendance APIs
export const attendanceAPI = {
  punchIn: (data) => api.post('/attendance/punch-in', data),
  punchOut: (data) => api.post('/attendance/punch-out', data),
  getHistory: () => api.get('/attendance/history'),
  getWorkSessions: () => api.get('/attendance/work-sessions'),
  getTotalHoursForProject: (projectId) => api.get(`/attendance/total-hours/project/${projectId}`),
  getTotalHoursForDay: (date) => api.get(`/attendance/total-hours/day${date ? `?date=${date}` : ''}`),
  getAttendanceByDate: (date) => api.get(`/attendance/date/${date}`), // Admin: get all attendance for a specific date
  getAllAttendance: () => api.get('/attendance/all'), // Admin: get all attendance records
}

// Project APIs
export const projectAPI = {
  createProject: (data) => api.post('/projects', data),
  getAllProjects: () => api.get('/projects'),
  getUserAssignedProjects: () => api.get('/projects/assigned'),
  assignProjectToUser: (projectId, userId) => api.post(`/projects/${projectId}/assign/${userId}`),
  createTask: (data) => api.post('/projects/tasks', data),
  getProjectTasks: (projectId) => api.get(`/projects/${projectId}/tasks`),
  getAllProjectTasks: (projectId) => api.get(`/projects/${projectId}/tasks/all`), // Admin endpoint
  getAllTasks: () => api.get('/projects/tasks/all'), // Admin: get all tasks across all projects
}

// Geofence APIs
export const geofenceAPI = {
  createGeofence: (data) => api.post('/geofence', data),
  getAllGeofences: () => api.get('/geofence'),
}

// Leave APIs
export const leaveAPI = {
  applyLeave: (data) => api.post('/leaves/apply', data),
  getMyLeaves: () => api.get('/leaves/my'),
  getAllLeaves: () => api.get('/leaves/all'), // Admin: get all leaves
  approveLeave: (id, data) => api.put(`/leaves/${id}/approve`, data),
}

// Attendance Query APIs
export const attendanceQueryAPI = {
  raiseQuery: (data) => api.post('/attendance/query', data),
  getMyQueries: () => api.get('/attendance/query/my'),
  getAllQueries: () => api.get('/attendance/query/all'), // Admin: get all queries
  approveQuery: (id, data) => api.put(`/attendance/query/${id}/approve`, data),
}

export default api
