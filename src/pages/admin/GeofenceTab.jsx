import React, { useState, useEffect } from 'react'
import { Plus, MapPin, Trash2 } from 'lucide-react'
import { geofenceAPI } from '../../services/api'
import GeofenceMap from '../../components/GeofenceMap'
import './GeofenceTab.css'

const GeofenceTab = () => {
  const [geofences, setGeofences] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [form, setForm] = useState({
    locationName: '',
    latitude: '',
    longitude: '',
    radiusMeters: 200,
  })

  useEffect(() => {
    fetchGeofences()
  }, [])

  const fetchGeofences = async () => {
    setLoading(true)
    try {
      const response = await geofenceAPI.getAllGeofences()
      if (response.data.success) {
        setGeofences(response.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching geofences:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateGeofence = async (e) => {
    e.preventDefault()
    try {
      const response = await geofenceAPI.createGeofence(form)
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Geofence location created successfully!' })
        setShowModal(false)
        setForm({ locationName: '', latitude: '', longitude: '', radiusMeters: 200 })
        fetchGeofences()
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create geofence' })
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setForm({
            ...form,
            latitude: position.coords.latitude.toFixed(7),
            longitude: position.coords.longitude.toFixed(7),
          })
        },
        (error) => {
          setMessage({ type: 'error', text: 'Unable to get your location' })
        }
      )
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading geofence locations...</p>
      </div>
    )
  }

  return (
    <div className="geofence-tab">
      <div className="page-header">
        <div>
          <h2>Geofence Locations</h2>
          <p>Manage office locations for attendance verification</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={20} />
          Add Location
        </button>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Map View */}
      <div className="card map-container">
        <h3>All Locations</h3>
        {geofences.length > 0 ? (
          <div style={{ height: '500px', marginTop: '16px' }}>
            <GeofenceMap
              userLocation={null}
              geofences={geofences}
            />
          </div>
        ) : (
          <div className="empty-map">
            <MapPin size={64} />
            <p>No geofence locations added yet</p>
          </div>
        )}
      </div>

      {/* Locations List */}
      <div className="card">
        <h3>Location Details</h3>
        {geofences.length > 0 ? (
          <div className="locations-grid">
            {geofences.map((geofence) => (
              <div key={geofence.geofenceId} className="location-card">
                <div className="location-header">
                  <div className="location-icon">
                    <MapPin size={20} />
                  </div>
                  <h4>{geofence.locationName}</h4>
                </div>
                <div className="location-details">
                  <div className="detail-row">
                    <span className="detail-label">Latitude:</span>
                    <span className="detail-value">{parseFloat(geofence.latitude).toFixed(7)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Longitude:</span>
                    <span className="detail-value">{parseFloat(geofence.longitude).toFixed(7)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Radius:</span>
                    <span className="detail-value">{geofence.radiusMeters}m</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Created:</span>
                    <span className="detail-value">
                      {new Date(geofence.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <MapPin size={64} />
            <h3>No Locations</h3>
            <p>Add geofence locations to enable location-based attendance</p>
          </div>
        )}
      </div>

      {/* Create Geofence Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Geofence Location</h3>
            <form onSubmit={handleCreateGeofence}>
              <div className="form-group">
                <label>Location Name *</label>
                <input
                  type="text"
                  value={form.locationName}
                  onChange={(e) => setForm({ ...form, locationName: e.target.value })}
                  placeholder="e.g., Main Office, Branch A"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Latitude *</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={form.latitude}
                    onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                    placeholder="28.7041"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Longitude *</label>
                  <input
                    type="number"
                    step="0.0000001"
                    value={form.longitude}
                    onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                    placeholder="77.1025"
                    required
                  />
                </div>
              </div>

              <button 
                type="button" 
                onClick={getCurrentLocation}
                className="btn-location"
              >
                <MapPin size={18} />
                Use My Current Location
              </button>

              <div className="form-group">
                <label>Radius (meters) *</label>
                <input
                  type="number"
                  value={form.radiusMeters}
                  onChange={(e) => setForm({ ...form, radiusMeters: parseInt(e.target.value) })}
                  min="10"
                  max="5000"
                  required
                />
                <small>Area within which attendance can be marked (10m - 5000m)</small>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default GeofenceTab
