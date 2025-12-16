# Attendance App

A modern, full-featured attendance management application with employee and admin panels, geofencing verification, and project tracking.

## Features

### Employee Panel
- **Attendance Management**
  - Punch in/out with project and task selection
  - Geofencing verification for on-site employees
  - Real-time location tracking with Leaflet maps
  - Remote work mode support (no geofencing required)
  
- **History & Analytics**
  - Detailed attendance history with date filters
  - Work sessions tracking
  - Project-wise hour breakdown
  - Daily and total hours calculation
  
- **Profile Management**
  - View personal information
  - Change work mode (On-Site/Remote)
  - Account statistics

### Admin Panel
- **Project Management**
  - Create and manage projects
  - Create tasks under projects
  - Assign projects to employees
  - View project details and timelines
  
- **Employee Management**
  - View all employees
  - Search and filter employees
  - View employee details and work modes
  - Track employee statistics
  
- **Geofence Management**
  - Add office locations with coordinates
  - Set geofence radius for each location
  - Visual map representation
  - Use current location feature
  
- **Analytics Dashboard**
  - Overview of key metrics
  - Employee and project statistics

## Tech Stack

- **Frontend**: React 18 with Vite
- **Routing**: React Router v6
- **Maps**: Leaflet & React-Leaflet
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Icons**: Lucide React
- **Styling**: Custom CSS with modern gradients

## Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:8080`

## Installation

1. Navigate to the project directory:
```bash
cd "c:\Local Disk D_72220252316\my codes\src\web-apps\attendance_app"
```

2. Install dependencies:
```bash
npm install
```

## Configuration

Update the API base URL in `src/services/api.js` if your backend runs on a different port:

```javascript
const API_BASE_URL = 'http://localhost:8080/api'
```

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. The application will open at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

The build output will be in the `dist` directory.

## Usage

### First-Time Setup

1. **Signup**: Create an account by visiting `/signup`
   - Choose role (Employee or Admin)
   - Select work mode (On-Site or Remote)

2. **Login**: Sign in with email/employee ID and password

### For Employees

1. **Mark Attendance**:
   - Navigate to Attendance tab
   - Select a project (and optionally a task)
   - Click "Punch In"
   - For on-site employees: Ensure you're within the geofence area
   - When done, click "Punch Out"

2. **View History**:
   - Go to History tab
   - Use date filters to find specific records
   - View work sessions and durations

3. **Check Analytics**:
   - Analytics tab shows hours by project
   - View today's hours and total hours

### For Admins

1. **Create Projects**:
   - Click "New Project" button
   - Fill in project details
   - Add start and end dates

2. **Create Tasks**:
   - Click "New Task" button
   - Select a project
   - Add task details and estimated hours

3. **Assign Projects**:
   - Click "Assign Project"
   - Select project and employee
   - Employees can only create tasks for assigned projects

4. **Add Geofence Locations**:
   - Go to Geofence tab
   - Click "Add Location"
   - Enter location name and coordinates
   - Use "Use My Current Location" for quick setup
   - Set radius (default: 200m)

## Key Features Explained

### Geofencing
- On-site employees must be within designated geofence areas to punch in/out
- Remote employees can mark attendance from anywhere
- Uses Haversine formula for distance calculation
- Visual map shows user location and all geofence areas

### Project & Task Management
- Projects can have multiple tasks
- Only assigned projects are visible to employees
- Tasks are linked to specific projects
- Hours are tracked per project and task

### Work Sessions
- Automatically created on punch in/out
- Calculates duration in minutes
- Links to specific projects and tasks
- Accessible in history and analytics

## Design Highlights

- Modern gradient backgrounds
- Responsive layout (mobile, tablet, desktop)
- Smooth animations and transitions
- Card-based UI components
- Sidebar navigation with active states
- Modal dialogs for forms
- Loading states and error handling
- Empty states with helpful messages

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Location Permissions

The app requires location access for:
- Geofencing verification
- Map functionality
- "Use Current Location" feature

Grant location permissions when prompted for full functionality.

## API Endpoints Used

- `/api/auth/signup` - User registration
- `/api/auth/login` - User login
- `/api/users/me` - Get current user
- `/api/users` - Get all users
- `/api/attendance/punch-in` - Mark punch in
- `/api/attendance/punch-out` - Mark punch out
- `/api/attendance/history` - Get attendance history
- `/api/attendance/work-sessions` - Get work sessions
- `/api/attendance/total-hours/*` - Get working hours
- `/api/projects` - Project CRUD operations
- `/api/projects/assigned` - Get assigned projects
- `/api/projects/*/tasks` - Task operations
- `/api/geofence` - Geofence CRUD operations

## Troubleshooting

**Location not working:**
- Ensure location permissions are granted
- Check if browser supports Geolocation API
- Verify HTTPS connection (required for location in production)

**Map not loading:**
- Check internet connection
- Verify Leaflet CSS is loaded
- Check console for errors

**API errors:**
- Verify backend server is running
- Check API base URL configuration
- Verify authentication token is valid

## Future Enhancements

- Excel/PDF export for attendance reports
- Real-time notifications
- Biometric integration
- Offline mode support
- Advanced analytics with charts
- Email notifications
- Role-based permissions
- Department management

## License

MIT

## Support

For issues or questions, contact your system administrator.
