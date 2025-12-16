import React, { useState } from 'react'
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { 
  ClipboardList, 
  Clock, 
  BarChart3, 
  User, 
  LogOut, 
  Menu, 
  X,
  Calendar,
  MessageSquare
} from 'lucide-react'
import AttendanceTab from './AttendanceTab'
import HistoryTab from './HistoryTab'
import AnalyticsTab from './AnalyticsTab'
import ProfileTab from './ProfileTab'
import LeavesTab from './LeavesTab'
import AttendanceQueryTab from './AttendanceQueryTab'
import './Dashboard.css'

const EmployeeDashboard = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const menuItems = [
    { path: '/employee', icon: Clock, label: 'Attendance', exact: true },
    { path: '/employee/history', icon: ClipboardList, label: 'History' },
    { path: '/employee/leaves', icon: Calendar, label: 'Leaves' },
    { path: '/employee/queries', icon: MessageSquare, label: 'Queries' },
    { path: '/employee/analytics', icon: BarChart3, label: 'Analytics' },
    { path: '/employee/profile', icon: User, label: 'Profile' },
  ]

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <Clock size={32} />
            <span>AttendApp</span>
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
            <span className="work-mode-badge">{user?.workMode}</span>
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
            <h1>Employee Dashboard</h1>
          </div>
          <div className="top-bar-actions">
            <div className="user-badge">
              <User size={18} />
              <span>{user?.name}</span>
            </div>
          </div>
        </header>

        <div className="content-area">
          <Routes>
            <Route path="/" element={<AttendanceTab />} />
            <Route path="/history" element={<HistoryTab />} />
            <Route path="/leaves" element={<LeavesTab />} />
            <Route path="/queries" element={<AttendanceQueryTab />} />
            <Route path="/analytics" element={<AnalyticsTab />} />
            <Route path="/profile" element={<ProfileTab />} />
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

export default EmployeeDashboard
