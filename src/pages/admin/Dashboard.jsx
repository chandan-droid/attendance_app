import React, { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  Briefcase, 
  Users, 
  MapPin, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  CheckSquare
} from 'lucide-react'
import ProjectsTab from './ProjectsTab'
import EmployeesTab from './EmployeesTab'
import GeofenceTab from './GeofenceTab'
import AnalyticsTab from './AnalyticsTab'
import ApprovalsTab from './ApprovalsTab'
import '../employee/Dashboard.css'

const AdminDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/admin', icon: Briefcase, label: 'Projects', exact: true },
    { path: '/admin/employees', icon: Users, label: 'Employees' },
    { path: '/admin/geofence', icon: MapPin, label: 'Geofence' },
    { path: '/admin/approvals', icon: CheckSquare, label: 'Approvals' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ]

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Settings size={32} />
            <span>Admin Panel</span>
          </div>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <div className="user-info">
          <div className="user-avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="user-details">
            <h3>{user?.name}</h3>
            <p>{user?.email}</p>
            <span className="work-mode-badge" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}>
              ADMIN
            </span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <header className="top-bar">
          <button className="menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="top-bar-title">
            <h1>Admin Dashboard</h1>
          </div>
          <div className="top-bar-actions">
            <div className="user-badge">
              <Settings size={18} />
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Routes>
            <Route path="/" element={<ProjectsTab />} />
            <Route path="/employees" element={<EmployeesTab />} />
            <Route path="/geofence" element={<GeofenceTab />} />
            <Route path="/approvals" element={<ApprovalsTab />} />
            <Route path="/analytics" element={<AnalyticsTab />} />
          </Routes>
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}

export default AdminDashboard
