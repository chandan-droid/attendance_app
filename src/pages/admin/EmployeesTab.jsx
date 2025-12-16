import React, { useState, useEffect } from 'react'
import { Users, Mail, Phone, Briefcase, MapPin } from 'lucide-react'
import { userAPI } from '../../services/api'
import './EmployeesTab.css'

const EmployeesTab = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterWorkMode, setFilterWorkMode] = useState('all')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const response = await userAPI.getAllUsers()
      if (response.data.success) {
        const allUsers = response.data.data || []
        setEmployees(allUsers.filter(user => user.role === 'EMPLOYEE'))
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesWorkMode = filterWorkMode === 'all' || emp.workMode === filterWorkMode
    
    return matchesSearch && matchesWorkMode
  })

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading employees...</p>
      </div>
    )
  }

  return (
    <div className="employees-tab">
      <div className="page-header">
        <div>
          <h2>Employees</h2>
          <p>View and manage all employees</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card filters-card">
        <div className="filters-grid">
          <div className="form-group">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or employee ID..."
              className="search-input"
            />
          </div>
          <div className="form-group">
            <select
              value={filterWorkMode}
              onChange={(e) => setFilterWorkMode(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Work Modes</option>
              <option value="ONSITE">On-Site</option>
              <option value="REMOTE">Remote</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <Users size={24} />
          </div>
          <div className="stat-content">
            <h3>Total Employees</h3>
            <div className="stat-value">{employees.length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-content">
            <h3>On-Site</h3>
            <div className="stat-value">{employees.filter(e => e.workMode === 'ONSITE').length}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <MapPin size={24} />
          </div>
          <div className="stat-content">
            <h3>Remote</h3>
            <div className="stat-value">{employees.filter(e => e.workMode === 'REMOTE').length}</div>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="card">
        {filteredEmployees.length > 0 ? (
          <div className="table-container">
            <table className="employees-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Contact</th>
                  <th>Work Mode</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => (
                  <tr key={employee.userId}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {employee.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="employee-name">{employee.name}</div>
                          <div className="employee-email">{employee.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="employee-id">{employee.employeeId}</span>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <Mail size={14} />
                          <span>{employee.email}</span>
                        </div>
                        {employee.phone && (
                          <div className="contact-item">
                            <Phone size={14} />
                            <span>{employee.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`work-mode-badge work-mode-${employee.workMode?.toLowerCase()}`}>
                        {employee.workMode}
                      </span>
                    </td>
                    <td>
                      <span className="join-date">
                        {employee.createdAt 
                          ? new Date(employee.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Users size={64} />
            <h3>No Employees Found</h3>
            <p>No employees match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmployeesTab
