import React, { useState, useEffect } from 'react'
import { Calendar, Plus, Clock, CheckCircle, XCircle, AlertCircle, Filter } from 'lucide-react'
import { leaveAPI } from '../../services/api'
import { format, parseISO, differenceInDays, isBefore, isAfter } from 'date-fns'
import './LeavesTab.css'

const LeavesTab = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all') // all, past, upcoming
  
  const [form, setForm] = useState({
    startDate: '',
    endDate: '',
    reason: '',
  })

  useEffect(() => {
    fetchLeaves()
  }, [])

  const fetchLeaves = async () => {
    setLoading(true)
    try {
      const response = await leaveAPI.getMyLeaves()
      if (response && response.data) {
        setLeaves(Array.isArray(response.data) ? response.data : [])
      } else {
        setLeaves([])
      }
    } catch (error) {
      console.error('Error fetching leaves:', error)
      setLeaves([])
      setMessage({ type: 'error', text: 'Failed to load leaves. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Calculate duration
      const start = new Date(form.startDate)
      const end = new Date(form.endDate)
      const duration = differenceInDays(end, start) + 1

      if (duration <= 0) {
        setMessage({ type: 'error', text: 'End date must be after or equal to start date' })
        return
      }

      const leaveData = {
        startDate: form.startDate,
        endDate: form.endDate,
        duration: duration,
        reason: form.reason,
        status: 'PENDING',
        appliedAt: new Date().toISOString(),
      }
      
      await leaveAPI.applyLeave(leaveData)
      setMessage({ type: 'success', text: 'Leave application submitted successfully!' })
      setShowModal(false)
      setForm({ startDate: '', endDate: '', reason: '' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      fetchLeaves()
    } catch (error) {
      console.error('Error applying leave:', error)
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Failed to apply leave. Please try again.' })
    }
  }

  const getLeaveStatus = (leave) => {
    if (!leave || !leave.startDate || !leave.endDate || !leave.status) {
      return 'pending'
    }
    
    try {
      const today = new Date()
      const startDate = parseISO(leave.startDate)
      const endDate = parseISO(leave.endDate)

      if (leave.status === 'REJECTED') return 'rejected'
      if (leave.status === 'PENDING') return 'pending'
      if (isAfter(today, endDate)) return 'completed'
      if (isBefore(today, startDate)) return 'upcoming'
      return 'active'
    } catch (error) {
      console.error('Error in getLeaveStatus:', error)
      return 'pending'
    }
  }

  const filteredLeaves = leaves.filter((leave) => {
    if (!leave) return false
    
    try {
      const leaveStatus = getLeaveStatus(leave)
      
      // Filter by approval status
      if (filterStatus !== 'all' && leave.status !== filterStatus) {
        return false
      }
      
      // Filter by time period
      if (filterType === 'past' && (leaveStatus === 'upcoming' || leaveStatus === 'active')) {
        return false
      }
      if (filterType === 'upcoming' && (leaveStatus === 'completed' || leaveStatus === 'rejected')) {
        return false
      }
      
      return true
    } catch (error) {
      console.error('Error filtering leave:', error)
      return false
    }
  })

  const getStatusBadge = (status) => {
    const badges = {
      PENDING: { class: 'pending', icon: Clock, text: 'Pending' },
      APPROVED: { class: 'approved', icon: CheckCircle, text: 'Approved' },
      REJECTED: { class: 'rejected', icon: XCircle, text: 'Rejected' },
    }
    const badge = badges[status] || badges.PENDING
    const Icon = badge.icon
    
    return (
      <span className={`status-badge status-${badge.class}`}>
        <Icon size={14} />
        {badge.text}
      </span>
    )
  }

  const getLeaveTypeBadge = (leave) => {
    const status = getLeaveStatus(leave)
    const badges = {
      upcoming: { class: 'upcoming', text: '📅 Upcoming' },
      active: { class: 'active', text: '🔴 Active' },
      completed: { class: 'completed', text: '✅ Completed' },
      pending: { class: 'pending', text: '⏳ Pending' },
      rejected: { class: 'rejected', text: '❌ Rejected' },
    }
    const badge = badges[status]
    
    return (
      <span className={`leave-type-badge leave-${badge.class}`}>
        {badge.text}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading leaves...</p>
      </div>
    )
  }

  try {
    return (
    <div className="leaves-tab">
      <div className="page-header">
        <div>
          <h2>Leave Management</h2>
          <p>Apply for leaves and track your leave applications</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} />
          Apply Leave
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          <AlertCircle size={20} />
          <span>{message.text}</span>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Leaves</h3>
            <div className="stat-value">{leaves.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <div className="stat-value">{leaves.filter(l => l.status === 'PENDING').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Approved</h3>
            <div className="stat-value">{leaves.filter(l => l.status === 'APPROVED').length}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <label>
              <Filter size={18} />
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label>
              <Calendar size={18} />
              Filter by Period
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Leaves</option>
              <option value="upcoming">Upcoming</option>
              <option value="past">Past</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leaves List */}
      {filteredLeaves.length > 0 ? (
        <div className="leaves-grid">
          {filteredLeaves.map((leave) => (
            <div key={leave.leaveId} className="leave-card">
              <div className="leave-header">
                <div className="leave-dates">
                  <Calendar size={20} />
                  <div>
                    <div className="date-range">
                      {leave.startDate && leave.endDate ? (
                        <>{format(parseISO(leave.startDate), 'MMM dd, yyyy')} - {format(parseISO(leave.endDate), 'MMM dd, yyyy')}</>
                      ) : 'N/A'}
                    </div>
                    <div className="duration">{leave.duration} day{leave.duration > 1 ? 's' : ''}</div>
                  </div>
                </div>
                <div className="leave-badges">
                  {getLeaveTypeBadge(leave)}
                  {getStatusBadge(leave.status)}
                </div>
              </div>
              
              <div className="leave-body">
                <div className="leave-reason">
                  <strong>Reason:</strong>
                  <p>{leave.reason}</p>
                </div>
                
                <div className="leave-meta">
                  <div className="meta-item">
                    <span className="meta-label">Applied on:</span>
                    <span className="meta-value">
                      {leave.appliedAt ? format(parseISO(leave.appliedAt), 'MMM dd, yyyy') : 'N/A'}
                    </span>
                  </div>
                  
                  {leave.approvedAt && (
                    <div className="meta-item">
                      <span className="meta-label">
                        {leave.status === 'APPROVED' ? 'Approved on:' : 'Rejected on:'}
                      </span>
                      <span className="meta-value">
                        {format(parseISO(leave.approvedAt), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  )}
                  
                  {leave.adminComment && (
                    <div className="admin-comment">
                      <strong>Admin Comment:</strong>
                      <p>{leave.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <Calendar size={64} />
          <h3>No Leaves Found</h3>
          <p>You haven't applied for any leaves yet</p>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Apply for Leave</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                    min={form.startDate || format(new Date(), 'yyyy-MM-dd')}
                    required
                  />
                </div>
              </div>
              
              {form.startDate && form.endDate && (
                <div className="duration-info">
                  Duration: {differenceInDays(new Date(form.endDate), new Date(form.startDate)) + 1} day(s)
                </div>
              )}

              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows="4"
                  placeholder="Please provide a reason for your leave..."
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
  } catch (error) {
    console.error('Error rendering LeavesTab:', error)
    return (
      <div className="loading-container">
        <AlertCircle size={64} color="#ef4444" />
        <h3>Error Loading Leaves</h3>
        <p>{error.message || 'An unexpected error occurred'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Reload Page
        </button>
      </div>
    )
  }
}

export default LeavesTab
