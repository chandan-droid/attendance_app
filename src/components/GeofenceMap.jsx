import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

// User location icon
const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Geofence location icon
const geofenceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const MapUpdater = ({ userLocation, geofences }) => {
  const map = useMap()

  useEffect(() => {
    if (userLocation) {
      map.setView([userLocation.latitude, userLocation.longitude], 15)
    } else if (geofences.length > 0) {
      const firstGeofence = geofences[0]
      map.setView([parseFloat(firstGeofence.latitude), parseFloat(firstGeofence.longitude)], 13)
    }
  }, [userLocation, geofences, map])

  return null
}

const GeofenceMap = ({ userLocation, geofences, onGeofenceCheck }) => {
  const defaultCenter = [28.7041, 77.1025] // Default to Delhi
  const center = userLocation 
    ? [userLocation.latitude, userLocation.longitude]
    : geofences.length > 0
    ? [parseFloat(geofences[0].latitude), parseFloat(geofences[0].longitude)]
    : defaultCenter

  useEffect(() => {
    if (userLocation && geofences.length > 0 && onGeofenceCheck) {
      const isWithin = checkIfWithinGeofence(userLocation, geofences)
      onGeofenceCheck(isWithin)
    }
  }, [userLocation, geofences, onGeofenceCheck])

  const checkIfWithinGeofence = (location, geofenceList) => {
    for (const geofence of geofenceList) {
      const distance = calculateDistance(
        location.latitude,
        location.longitude,
        parseFloat(geofence.latitude),
        parseFloat(geofence.longitude)
      )
      if (distance <= geofence.radiusMeters) {
        return true
      }
    }
    return false
  }

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lon2 - lon1) * Math.PI) / 180

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
  }

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater userLocation={userLocation} geofences={geofences} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={userIcon}
          >
            <Popup>
              <strong>Your Location</strong>
              <br />
              Lat: {userLocation.latitude.toFixed(6)}
              <br />
              Lng: {userLocation.longitude.toFixed(6)}
            </Popup>
          </Marker>
        )}

        {/* Geofence markers and circles */}
        {geofences.map((geofence) => (
          <React.Fragment key={geofence.geofenceId}>
            <Marker
              position={[parseFloat(geofence.latitude), parseFloat(geofence.longitude)]}
              icon={geofenceIcon}
            >
              <Popup>
                <strong>{geofence.locationName}</strong>
                <br />
                Radius: {geofence.radiusMeters}m
              </Popup>
            </Marker>
            <Circle
              center={[parseFloat(geofence.latitude), parseFloat(geofence.longitude)]}
              radius={geofence.radiusMeters}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.2,
              }}
            />
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  )
}

export default GeofenceMap
