import React, { useState, useEffect } from 'react'
import { Plus, Briefcase, Calendar, Users, CheckCircle, ListTodo, ChevronDown, ChevronUp, Clock } from 'lucide-react'
import { projectAPI, userAPI } from '../../services/api'
import './ProjectsTab.css'

const ProjectsTab = () => {
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [expandedProjects, setExpandedProjects] = useState({})
  const [projectTasks, setProjectTasks] = useState({})

  const [projectForm, setProjectForm] = useState({
    projectName: '',
    description: '',
    startDate: '',
    endDate: '',
  })

  const [taskForm, setTaskForm] = useState({
    projectId: '',
    taskName: '',
    description: '',
    estimatedHours: '',
  })

  const [assignForm, setAssignForm] = useState({
    projectId: '',
    userId: '',
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [projectsRes, usersRes] = await Promise.all([
        projectAPI.getAllProjects(),
        userAPI.getAllUsers(),
      ])

      if (projectsRes.data.success) {
        setProjects(projectsRes.data.data || [])
      }
      if (usersRes.data.success) {
        setUsers(usersRes.data.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      const response = await projectAPI.createProject(projectForm)
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Project created successfully!' })
        setShowProjectModal(false)
        setProjectForm({ projectName: '', description: '', startDate: '', endDate: '' })
        fetchData()
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create project' })
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    try {
      console.log('Creating task with data:', taskForm)
      const response = await projectAPI.createTask(taskForm)
      console.log('Task creation response:', response.data)
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Task created successfully!' })
        setShowTaskModal(false)
        
        // Refresh tasks for the project
        if (taskForm.projectId) {
          try {
            const tasksRes = await projectAPI.getAllProjectTasks(taskForm.projectId)
            if (tasksRes.data.success) {
              setProjectTasks(prev => ({
                ...prev,
                [taskForm.projectId]: tasksRes.data.data || []
              }))
            }
          } catch (err) {
            console.error('Failed to refresh tasks:', err)
          }
        }
        
        setTaskForm({ projectId: '', taskName: '', description: '', estimatedHours: '' })
      }
    } catch (error) {
      console.error('Task creation error:', error.response?.data)
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create task' })
    }
  }

  const handleAssignProject = async (e) => {
    e.preventDefault()
    try {
      const response = await projectAPI.assignProjectToUser(assignForm.projectId, assignForm.userId)
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Project assigned successfully!' })
        setShowAssignModal(false)
        setAssignForm({ projectId: '', userId: '' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to assign project' })
    }
  }

  const toggleProjectExpand = async (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))

    // Fetch tasks if expanding and not already fetched
    if (!expandedProjects[projectId] && !projectTasks[projectId]) {
      try {
        // Admin endpoint to get all tasks for a specific project
        const response = await projectAPI.getAllProjectTasks(projectId)
        console.log('Tasks response:', response.data)
        
        // Handle different response formats
        let tasksData = []
        if (response.data.success) {
          tasksData = response.data.data || []
        } else if (Array.isArray(response.data)) {
          tasksData = response.data
        }
        
        setProjectTasks(prev => ({
          ...prev,
          [projectId]: tasksData
        }))
      } catch (error) {
        console.error('Error fetching tasks:', error.response?.data || error.message)
        // Set empty array on error so we don't keep retrying
        setProjectTasks(prev => ({
          ...prev,
          [projectId]: []
        }))
      }
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading projects...</p>
      </div>
    )
  }

  return (
    <div className="projects-tab">
      <div className="page-header">
        <div>
          <h2>Projects & Tasks</h2>
          <p>Manage projects, create tasks, and assign them to employees</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setShowProjectModal(true)} className="btn-primary">
            <Plus size={20} />
            New Project
          </button>
          <button onClick={() => setShowTaskModal(true)} className="btn-secondary">
            <ListTodo size={20} />
            New Task
          </button>
          <button onClick={() => setShowAssignModal(true)} className="btn-secondary">
            <Users size={20} />
            Assign Project
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.map((project) => {
          const isExpanded = expandedProjects[project.projectId]
          const tasks = projectTasks[project.projectId] || []
          
          return (
          <div key={project.projectId} className="project-card">
            <div className="project-card-header" onClick={() => toggleProjectExpand(project.projectId)} style={{ cursor: 'pointer' }}>
              <div className="project-icon">
                <Briefcase size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3>{project.projectName}</h3>
              </div>
              {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </div>
            
            <p className="project-description">{project.description || 'No description'}</p>
            
            <div className="project-meta">
              {project.startDate && (
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              )}
              {project.endDate && (
                <div className="meta-item">
                  <Calendar size={16} />
                  <span>End: {new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="meta-item">
                <ListTodo size={16} />
                <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Expandable Tasks Section */}
            {isExpanded && (
              <div className="tasks-section">
                <div className="tasks-header">
                  <h4>Tasks</h4>
                </div>
                {tasks.length > 0 ? (
                  <div className="tasks-list">
                    {tasks.map((task) => (
                      <div key={task.taskId} className="task-item">
                        <div className="task-header">
                          <CheckCircle size={18} className={task.status === 'COMPLETED' ? 'completed' : ''} />
                          <h5>{task.taskName}</h5>
                        </div>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}
                        <div className="task-meta">
                          {task.estimatedHours && (
                            <span className="task-hours">
                              <Clock size={14} />
                              {task.estimatedHours}h estimated
                            </span>
                          )}
                          {task.status && (
                            <span className={`task-status status-${task.status.toLowerCase()}`}>
                              {task.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-tasks">
                    <p>To view tasks, you must be assigned to this project first.</p>
                    <p style={{ fontSize: '12px', marginTop: '8px', color: '#a0aec0' }}>
                      Use the "Assign" button below to assign yourself, then expand to view tasks.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="project-actions">
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setTaskForm({ ...taskForm, projectId: project.projectId })
                  setShowTaskModal(true)
                }}
                className="btn-small">
                <Plus size={16} />
                Add Task
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setAssignForm({ ...assignForm, projectId: project.projectId })
                  setShowAssignModal(true)
                }}
                className="btn-small btn-outline"
              >
                <Users size={16} />
                Assign
              </button>
            </div>
          </div>
          )
        })}

        {projects.length === 0 && (
          <div className="empty-state">
            <Briefcase size={64} />
            <h3>No Projects Yet</h3>
            <p>Create your first project to get started</p>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showProjectModal && (
        <div className="modal-overlay" onClick={() => setShowProjectModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Project</h3>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label>Project Name *</label>
                <input
                  type="text"
                  value={projectForm.projectName}
                  onChange={(e) => setProjectForm({ ...projectForm, projectName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={projectForm.startDate}
                    onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={projectForm.endDate}
                    onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowProjectModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Create New Task</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Project *</label>
                <select
                  value={taskForm.projectId}
                  onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Task Name *</label>
                <input
                  type="text"
                  value={taskForm.taskName}
                  onChange={(e) => setTaskForm({ ...taskForm, taskName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>Estimated Hours</label>
                <input
                  type="number"
                  step="0.5"
                  value={taskForm.estimatedHours}
                  onChange={(e) => setTaskForm({ ...taskForm, estimatedHours: e.target.value })}
                  placeholder="e.g., 8.5"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowTaskModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Project Modal */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Assign Project to Employee</h3>
            <form onSubmit={handleAssignProject}>
              <div className="form-group">
                <label>Project *</label>
                <select
                  value={assignForm.projectId}
                  onChange={(e) => setAssignForm({ ...assignForm, projectId: e.target.value })}
                  required
                >
                  <option value="">Select a project</option>
                  {projects.map((project) => (
                    <option key={project.projectId} value={project.projectId}>
                      {project.projectName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Employee *</label>
                <select
                  value={assignForm.userId}
                  onChange={(e) => setAssignForm({ ...assignForm, userId: e.target.value })}
                  required
                >
                  <option value="">Select an employee</option>
                  {users.filter(u => u.role === 'EMPLOYEE').map((user) => (
                    <option key={user.userId} value={user.userId}>
                      {user.name} ({user.employeeId})
                    </option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowAssignModal(false)} className="btn-cancel">
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Assign Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectsTab
