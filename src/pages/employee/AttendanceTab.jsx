import React, { useState, useEffect } from 'react'
import { MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { attendanceAPI, projectAPI, geofenceAPI } from '../../services/api'
import GeofenceMap from '../../components/GeofenceMap'
import './AttendanceTab.css'

const AttendanceTab = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [location, setLocation] = useState(null)
  const [geofences, setGeofences] = useState([])
  const [isWithinGeofence, setIsWithinGeofence] = useState(false)
  const [currentSession, setCurrentSession] = useState(null)
  const [todayHours, setTodayHours] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchProjects()
    fetchGeofences()
    fetchTodayHours()
    fetchCurrentSession()
    getCurrentLocation()
  }, [])

  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject)
    } else {
      setTasks([])
      setSelectedTask('')
    }
  }, [selectedProject])

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }
          setLocation(loc)
        },
        (error) => {
          console.error('Error getting location:', error)
          setError('Unable to get your location. Please enable location services.')
        }
      )
    }
  }

  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getUserAssignedProjects()
      if (response.data.success) {
        setProjects(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchTasks = async (projectId) => {
    try {
      const response = await projectAPI.getProjectTasks(projectId)
      if (response.data.success) {
        setTasks(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchCurrentSession = async () => {
    try {
      const response = await attendanceAPI.getHistory()
      if (response.data.success) {
        const sessions = response.data.data || []
        // Find the most recent active session (punched in but not out)
        const activeSession = sessions.find(
          s => s.punchType === 'IN' && !s.punchOutTime
        )
        setCurrentSession(activeSession || null)
        
        // Restore project and task selection from active session
        if (activeSession) {
          if (activeSession.projectId) {
            setSelectedProject(activeSession.projectId)
            // Fetch tasks for the project to populate the task name
            if (activeSession.taskId) {
              fetchTasks(activeSession.projectId).then(() => {
                setSelectedTask(activeSession.taskId)
              })
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching current session:', error)
    }
  }

  const fetchGeofences = async () => {
    try {
      const response = await geofenceAPI.getAllGeofences()
      if (response.data.success) {
        setGeofences(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching geofences:', error)
    }
  }

  const fetchTodayHours = async () => {
    try {
      const response = await attendanceAPI.getTotalHoursForDay()
      if (response.data.success) {
        setTodayHours(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching today hours:', error)
    }
  }

  const checkGeofence = () => {
    if (!location || geofences.length === 0) return false

    for (const geofence of geofences) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(geofence.latitude),
        parseFloat(geofence.longitude)
      )
      if (distance <= geofence.radiusMeters) {
        return true
      }
    }
    return false
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  const handlePunchIn = async () => {
    setError('')
    setSuccess('')

    if (!location) {
      setError('Please enable location services.')
      return
    }

    // Check geofence for ONSITE workers
    if (user?.workMode === 'ONSITE') {
      const withinGeofence = checkGeofence()
      setIsWithinGeofence(withinGeofence)
      
      if (!withinGeofence) {
        setError('You are not within the designated work location.')
        return
      }
    }

    if (!selectedProject) {
      setError('Please select a project.')
      return
    }

    setLoading(true)
    try {
      const response = await attendanceAPI.punchIn({
        punchType: 'IN',
        projectId: selectedProject,
        taskId: selectedTask || null,
        latitude: location.latitude,
        longitude: location.longitude,
      })

      if (response.data.success) {
        setSuccess('Punched in successfully!')
        setCurrentSession(response.data.data)
        fetchTodayHours()
        // Keep the selected project and task for the active session display
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to punch in')
    } finally {
      setLoading(false)
    }
  }

  const handlePunchOut = async () => {
    setError('')
    setSuccess('')

    if (!location) {
      setError('Please enable location services.')
      return
    }

    setLoading(true)
    try {
      const response = await attendanceAPI.punchOut({
        punchType: 'OUT',
        latitude: location.latitude,
        longitude: location.longitude,
      })

      if (response.data.success) {
        setSuccess('Punched out successfully!')
        setCurrentSession(null)
        setSelectedProject('')
        setSelectedTask('')
        fetchTodayHours()
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to punch out')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="attendance-tab">
      <div className="page-header">
        <h2>Attendance</h2>
        <p>Mark your attendance and track your work hours</p>
      </div>

      {error && (
        <div className="alert alert-error">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      <div className="attendance-grid">
        {/* User Info Card */}
        <div className="card info-card">
          <h3>Your Details</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-label">Name:</span>
              <span className="info-value">{user?.name}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Employee ID:</span>
              <span className="info-value">{user?.employeeId}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Work Mode:</span>
              <span className={`badge badge-${user?.workMode?.toLowerCase()}`}>
                {user?.workMode}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Today's Hours:</span>
              <span className="info-value">
                {todayHours?.formattedTime || '0h 0m'}
              </span>
            </div>
          </div>
        </div>

        {/* Location & Geofence */}
        {user?.workMode === 'ONSITE' && (
          <div className="card map-card">
            <h3>Location Verification</h3>
            {location ? (
              <>
                <GeofenceMap
                  userLocation={location}
                  geofences={geofences}
                  onGeofenceCheck={setIsWithinGeofence}
                />
                <div className="location-status">
                  {isWithinGeofence || checkGeofence() ? (
                    <div className="status-badge status-success">
                      <CheckCircle size={18} />
                      <span>Within Work Location</span>
                    </div>
                  ) : (
                    <div className="status-badge status-error">
                      <XCircle size={18} />
                      <span>Outside Work Location</span>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="location-loading">
                <MapPin size={32} />
                <p>Getting your location...</p>
              </div>
            )}
          </div>
        )}

        {/* Punch Form */}
        <div className="card punch-card">
          <h3>Mark Attendance</h3>
          <div className="punch-form">
            {!currentSession && (
              <>
                <div className="form-group">
                  <label>Project *</label>
                  <select
                    value={selectedProject}
                    onChange={(e) => setSelectedProject(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.projectId} value={project.projectId}>
                        {project.projectName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Task (Optional)</label>
                  <select
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                    disabled={loading || !selectedProject}
                  >
                    <option value="">Select a task</option>
                    {tasks.map((task) => (
                      <option key={task.taskId} value={task.taskId}>
                        {task.taskName}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {currentSession ? (
              <div className="active-session-card">
                <div className="session-status">
                  <div className="status-indicator status-active">
                    <div className="pulse-dot"></div>
                    <span>Currently Punched In</span>
                  </div>
                </div>
                <div className="session-details">
                  <div className="session-detail-item">
                    <Clock size={18} />
                    <div>
                      <span className="detail-label">Punch In Time</span>
                      <span className="detail-value">
                        {new Date(currentSession.punchTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <div className="session-detail-item">
                    <MapPin size={18} />
                    <div>
                      <span className="detail-label">Location</span>
                      <span className="detail-value">
                        {currentSession.latitude?.toFixed(4)}, {currentSession.longitude?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                  {selectedProject && (
                    <div className="session-detail-item">
                      <CheckCircle size={18} />
                      <div>
                        <span className="detail-label">Project</span>
                        <span className="detail-value">
                          {projects.find(p => p.projectId == selectedProject)?.projectName || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  )}
                  {selectedTask && (
                    <div className="session-detail-item">
                      <CheckCircle size={18} />
                      <div>
                        <span className="detail-label">Task</span>
                        <span className="detail-value">
                          {tasks.find(t => t.taskId == selectedTask)?.taskName || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="inactive-session-card">
                <div className="session-status">
                  <div className="status-indicator status-inactive">
                    <span>Not Punched In</span>
                  </div>
                </div>
                <p className="session-hint">Click the button below to mark your attendance</p>
              </div>
            )}

            <div className="punch-buttons">
              {!currentSession ? (
                <button
                  onClick={handlePunchIn}
                  disabled={loading || !selectedProject}
                  className="btn-punch btn-punch-in"
                >
                  <CheckCircle size={20} />
                  {loading ? 'Processing...' : 'Punch In'}
                </button>
              ) : (
                <button
                  onClick={handlePunchOut}
                  disabled={loading}
                  className="btn-punch btn-punch-out"
                >
                  <XCircle size={20} />
                  {loading ? 'Processing...' : 'Punch Out'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AttendanceTab
