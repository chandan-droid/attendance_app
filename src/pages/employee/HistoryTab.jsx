import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Filter, ChevronDown } from 'lucide-react'
import { attendanceAPI, projectAPI } from '../../services/api'
import { format, parseISO } from 'date-fns'
import './HistoryTab.css'

const HistoryTab = () => {
  const [attendanceHistory, setAttendanceHistory] = useState([])
  const [workSessions, setWorkSessions] = useState([])
  const [projects, setProjects] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterDate, setFilterDate] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [historyRes, sessionsRes, projectsRes] = await Promise.all([
        attendanceAPI.getHistory(),
        attendanceAPI.getWorkSessions(),
        projectAPI.getUserAssignedProjects(),
      ])

      if (historyRes.data.success) {
        setAttendanceHistory(historyRes.data.data || [])
      }
      if (sessionsRes.data.success) {
        setWorkSessions(sessionsRes.data.data || [])
      }
      if (projectsRes.data.success) {
        const projectsList = projectsRes.data.data || []
        setProjects(projectsList)
        
        // Fetch all tasks for all projects
        const tasksPromises = projectsList.map(project => 
          projectAPI.getProjectTasks(project.projectId).catch(() => ({ data: { data: [] } }))
        )
        const tasksResults = await Promise.all(tasksPromises)
        const tasks = tasksResults.flatMap(res => res.data.data || [])
        setAllTasks(tasks)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = attendanceHistory.filter((record) => {
    const recordDate = format(parseISO(record.punchTime), 'yyyy-MM-dd')
    
    if (filterDate && recordDate !== filterDate) {
      return false
    }
    
    if (filterType !== 'all' && record.punchType !== filterType) {
      return false
    }
    
    return true
  })

  const groupByDate = (records) => {
    const grouped = {}
    records.forEach((record) => {
      const date = format(parseISO(record.punchTime), 'yyyy-MM-dd')
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(record)
    })
    return grouped
  }

  const groupedHistory = groupByDate(filteredHistory)
  const dates = Object.keys(groupedHistory).sort().reverse()

  const getProjectName = (projectId) => {
    const project = projects.find(p => p.projectId === projectId)
    return project ? `${project.projectName} (${projectId})` : `Project ${projectId}`
  }

  const getTaskName = (taskId) => {
    const task = allTasks.find(t => t.taskId === taskId)
    return task ? `${task.taskName} (${taskId})` : `Task ${taskId}`
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading attendance history...</p>
      </div>
    )
  }

  return (
    <div className="history-tab">
      <div className="page-header">
        <h2>Attendance History</h2>
        <p>View your detailed attendance records and work sessions</p>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label>
              <Calendar size={18} />
              Filter by Date
            </label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="form-group">
            <label>
              <Filter size={18} />
              Filter by Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-input"
            >
              <option value="all">All Records</option>
              <option value="IN">Punch In Only</option>
              <option value="OUT">Punch Out Only</option>
            </select>
          </div>

          {(filterDate || filterType !== 'all') && (
            <button
              onClick={() => {
                setFilterDate('')
                setFilterType('all')
              }}
              className="btn-clear"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Attendance Records */}
      {dates.length > 0 ? (
        <div className="history-list">
          {dates.map((date) => (
            <div key={date} className="card date-group">
              <div className="date-header">
                <Calendar size={20} />
                <h3>{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</h3>
                <span className="record-count">
                  {groupedHistory[date].length} record{groupedHistory[date].length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="records-list">
                {groupedHistory[date].map((record) => (
                  <div key={record.attendanceId} className="record-item">
                    <div className="record-icon">
                      <Clock size={20} />
                    </div>
                    <div className="record-details">
                      <div className="record-time">
                        {format(parseISO(record.punchTime), 'h:mm a')}
                      </div>
                      <div className="record-meta">
                        {record.projectId ? getProjectName(record.projectId) : 'No Project'}
                        {record.taskId && ` • ${getTaskName(record.taskId)}`}
                      </div>
                      {record.latitude && record.longitude && (
                        <div className="record-location">
                          📍 {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                        </div>
                      )}
                    </div>
                    <div className={`punch-badge punch-${record.punchType.toLowerCase()}`}>
                      {record.punchType}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No Records Found</h3>
          <p>No attendance records match your filter criteria</p>
        </div>
      )}

      {/* Work Sessions Summary */}
      {workSessions.length > 0 && (
        <div className="card sessions-card">
          <h3>Recent Work Sessions</h3>
          <div className="sessions-list">
            {workSessions.slice(0, 10).map((session) => (
              <div key={session.sessionId} className="session-item">
                <div className="session-info">
                  <div className="session-project">
                    {session.projectId ? getProjectName(session.projectId) : 'No Project'}
                    {session.taskId && ` • ${getTaskName(session.taskId)}`}
                  </div>
                  <div className="session-duration">
                    Duration: {Math.floor(session.durationMinutes / 60)}h {session.durationMinutes % 60}m
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default HistoryTab
