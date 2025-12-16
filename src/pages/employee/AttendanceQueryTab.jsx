import React, { useState, useEffect } from 'react'
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, AlertCircle, Calendar } from 'lucide-react'
import { attendanceQueryAPI } from '../../services/api'
import { format, parseISO } from 'date-fns'
import './AttendanceQueryTab.css'

const AttendanceQueryTab = () => {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [filterStatus, setFilterStatus] = useState('all')
  
  const [form, setForm] = useState({
    queryDate: '',
    reason: '',
  })

  useEffect(() => {
    fetchQueries()
  }, [])

  const fetchQueries = async () => {
    setLoading(true)
    try {
      const response = await attendanceQueryAPI.getMyQueries()
      if (response && response.data) {
        setQueries(Array.isArray(response.data) ? response.data : [])
      } else {
        setQueries([])
      }
    } catch (error) {
      console.error('Error fetching queries:', error)
      setQueries([])
      setMessage({ type: 'error', text: 'Failed to load queries. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      // Validate that query date is not in the future
      const queryDate = new Date(form.queryDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (queryDate > today) {
        setMessage({ type: 'error', text: 'Cannot raise query for future dates' })
        return
      }

      const queryData = {
        queryDate: form.queryDate,
        reason: form.reason,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      }
      
      await attendanceQueryAPI.raiseQuery(queryData)
      setMessage({ type: 'success', text: 'Attendance query raised successfully!' })
      setShowModal(false)
      setForm({ queryDate: '', reason: '' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
      fetchQueries()
    } catch (error) {
      console.error('Error raising query:', error)
      setMessage({ type: 'error', text: error.response?.data?.message || error.message || 'Failed to raise query. Please try again.' })
    }
  }

  const filteredQueries = queries.filter((query) => {
    if (!query) return false
    
    try {
      if (filterStatus !== 'all' && query.status !== filterStatus) {
        return false
      }
      return true
    } catch (error) {
      console.error('Error filtering query:', error)
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

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading queries...</p>
      </div>
    )
  }

  try {
    return (
    <div className="attendance-query-tab">
      <div className="page-header">
        <div>
          <h2>Attendance Queries</h2>
          <p>Raise queries for missed attendance with valid reasons</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} />
          Raise Query
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
            <MessageSquare size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Queries</h3>
            <div className="stat-value">{queries.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <div className="stat-value">{queries.filter(q => q.status === 'PENDING').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Approved</h3>
            <div className="stat-value">{queries.filter(q => q.status === 'APPROVED').length}</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="card filter-card">
        <div className="form-group">
          <label>
            <AlertCircle size={18} />
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
      </div>

      {/* Queries List */}
      {filteredQueries.length > 0 ? (
        <div className="queries-grid">
          {filteredQueries.map((query) => (
            <div key={query.queryId} className="query-card">
              <div className="query-header">
                <div className="query-date">
                  <Calendar size={20} />
                  <div>
                    <div className="date-text">Absent Date</div>
                    <div className="date-value">
                      {query.queryDate ? format(parseISO(query.queryDate), 'MMMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>
                {getStatusBadge(query.status)}
              </div>
              
              <div className="query-body">
                <div className="query-reason">
                  <strong>Reason for Absence:</strong>
                  <p>{query.reason}</p>
                </div>
                
                <div className="query-meta">
                  <div className="meta-item">
                    <span className="meta-label">Raised on:</span>
                    <span className="meta-value">
                      {query.createdAt ? format(parseISO(query.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                    </span>
                  </div>
                  
                  {query.resolvedAt && (
                    <div className="meta-item">
                      <span className="meta-label">
                        {query.status === 'APPROVED' ? 'Approved on:' : 'Rejected on:'}
                      </span>
                      <span className="meta-value">
                        {format(parseISO(query.resolvedAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                  
                  {query.adminComment && (
                    <div className="admin-comment">
                      <strong>Admin Response:</strong>
                      <p>{query.adminComment}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <MessageSquare size={64} />
          <h3>No Queries Found</h3>
          <p>You haven't raised any attendance queries yet</p>
        </div>
      )}

      {/* Raise Query Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Raise Attendance Query</h3>
            <p className="modal-subtitle">Report missed attendance with a valid reason</p>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Absent Date *</label>
                <input
                  type="date"
                  value={form.queryDate}
                  onChange={(e) => setForm({ ...form, queryDate: e.target.value })}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>

              <div className="form-group">
                <label>Reason for Absence *</label>
                <textarea
                  value={form.reason}
                  onChange={(e) => setForm({ ...form, reason: e.target.value })}
                  rows="5"
                  placeholder="Please explain why you were unable to mark attendance..."
                  required
                />
              </div>

              <div className="info-box">
                <AlertCircle size={18} />
                <div>
                  <strong>Note:</strong> Admin will review your query and provide a response. 
                  Please provide a genuine and detailed reason for your absence.
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Submit Query
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
  } catch (error) {
    console.error('Error rendering AttendanceQueryTab:', error)
    return (
      <div className="loading-container">
        <AlertCircle size={64} color="#ef4444" />
        <h3>Error Loading Queries</h3>
        <p>{error.message || 'An unexpected error occurred'}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">
          Reload Page
        </button>
      </div>
    )
  }
}

export default AttendanceQueryTab
