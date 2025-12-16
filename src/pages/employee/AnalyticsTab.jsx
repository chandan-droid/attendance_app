import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Clock, Briefcase } from 'lucide-react'
import { attendanceAPI, projectAPI } from '../../services/api'
import './AnalyticsTab.css'

const AnalyticsTab = () => {
  const [projects, setProjects] = useState([])
  const [projectHours, setProjectHours] = useState({})
  const [todayHours, setTodayHours] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [projectsRes, todayRes] = await Promise.all([
        projectAPI.getUserAssignedProjects(),
        attendanceAPI.getTotalHoursForDay(),
      ])

      if (projectsRes.data.success) {
        const projectsList = projectsRes.data.data || []
        setProjects(projectsList)
        
        // Fetch hours for each project
        const hoursData = {}
        for (const project of projectsList) {
          try {
            const hoursRes = await attendanceAPI.getTotalHoursForProject(project.projectId)
            if (hoursRes.data.success) {
              hoursData[project.projectId] = hoursRes.data.data
            }
          } catch (error) {
            console.error(`Error fetching hours for project ${project.projectId}:`, error)
          }
        }
        setProjectHours(hoursData)
      }

      if (todayRes.data.success) {
        setTodayHours(todayRes.data.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTotalHours = () => {
    return Object.values(projectHours).reduce((sum, data) => sum + (data?.totalMinutes || 0), 0)
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics-tab">
      <div className="page-header">
        <h2>Analytics</h2>
        <p>Track your work hours and project contributions</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Clock size={24} />
          </div>
          <div className="summary-content">
            <h3>Today's Hours</h3>
            <div className="summary-value">{todayHours?.formattedTime || '0h 0m'}</div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Hours</h3>
            <div className="summary-value">
              {Math.floor(getTotalHours() / 60)}h {getTotalHours() % 60}m
            </div>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%)' }}>
            <Briefcase size={24} />
          </div>
          <div className="summary-content">
            <h3>Active Projects</h3>
            <div className="summary-value">{projects.length}</div>
          </div>
        </div>
      </div>

      {/* Project Hours Breakdown */}
      <div className="card">
        <div className="card-header">
          <h3>
            <BarChart3 size={20} />
            Hours by Project
          </h3>
        </div>

        {projects.length > 0 ? (
          <div className="projects-list">
            {projects.map((project) => {
              const hours = projectHours[project.projectId]
              const totalMinutes = hours?.totalMinutes || 0
              const percentage = getTotalHours() > 0 
                ? (totalMinutes / getTotalHours()) * 100 
                : 0

              return (
                <div key={project.projectId} className="project-item">
                  <div className="project-header">
                    <div className="project-info">
                      <h4>{project.projectName}</h4>
                      <p>{project.description || 'No description'}</p>
                    </div>
                    <div className="project-hours">
                      <div className="hours-value">{hours?.formattedTime || '0h 0m'}</div>
                      <div className="hours-decimal">{hours?.totalHours?.toFixed(1) || '0.0'} hrs</div>
                    </div>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <div className="project-meta">
                    <span>{percentage.toFixed(1)}% of total time</span>
                    {project.startDate && (
                      <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <Briefcase size={64} />
            <h3>No Projects Assigned</h3>
            <p>You don't have any projects assigned yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AnalyticsTab
