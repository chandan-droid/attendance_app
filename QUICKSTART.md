# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies
```bash
cd "c:\Local Disk D_72220252316\my codes\src\web-apps\attendance_app"
npm install
```

### Step 2: Start the Development Server
```bash
npm run dev
```

The app will open at: **http://localhost:3000**

### Step 3: Make Sure Backend is Running
Ensure your Spring Boot backend is running on **http://localhost:8080**

## 📝 Quick Test Flow

### Testing Employee Features:

1. **Sign Up as Employee**:
   - Go to http://localhost:3000/signup
   - Name: John Doe
   - Email: john@example.com
   - Employee ID: EMP001
   - Password: password123
   - Role: Employee
   - Work Mode: On-Site (or Remote for testing without geofence)

2. **Login**:
   - Use email or employee ID: john@example.com
   - Password: password123

3. **Mark Attendance** (Employee Dashboard):
   - If you selected "Remote": No geofencing required
   - If you selected "On-Site": Admin must add a geofence location first
   - Select a project (must be assigned by admin)
   - Click "Punch In"

### Testing Admin Features:

1. **Sign Up as Admin**:
   - Go to http://localhost:3000/signup
   - Name: Admin User
   - Email: admin@example.com
   - Employee ID: ADM001
   - Password: admin123
   - Role: Admin
   - Work Mode: On-Site

2. **Login as Admin**:
   - Email: admin@example.com
   - Password: admin123

3. **Create a Project**:
   - Click "New Project"
   - Project Name: "Web Development"
   - Description: "Main web application"
   - Add dates (optional)
   - Click "Create Project"

4. **Assign Project to Employee**:
   - Click "Assign Project"
   - Select the project
   - Select the employee
   - Click "Assign Project"

5. **Add Geofence Location** (for On-Site employees):
   - Go to Geofence tab
   - Click "Add Location"
   - Location Name: "Main Office"
   - Click "Use My Current Location" OR enter coordinates manually
   - Set radius (default 200m is fine)
   - Click "Add Location"

6. **Create Tasks** (optional):
   - Click "New Task"
   - Select project
   - Task Name: "Frontend Development"
   - Description: "Build UI components"
   - Estimated Hours: 40
   - Click "Create Task"

## 🎯 Key Features to Test

### Employee Dashboard:
- ✅ Attendance tab with punch in/out
- ✅ Geofencing map (for On-Site mode)
- ✅ History tab with date filters
- ✅ Analytics with project hours
- ✅ Profile tab with work mode switching

### Admin Dashboard:
- ✅ Projects tab (create, view)
- ✅ Tasks creation
- ✅ Project assignment
- ✅ Employees tab (view all)
- ✅ Geofence tab (add locations with map)

## 🗺️ Testing Geofencing

**Option 1: Use Remote Mode**
- Set work mode to "Remote" in profile
- No geofencing verification needed

**Option 2: Test On-Site Mode**
1. Admin adds geofence with "Use My Current Location"
2. Employee stays in same location
3. Geofence verification will pass
4. Try moving far away to test failure

**Option 3: Manual Coordinates**
- Use coordinates from Google Maps
- Set radius large enough (200-500m) for testing
- Verify on map that user is within circle

## 📱 Responsive Testing

Test on different screen sizes:
- Desktop: Full sidebar visible
- Tablet: Hamburger menu appears
- Mobile: Touch-friendly interface

## 🎨 UI Highlights

- **Modern Gradients**: Purple/blue theme throughout
- **Smooth Animations**: Hover effects, transitions
- **Cards**: Clean, shadowed card components
- **Maps**: Interactive Leaflet maps with markers
- **Modals**: Centered forms with backdrop
- **Empty States**: Helpful messages when no data
- **Loading States**: Spinners during API calls

## ⚠️ Common Issues

**"Failed to fetch"**
- Backend not running → Start Spring Boot server
- CORS issue → Backend has @CrossOrigin

**Location not available**
- Browser blocked → Allow location in browser settings
- HTTP connection → Use HTTPS in production

**Can't punch in**
- No project assigned → Admin must assign project
- Outside geofence → Move closer or use Remote mode
- No geofence added → Admin must add location

## 🔐 Default Test Accounts

After running, you can use:

**Employee:**
- Email: employee@test.com
- Employee ID: EMP001
- Password: test123

**Admin:**
- Email: admin@test.com
- Employee ID: ADM001
- Password: admin123

*(Create these accounts via signup first)*

## 📊 API Configuration

Default backend URL: `http://localhost:8080/api`

To change, edit `src/services/api.js`:
```javascript
const API_BASE_URL = 'http://your-backend-url/api'
```

## 🎉 You're All Set!

Enjoy using the Attendance App! 

For detailed information, check the main README.md file.
