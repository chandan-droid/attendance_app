import React, { useState, useEffect } from 'react'
import { BarChart3, Users, Clock, TrendingUp, Calendar, CheckCircle, XCircle, Loader } from 'lucide-react'
import { userAPI, projectAPI, attendanceAPI } from '../../services/api'
import '../employee/AnalyticsTab.css'

const AnalyticsTab = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEmployees: 0,
    activeProjects: 0,
    todayAttendance: 0,
    attendanceRate: 0,
    presentToday: 0,
    absentToday: 0,
    totalHoursToday: 0
  })

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const [usersRes, projectsRes] = await Promise.all([
        userAPI.getAllUsers().catch(() => ({ data: { data: [] } })),
        projectAPI.getAllProjects().catch(() => ({ data: { data: [] } }))
      ])

      const employees = (usersRes?.data?.data || []).filter(u => u.role === 'EMPLOYEE')
      const projects = projectsRes?.data?.data || []
      
      // Fetch all attendance records
      let attendance = []
      let totalHours = 0
      let presentEmployeeIds = new Set()
      
      try {
        const attendanceRes = await attendanceAPI.getAllAttendance()
        attendance = attendanceRes?.data?.data || []
        
        // Filter today's attendance and count unique employees who punched in
        const todayAttendance = attendance.filter(record => {
          if (!record.punchTime) return false
          const punchDate = new Date(record.punchTime).toISOString().split('T')[0]
          return punchDate === today
        })
        
        // Track unique employees who punched in today
        todayAttendance.forEach(record => {
          if (record.punchType === 'IN' && record.userId) {
            presentEmployeeIds.add(record.userId)
          }
        })
        
        // Calculate total hours worked today (only for completed sessions)
        totalHours = todayAttendance.reduce((sum, record) => {
          if (record.punchType === 'OUT' && record.punchTime && record.punchInTime) {
            const checkIn = new Date(record.punchInTime)
            const checkOut = new Date(record.punchTime)
            const hours = (checkOut - checkIn) / (1000 * 60 * 60)
            return sum + hours
          }
          return sum
        }, 0)
      } catch (error) {
        console.log('Attendance endpoint error:', error.message)
      }

      const presentCount = presentEmployeeIds.size
      const attendanceRate = employees.length > 0 
        ? ((presentCount / employees.length) * 100).toFixed(1)
        : 0

      setStats({
        totalEmployees: employees.length,
        activeProjects: projects.length,
        todayAttendance: presentCount,
        attendanceRate,
        presentToday: presentCount,
        absentToday: employees.length - presentCount,
        totalHoursToday: totalHours.toFixed(1)
      })
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Loader className="spinner" size={48} />
        <p>Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="analytics-tab">
      <div className="page-header">
        <h2>Analytics Dashboard</h2>
        <p>Overview of attendance and project statistics</p>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Users size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Employees</h3>
            <div className="summary-value">{stats.totalEmployees}</div>
            <p className="summary-label">Active in system</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <BarChart3 size={24} />
          </div>
          <div className="summary-content">
            <h3>Active Projects</h3>
            <div className="summary-value">{stats.activeProjects}</div>
            <p className="summary-label">Currently running</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Clock size={24} />
          </div>
          <div className="summary-content">
            <h3>Total Hours Today</h3>
            <div className="summary-value">{stats.totalHoursToday}h</div>
            <p className="summary-label">Worked hours</p>
          </div>
        </div>

        <div className="summary-card">
          <div className="summary-icon" style={{ background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="summary-content">
            <h3>Attendance Rate</h3>
            <div className="summary-value">{stats.attendanceRate}%</div>
            <p className="summary-label">Today's attendance</p>
          </div>
        </div>
      </div>

      {/* Today's Attendance Breakdown */}
      <div className="analytics-section">
        <h3 className="section-title">
          <Calendar size={20} />
          Today's Attendance Breakdown
        </h3>
        <div className="attendance-breakdown">
          <div className="breakdown-card present">
            <CheckCircle size={32} />
            <div>
              <div className="breakdown-value">{stats.presentToday}</div>
              <div className="breakdown-label">Present</div>
            </div>
          </div>
          <div className="breakdown-card absent">
            <XCircle size={32} />
            <div>
              <div className="breakdown-value">{stats.absentToday}</div>
              <div className="breakdown-label">Absent</div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="card">
        <div className="empty-state">
          <BarChart3 size={64} />
          <h3>More Analytics Coming Soon</h3>
          <p>Additional charts and insights will be available here</p>
          <p style={{ fontSize: '14px', marginTop: '8px', color: '#718096' }}>
            Future updates will include historical trends, department-wise analytics,
            project progress tracking, and employee performance metrics.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsTab
