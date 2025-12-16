import React, { useState } from 'react'
import { User, Mail, Phone, Briefcase, Settings, Save } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import './ProfileTab.css'

const ProfileTab = () => {
  const { user, setUser } = useAuth()
  const [workMode, setWorkMode] = useState(user?.workMode || 'ONSITE')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  const handleUpdateWorkMode = async () => {
    setLoading(true)
    setMessage({ type: '', text: '' })

    try {
      const response = await userAPI.updateWorkMode(user.userId, workMode)
      if (response.data.success) {
        setUser({ ...user, workMode })
        setMessage({ type: 'success', text: 'Work mode updated successfully!' })
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update work mode' 
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="profile-tab">
      <div className="page-header">
        <h2>Profile</h2>
        <p>Manage your account information and preferences</p>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="profile-grid">
        {/* Profile Information */}
        <div className="card profile-card">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <h3>{user?.name}</h3>
          <p className="profile-role">{user?.role}</p>
          
          <div className="profile-info-list">
            <div className="info-row">
              <Mail size={18} />
              <div>
                <span className="info-label">Email</span>
                <span className="info-text">{user?.email}</span>
              </div>
            </div>

            <div className="info-row">
              <Phone size={18} />
              <div>
                <span className="info-label">Phone</span>
                <span className="info-text">{user?.phone || 'Not provided'}</span>
              </div>
            </div>

            <div className="info-row">
              <Briefcase size={18} />
              <div>
                <span className="info-label">Employee ID</span>
                <span className="info-text">{user?.employeeId}</span>
              </div>
            </div>

            <div className="info-row">
              <Settings size={18} />
              <div>
                <span className="info-label">Work Mode</span>
                <span className={`badge badge-${user?.workMode?.toLowerCase()}`}>
                  {user?.workMode}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="card settings-card">
          <h3>
            <Settings size={20} />
            Settings
          </h3>

          <div className="settings-section">
            <h4>Work Mode Preference</h4>
            <p className="settings-desc">
              Change your work mode between On-Site and Remote
            </p>

            <div className="work-mode-selector">
              <button
                className={`mode-btn ${workMode === 'ONSITE' ? 'active' : ''}`}
                onClick={() => setWorkMode('ONSITE')}
              >
                <div className="mode-icon">🏢</div>
                <div>
                  <div className="mode-title">On-Site</div>
                  <div className="mode-desc">Work from office location</div>
                </div>
              </button>

              <button
                className={`mode-btn ${workMode === 'REMOTE' ? 'active' : ''}`}
                onClick={() => setWorkMode('REMOTE')}
              >
                <div className="mode-icon">🏠</div>
                <div>
                  <div className="mode-title">Remote</div>
                  <div className="mode-desc">Work from anywhere</div>
                </div>
              </button>
            </div>

            <button
              onClick={handleUpdateWorkMode}
              disabled={loading || workMode === user?.workMode}
              className="btn-save"
            >
              <Save size={18} />
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <div className="settings-section">
            <h4>Account Information</h4>
            <div className="account-stats">
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">
                  {user?.createdAt 
                    ? new Date(user.createdAt).toLocaleDateString() 
                    : 'N/A'}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Account Status</span>
                <span className="stat-value">
                  <span className="status-active">● Active</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileTab
