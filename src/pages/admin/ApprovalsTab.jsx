import React, { useState, useEffect } from 'react'
import { Calendar, MessageSquare, CheckCircle, XCircle, Clock, User, AlertCircle, Filter, Search } from 'lucide-react'
import { leaveAPI, attendanceQueryAPI, userAPI } from '../../services/api'
import { format, parseISO } from 'date-fns'
import './ApprovalsTab.css'

const ApprovalsTab = () => {
  const [leaves, setLeaves] = useState([])
  const [queries, setQueries] = useState([])
  const [users, setUsers] = useState({})
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('leaves') // 'leaves' or 'queries'
  const [message, setMessage] = useState({ type: '', text: '' })
  const [actionModal, setActionModal] = useState({ show: false, type: '', item: null })
  const [adminComment, setAdminComment] = useState('')
  
  // Filter states
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('all') // all, PENDING, APPROVED, REJECTED
  const [queryStatusFilter, setQueryStatusFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch all leaves and queries using admin endpoints
      const [leavesRes, queriesRes, usersRes] = await Promise.all([
        leaveAPI.getAllLeaves().catch(err => {
          console.error('Failed to fetch leaves:', err.response?.status)
          return { data: [] }
        }),
        attendanceQueryAPI.getAllQueries().catch(err => {
          console.error('Failed to fetch queries:', err.response?.status)
          return { data: [] }
        }),
        userAPI.getAllUsers()
      ])
      
      const leavesData = Array.isArray(leavesRes?.data) ? leavesRes.data : []
      const queriesData = Array.isArray(queriesRes?.data) ? queriesRes.data : []
      
      setLeaves(leavesData)
      setQueries(queriesData)
      
      // Create user lookup map - try both userId and id fields
      const userMap = {}
      if (usersRes?.data && Array.isArray(usersRes.data)) {
        usersRes.data.forEach(user => {
          const id = user.userId || user.id
          if (id) {
            userMap[id] = user
          }
        })
      }
      setUsers(userMap)
      
      console.log('Users map:', userMap)
      console.log('Sample leave userId:', leavesData[0]?.userId)
      console.log('Sample query userId:', queriesData[0]?.userId)
      
      // Show info message if admin endpoints aren't available
      if (leavesData.length === 0 && queriesData.length === 0) {
        setMessage({ 
          type: 'info', 
          text: 'No pending requests found. Note: Admin endpoints may not be fully configured on the backend.' 
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setLeaves([])
      setQueries([])
      setUsers({})
      setMessage({ 
        type: 'error', 
        text: 'Backend admin endpoints not available. Please configure /leaves/all and /attendance/query/all endpoints.' 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleLeaveAction = async (leaveId, status) => {
    try {
      await leaveAPI.approveLeave(leaveId, {
        status: status,
        adminComment: adminComment || null,
        approvedAt: new Date().toISOString()
      })
      
      setMessage({ 
        type: 'success', 
        text: `Leave ${status.toLowerCase()} successfully!` 
      })
      setActionModal({ show: false, type: '', item: null })
      setAdminComment('')
      fetchData()
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update leave' 
      })
    }
  }

  const handleQueryAction = async (queryId, status) => {
    try {
      await attendanceQueryAPI.approveQuery(queryId, {
        status: status,
        adminComment: adminComment || null,
        resolvedAt: new Date().toISOString()
      })
      
      setMessage({ 
        type: 'success', 
        text: `Query ${status.toLowerCase()} successfully!` 
      })
      setActionModal({ show: false, type: '', item: null })
      setAdminComment('')
      fetchData()
      
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update query' 
      })
    }
  }

  const openActionModal = (type, item) => {
    setActionModal({ show: true, type, item })
    setAdminComment('')
  }

  // Filter leaves by status and search term
  const filteredLeaves = leaves.filter(leave => {
    const statusMatch = leaveStatusFilter === 'all' || leave.status === leaveStatusFilter
    const searchMatch = searchTerm === '' || 
      users[leave.userId]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users[leave.userId]?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      leave.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    return statusMatch && searchMatch
  })

  // Filter queries by status and search term
  const filteredQueries = queries.filter(query => {
    const statusMatch = queryStatusFilter === 'all' || query.status === queryStatusFilter
    const searchMatch = searchTerm === '' || 
      users[query.userId]?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      users[query.userId]?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      query.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    return statusMatch && searchMatch
  })

  const pendingLeaves = filteredLeaves.filter(l => l.status === 'PENDING')
  const pendingQueries = filteredQueries.filter(q => q.status === 'PENDING')
  const processedLeaves = filteredLeaves.filter(l => l.status !== 'PENDING')
  const processedQueries = filteredQueries.filter(q => q.status !== 'PENDING')

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading approvals...</p>
      </div>
    )
  }

  return (
    <div className="approvals-tab">
      <div className="page-header">
        <div>
          <h2>Approvals & Requests</h2>
          <p>Review and manage employee leave applications and attendance queries</p>
        </div>
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
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending Leaves</h3>
            <div className="stat-value">{pendingLeaves.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
            <MessageSquare size={24} />
          </div>
          <div className="stat-content">
            <h3>Pending Queries</h3>
            <div className="stat-value">{pendingQueries.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Processed</h3>
            <div className="stat-value">{processedLeaves.length + processedQueries.length}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-btn ${activeTab === 'leaves' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaves')}
        >
          <Calendar size={20} />
          Leave Requests
          {pendingLeaves.length > 0 && <span className="badge">{pendingLeaves.length}</span>}
        </button>
        <button
          className={`tab-btn ${activeTab === 'queries' ? 'active' : ''}`}
          onClick={() => setActiveTab('queries')}
        >
          <MessageSquare size={20} />
          Attendance Queries
          {pendingQueries.length > 0 && <span className="badge">{pendingQueries.length}</span>}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <Filter size={18} />
          <select
            value={activeTab === 'leaves' ? leaveStatusFilter : queryStatusFilter}
            onChange={(e) => activeTab === 'leaves' ? setLeaveStatusFilter(e.target.value) : setQueryStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
        <div className="search-group">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by employee name, email, or reason..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="clear-search">
              <XCircle size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Leave Requests */}
      {activeTab === 'leaves' && (
        <div className="approvals-section">
          {pendingLeaves.length > 0 && (
            <>
              <h3 className="section-title">
                <Clock size={20} />
                Pending Leave Requests
              </h3>
              <div className="approvals-grid">
                {pendingLeaves.map((leave) => {
                  const userId = leave.userId || leave.id || leave.employeeId
                  const user = users[userId]
                  const userName = user?.name || user?.username || leave.employeeName || `User #${userId || 'Unknown'}`
                  
                  return (
                    <div key={leave.leaveId} className="approval-card pending-card">
                    <div className="card-top">
                      <div className="employee-header">
                        <div className="employee-avatar">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">{userName}</div>
                          <div className="employee-email">{user?.email || 'No email'}</div>
                        </div>
                      </div>
                      <span className="status-badge status-pending">Pending</span>
                    </div>

                    <div className="card-content">
                      <div className="info-line">
                        <Calendar size={16} />
                        <span className="info-text">
                          {leave.startDate && leave.endDate ? (
                            <>{format(parseISO(leave.startDate), 'MMM dd')} - {format(parseISO(leave.endDate), 'MMM dd, yyyy')} ({leave.duration || 0} days)</>
                          ) : 'N/A'}
                        </span>
                      </div>

                      <div className="reason-text">
                        <strong>Reason:</strong>
                        <p>{leave.reason || 'No reason provided'}</p>
                      </div>

                      <div className="applied-date">
                        Applied: {leave.appliedAt ? format(parseISO(leave.appliedAt), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        onClick={() => openActionModal('approve-leave', leave)}
                        className="btn-approve"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => openActionModal('reject-leave', leave)}
                        className="btn-reject"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                  )
                })}
              </div>
            </>
          )}

          {processedLeaves.length > 0 && (
            <>
              <h3 className="section-title processed-title">
                <CheckCircle size={20} />
                Processed Requests
              </h3>
              <div className="approvals-grid">
                {processedLeaves.map((leave) => {
                  const userId = leave.userId || leave.id || leave.employeeId
                  const user = users[userId]
                  const userName = user?.name || user?.username || leave.employeeName || `User #${userId || 'Unknown'}`
                  
                  return (
                  <div key={leave.leaveId} className="approval-card">
                    <div className="card-top">
                      <div className="employee-header">
                        <div className="employee-avatar">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">{userName}</div>
                          <div className="employee-email">{user?.email || 'No email'}</div>
                        </div>
                      </div>
                      <span className={`status-badge status-${leave.status ? leave.status.toLowerCase() : 'pending'}`}>
                        {leave.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="card-content">
                      <div className="info-line">
                        <Calendar size={16} />
                        <span className="info-text">
                          {leave.startDate && leave.endDate ? (
                            <>{format(parseISO(leave.startDate), 'MMM dd')} - {format(parseISO(leave.endDate), 'MMM dd, yyyy')} ({leave.duration} days)</>
                          ) : 'N/A'}
                        </span>
                      </div>

                      <div className="reason-text">
                        <strong>Reason:</strong>
                        <p>{leave.reason || 'No reason provided'}</p>
                      </div>

                      {leave.adminComment && (
                        <div className="admin-comment-box">
                          <strong>Admin:</strong> {leave.adminComment}
                        </div>
                      )}

                      <div className="applied-date">
                        Processed: {leave.approvedAt ? format(parseISO(leave.approvedAt), 'MMM dd, yyyy') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </>
          )}

          {leaves.length === 0 && (
            <div className="empty-state">
              <Calendar size={64} />
              <h3>No Leave Requests</h3>
              <p>There are no leave applications to review</p>
            </div>
          )}
        </div>
      )}

      {/* Attendance Queries */}
      {activeTab === 'queries' && (
        <div className="approvals-section">
          {pendingQueries.length > 0 && (
            <>
              <h3 className="section-title">
                <Clock size={20} />
                Pending Attendance Queries
              </h3>
              <div className="approvals-grid">
                {pendingQueries.map((query) => {
                  const userId = query.userId || query.id || query.employeeId
                  const user = users[userId]
                  const userName = user?.name || user?.username || query.employeeName || `User #${userId || 'Unknown'}`
                  
                  return (
                    <div key={query.queryId} className="approval-card pending-card">
                    <div className="card-top">
                      <div className="employee-header">
                        <div className="employee-avatar">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">{userName}</div>
                          <div className="employee-email">{user?.email || 'No email'}</div>
                        </div>
                      </div>
                      <span className="status-badge status-pending">Pending</span>
                    </div>

                    <div className="card-content">
                      <div className="info-line">
                        <Calendar size={16} />
                        <span className="info-text">
                          {query.queryDate ? format(parseISO(query.queryDate), 'MMMM dd, yyyy') : 'N/A'}
                        </span>
                      </div>

                      <div className="reason-text">
                        <strong>Reason:</strong>
                        <p>{query.reason || 'No reason provided'}</p>
                      </div>

                      <div className="applied-date">
                        Raised: {query.createdAt ? format(parseISO(query.createdAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </div>
                    </div>

                    <div className="card-actions">
                      <button
                        onClick={() => openActionModal('approve-query', query)}
                        className="btn-approve"
                      >
                        <CheckCircle size={18} />
                        Approve
                      </button>
                      <button
                        onClick={() => openActionModal('reject-query', query)}
                        className="btn-reject"
                      >
                        <XCircle size={18} />
                        Reject
                      </button>
                    </div>
                  </div>
                  )
                })}
              </div>
            </>
          )}

          {processedQueries.length > 0 && (
            <>
              <h3 className="section-title processed-title">
                <CheckCircle size={20} />
                Processed Queries
              </h3>
              <div className="approvals-grid">
                {processedQueries.map((query) => {
                  const userId = query.userId || query.id || query.employeeId
                  const user = users[userId]
                  const userName = user?.name || user?.username || query.employeeName || `User #${userId || 'Unknown'}`
                  
                  return (
                  <div key={query.queryId} className="approval-card">
                    <div className="card-top">
                      <div className="employee-header">
                        <div className="employee-avatar">
                          {userName.charAt(0).toUpperCase()}
                        </div>
                        <div className="employee-details">
                          <div className="employee-name">{userName}</div>
                          <div className="employee-email">{user?.email || 'No email'}</div>
                        </div>
                      </div>
                      <span className={`status-badge status-${query.status ? query.status.toLowerCase() : 'pending'}`}>
                        {query.status || 'PENDING'}
                      </span>
                    </div>

                    <div className="card-content">
                      <div className="info-line">
                        <Calendar size={16} />
                        <span className="info-text">
                          {query.queryDate ? format(parseISO(query.queryDate), 'MMMM dd, yyyy') : 'N/A'}
                        </span>
                      </div>

                      <div className="reason-text">
                        <strong>Reason:</strong>
                        <p>{query.reason || 'No reason provided'}</p>
                      </div>

                      {query.adminComment && (
                        <div className="admin-comment-box">
                          <strong>Admin:</strong> {query.adminComment}
                        </div>
                      )}

                      <div className="applied-date">
                        Resolved: {query.resolvedAt ? format(parseISO(query.resolvedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </>
          )}

          {queries.length === 0 && (
            <div className="empty-state">
              <MessageSquare size={64} />
              <h3>No Attendance Queries</h3>
              <p>There are no attendance queries to review</p>
            </div>
          )}
        </div>
      )}

      {/* Action Modal */}
      {actionModal.show && (
        <div className="modal-overlay" onClick={() => setActionModal({ show: false, type: '', item: null })}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {actionModal.type.includes('approve') ? 'Approve' : 'Reject'}{' '}
              {actionModal.type.includes('leave') ? 'Leave Request' : 'Attendance Query'}
            </h3>
            
            <div className="modal-content">
              <p className="modal-subtitle">
                {actionModal.type.includes('leave') 
                  ? `${users[actionModal.item?.userId]?.name}'s leave from ${format(parseISO(actionModal.item?.startDate), 'MMM dd')} to ${format(parseISO(actionModal.item?.endDate), 'MMM dd, yyyy')}`
                  : `${users[actionModal.item?.userId]?.name}'s query for ${format(parseISO(actionModal.item?.queryDate), 'MMM dd, yyyy')}`
                }
              </p>

              <div className="form-group">
                <label>Admin Comment {actionModal.type.includes('reject') && <span className="required">*</span>}</label>
                <textarea
                  value={adminComment}
                  onChange={(e) => setAdminComment(e.target.value)}
                  rows="4"
                  placeholder={actionModal.type.includes('approve') 
                    ? "Optional: Add a comment for the employee..." 
                    : "Required: Please provide a reason for rejection..."
                  }
                  required={actionModal.type.includes('reject')}
                />
              </div>

              <div className="modal-actions">
                <button
                  onClick={() => setActionModal({ show: false, type: '', item: null })}
                  className="btn-cancel"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (actionModal.type.includes('reject') && !adminComment.trim()) {
                      setMessage({ type: 'error', text: 'Please provide a reason for rejection' })
                      return
                    }
                    
                    const status = actionModal.type.includes('approve') ? 'APPROVED' : 'REJECTED'
                    if (actionModal.type.includes('leave')) {
                      handleLeaveAction(actionModal.item.leaveId, status)
                    } else {
                      handleQueryAction(actionModal.item.queryId, status)
                    }
                  }}
                  className={actionModal.type.includes('approve') ? 'btn-approve' : 'btn-reject'}
                >
                  {actionModal.type.includes('approve') ? (
                    <><CheckCircle size={18} /> Confirm Approval</>
                  ) : (
                    <><XCircle size={18} /> Confirm Rejection</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApprovalsTab
