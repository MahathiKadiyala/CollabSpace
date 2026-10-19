import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { initialProjects } from '../data/projects.js'
import {
  createTask,
  deleteTask,
  getProject,
  getProjectTasks,
  updateTask,
} from '../utils/api.js'
import {
  readProjectStorage,
  readStorage,
  removeProjectStorage,
  writeProjectStorage,
  writeStorage,
  STORAGE_KEYS,
} from '../utils/storage.js'

function persistProjectProgress(projectId, progress) {
  const projects = readStorage(STORAGE_KEYS.projects, initialProjects)
  const updatedProjects = projects.map((project) =>
    project.id === projectId ? { ...project, progress } : project
  )
  writeStorage(STORAGE_KEYS.projects, updatedProjects)
}

// Reusable Components
function MetricCard({ icon, label, value, subtext }) {
  return (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <span className="metric-label">{label}</span>
        <span className="metric-value">{value}</span>
        {subtext && <span className="metric-subtext">{subtext}</span>}
      </div>
    </div>
  )
}

function StatCard({ title, stat, total, percentage, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <h4>{title}</h4>
      </div>
      <div className="stat-body">
        <div className="stat-number-large">
          <span style={{ color: accent }}>{stat}</span>
          <span className="stat-divider">/</span>
          <span>{total}</span>
        </div>
        <div className="stat-bar-wrapper">
          <div className="stat-bar">
            <div
              className="stat-bar-fill"
              style={{
                width: `${percentage}%`,
                background: accent,
              }}
            ></div>
          </div>
          <span className="stat-percentage">{percentage}%</span>
        </div>
      </div>
    </div>
  )
}

function ActivityItem({ timestamp, author, action, details, icon }) {
  return (
    <div className="activity-item">
      <div className="activity-icon">{icon}</div>
      <div className="activity-content">
        <div className="activity-header">
          <span className="activity-author">{author}</span>
          <span className="activity-action">{action}</span>
        </div>
        {details && <p className="activity-details">{details}</p>}
        <span className="activity-time">{timestamp}</span>
      </div>
    </div>
  )
}

function OverviewSection({ project }) {
  // Dummy data for overview metrics
  const overviewMetrics = [
    { icon: '👥', label: 'Team Members', value: project.members },
    { icon: '✓', label: 'Total Tasks', value: 12 },
    { icon: '✅', label: 'Completed', value: 8 },
    { icon: '📅', label: 'Days Left', value: 18 },
  ]

  // Dummy recent activity data
  const recentActivities = [
    {
      timestamp: '2 hours ago',
      author: 'Mahathi',
      action: 'created',
      details: 'Task: Setup authentication module',
      icon: '✨',
    },
    {
      timestamp: '5 hours ago',
      author: 'Alex Chen',
      action: 'completed',
      details: 'Task: Database schema design',
      icon: '✅',
    },
    {
      timestamp: '1 day ago',
      author: 'Sarah Williams',
      action: 'commented on',
      details: 'Task: API endpoint development',
      icon: '💬',
    },
    {
      timestamp: '2 days ago',
      author: 'Mahathi',
      action: 'updated',
      details: 'Project progress to 70%',
      icon: '📊',
    },
    {
      timestamp: '3 days ago',
      author: 'Alex Chen',
      action: 'joined',
      details: 'the project',
      icon: '👋',
    },
  ]

  return (
    <div className="section-content">
      {/* Main Content Grid */}
      <div className="overview-grid-main">
        {/* Left Column - Description and Details */}
        <div className="overview-left">
          {/* Description Box */}
          <div className="description-card">
            <h3>About This Project</h3>
            <p className="description-text">{project.description}</p>
          </div>

          {/* Project Details */}
          <div className="details-card">
            <h3>Project Details</h3>
            <div className="details-grid">
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value">{project.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Deadline</span>
                <span className="detail-value">{project.deadline}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span className="detail-value">
                  <span className="status-badge">{formatProjectStatus(project.status)}</span>
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Created</span>
                <span className="detail-value">Aug 1, 2026</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Metrics */}
        <div className="overview-right">
          <div className="metrics-grid">
            {overviewMetrics.map((metric, idx) => (
              <MetricCard key={idx} {...metric} />
            ))}
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="progress-card-large">
        <h3>Overall Progress</h3>
        <div className="progress-display-large">
          <div className="progress-visual">
            <div className="progress-circle-large">
              <span className="progress-text-large">{project.progress}%</span>
            </div>
          </div>
          <div className="progress-info">
            <div className="progress-bar-full">
              <div
                className="progress-bar-fill-full"
                style={{
                  width: `${project.progress}%`,
                  background: project.accent,
                }}
              ></div>
            </div>
            <div className="progress-breakdown">
              <div className="breakdown-item">
                <span className="breakdown-label">Completed</span>
                <span className="breakdown-value" style={{ color: project.accent }}>
                  8/12 tasks
                </span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">In Progress</span>
                <span className="breakdown-value">3/12 tasks</span>
              </div>
              <div className="breakdown-item">
                <span className="breakdown-label">Not Started</span>
                <span className="breakdown-value">1/12 tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <h3>Task Overview</h3>
        <div className="stats-grid">
          <StatCard
            title="Task Completion"
            stat={8}
            total={12}
            percentage={67}
            accent={project.accent}
          />
          <StatCard title="Team Contribution" stat={4} total={5} percentage={80} accent="#06b6d4" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-section">
        <h3>Recent Activity</h3>
        <div className="activity-feed">
          {recentActivities.map((activity, idx) => (
            <ActivityItem key={idx} {...activity} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Dummy members data
const DUMMY_MEMBERS = [
  { id: 1, name: 'You', avatar: '👤', color: '#7c3aed' },
  { id: 2, name: 'Alex Chen', avatar: '👨‍💻', color: '#10b981' },
  { id: 3, name: 'Sarah Williams', avatar: '👩‍💼', color: '#f97316' },
  { id: 4, name: 'Mahathi Reddy', avatar: '👨‍🎨', color: '#06b6d4' },
  { id: 5, name: 'Emma Thompson', avatar: '👩‍🔬', color: '#ec4899' },
]

const TASK_MEMBERS = DUMMY_MEMBERS.filter((member) => member.id === 1)

const formatProjectStatus = (status) =>
  (status || 'planning')
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

function MessageBubble({ message, isCurrentUser }) {
  const member = DUMMY_MEMBERS.find((m) => m.id === message.memberId)

  return (
    <div className={`message-bubble ${isCurrentUser ? 'current-user' : 'other-user'}`}>
      <div className="message-avatar">{member?.avatar}</div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-author" style={{ color: member?.color }}>
            {member?.name}
          </span>
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
        <p className="message-text">{message.text}</p>
      </div>
    </div>
  )
}

// Global discussion state indexed by projectId
let discussionState = {}

function DiscussionSection({ projectId, project }) {
  // Initialize messages for this project if not exists
  if (!discussionState[projectId]) {
    discussionState[projectId] = [
      {
        id: 1,
        projectId,
        memberId: 2,
        text: 'Great project! Let me know if you need any help with the implementation.',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 2,
        projectId,
        memberId: 1,
        text: 'Thanks! We are planning to start with the database setup next week.',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
      {
        id: 3,
        projectId,
        memberId: 3,
        text: 'I can help with the UI mockups. Should we schedule a design meeting?',
        timestamp: new Date(Date.now() - 600000).toISOString(),
      },
    ]
    discussionState[projectId] = readProjectStorage(
      STORAGE_KEYS.discussions,
      projectId,
      discussionState[projectId]
    )
  }

  const [messages, setMessages] = useState(discussionState[projectId])
  const [inputValue, setInputValue] = useState('')
  const messagesEndRef = useState(null)[1]

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!inputValue.trim()) return

    const newMessage = {
      id: messages.length + 1,
      projectId,
      memberId: 1, // Current user is always "You"
      text: inputValue,
      timestamp: new Date().toISOString(),
    }

    const updatedMessages = [...messages, newMessage]
    setMessages(updatedMessages)
    discussionState[projectId] = updatedMessages
    writeProjectStorage(STORAGE_KEYS.discussions, projectId, updatedMessages)
    setInputValue('')

    // Auto-scroll to bottom
    setTimeout(() => {
      const messagesContainer = document.querySelector('.messages-container')
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight
      }
    }, 0)
  }

  return (
    <div className="section-content discussion-section">
      <div className="messages-container">
        {messages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">💬</span>
            <h3>No discussions yet</h3>
            <p>Start a discussion to collaborate with your team</p>
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={message.memberId === 1}
            />
          ))
        )}
      </div>

      <form className="message-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          className="message-input"
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
        <button type="submit" className="send-button">
          <span>Send</span>
        </button>
      </form>
    </div>
  )
}

function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const member = DUMMY_MEMBERS.find((m) => m.id === task.assigned_to)
  const statusColors = {
    todo: '#769792',
    in_progress: '#f97316',
    completed: '#10b981',
  }
  const isOverdue = task.deadline && task.status !== 'completed' && new Date(`${task.deadline}T23:59:59`) < new Date()
  const formatDate = (value) => value ? new Date(`${value}T00:00:00`).toLocaleDateString() : 'No deadline'
  const formatStatus = (value) => value.replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
  const formatPriority = (value) => value.toUpperCase()

  return (
    <article className={`task-card ${isOverdue ? 'task-card-overdue' : ''}`}>
      <div className="task-header">
        <h4 className="task-title">{task.title}</h4>
        <div className="task-badges">
          <div className="task-status-badge" style={{ background: statusColors[task.status] }}>
            {formatStatus(task.status)}
          </div>
          <span className={`task-priority task-priority-${task.priority}`}>{formatPriority(task.priority)}</span>
        </div>
      </div>

      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        <div className="task-meta-item">
          <span className="meta-label">Assigned</span>
          <span className="meta-value">{member?.name || (task.assigned_to ? `Member #${task.assigned_to}` : 'Unassigned')}</span>
        </div>
        <div className="task-meta-item">
          <span className="meta-label">Due</span>
          <span className={`meta-value ${isOverdue ? 'overdue-label' : ''}`}>{isOverdue ? 'Overdue: ' : ''}{formatDate(task.deadline)}</span>
        </div>
      </div>

      <div className="task-actions">
        <select
          className="status-select"
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value)}
          aria-label={`Change status for ${task.title}`}
        >
          <option value="todo">TODO</option>
          <option value="in_progress">IN PROGRESS</option>
          <option value="completed">COMPLETED</option>
        </select>
        <button type="button" className="task-edit-btn" onClick={() => onEdit(task)}>Edit</button>
        <button type="button" className="delete-task-btn" onClick={() => onDelete(task.id)}>
          Delete
        </button>
      </div>
    </article>
  )
}

function TaskModal({ task, onClose, onSubmit, isSaving, error }) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assigned_to: task?.assigned_to || '',
    priority: task?.priority || 'medium',
    status: task?.status || 'todo',
    deadline: task?.deadline || '',
  })

  const updateField = (field, value) => setFormData((current) => ({ ...current, [field]: value }))

  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit({
      ...formData,
      assigned_to: formData.assigned_to ? Number(formData.assigned_to) : null,
      deadline: formData.deadline || null,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'New Task'}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close task form">✕</button>
        </div>
        <form className="modal-form" onSubmit={handleSubmit}>
          <label className="form-group">Title *<input className="form-input" value={formData.title} onChange={(event) => updateField('title', event.target.value)} required maxLength="200" /></label>
          <label className="form-group">Description<textarea className="form-textarea" value={formData.description} onChange={(event) => updateField('description', event.target.value)} rows="3" /></label>
          <div className="form-grid">
            <label className="form-group">Assign to<select className="form-select" value={formData.assigned_to} onChange={(event) => updateField('assigned_to', event.target.value)}><option value="">Unassigned</option>{TASK_MEMBERS.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}</select></label>
            <label className="form-group">Deadline<input type="date" className="form-input" value={formData.deadline} onChange={(event) => updateField('deadline', event.target.value)} /></label>
            <label className="form-group">Priority<select className="form-select" value={formData.priority} onChange={(event) => updateField('priority', event.target.value)}><option value="low">LOW</option><option value="medium">MEDIUM</option><option value="high">HIGH</option></select></label>
            <label className="form-group">Status<select className="form-select" value={formData.status} onChange={(event) => updateField('status', event.target.value)}><option value="todo">TODO</option><option value="in_progress">IN PROGRESS</option><option value="completed">COMPLETED</option></select></label>
          </div>
          {error && <p className="error-message">{error}</p>}
          <div className="modal-actions"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button-primary" disabled={isSaving}>{isSaving ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}</button></div>
        </form>
      </div>
    </div>
  )
}

function TasksSection({ projectId }) {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingTask, setEditingTask] = useState(null)
  const [isCreating, setIsCreating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const loadTasks = async (signal) => {
    setIsLoading(true)
    try {
      const loadedTasks = await getProjectTasks(projectId, signal)
      setTasks(loadedTasks)
      setError('')
    } catch (loadError) {
      if (loadError.name !== 'AbortError') setError(loadError.message)
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    loadTasks(controller.signal)
    return () => controller.abort()
  }, [projectId])

  const refreshTasks = async () => loadTasks()
  const calculateProgress = (taskList) => taskList.length ? Math.round((taskList.filter((task) => task.status === 'completed').length / taskList.length) * 100) : 0

  const handleSubmit = async (taskData) => {
    setIsSaving(true)
    setFormError('')
    try {
      if (editingTask) await updateTask(editingTask.id, taskData)
      else await createTask({ ...taskData, project_id: Number(projectId) })
      await refreshTasks()
      setEditingTask(null)
      setIsCreating(false)
    } catch (saveError) {
      setFormError(saveError.message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await updateTask(taskId, { status })
      await refreshTasks()
    } catch (updateError) {
      setError(updateError.message)
    }
  }

  const handleDelete = async (taskId) => {
    if (!window.confirm('Delete this task?')) return
    try {
      await deleteTask(taskId)
      await refreshTasks()
    } catch (deleteError) {
      setError(deleteError.message)
    }
  }

  const columns = [
    ['todo', 'TODO'],
    ['in_progress', 'IN PROGRESS'],
    ['completed', 'COMPLETED'],
  ]
  const completedTasks = tasks.filter((task) => task.status === 'completed')

  return (
    <div className="section-content tasks-section">
      <div className="tasks-header">
        <div className="tasks-stats"><div className="stat-item"><span className="stat-count">{tasks.length}</span><span className="stat-label">Total Tasks</span></div><div className="stat-item"><span className="stat-count">{completedTasks.length}</span><span className="stat-label">Completed</span></div><div className="stat-item"><span className="stat-count">{calculateProgress(tasks)}%</span><span className="stat-label">Progress</span></div></div>
        <button className="add-task-button" onClick={() => { setFormError(''); setIsCreating(true) }}>+ New Task</button>
      </div>
      {isLoading && <div className="empty-state"><p>Loading tasks...</p></div>}
      {!isLoading && error && <div className="empty-state"><h3>Could not load tasks</h3><p>{error}</p></div>}
      {!isLoading && !error && tasks.length === 0 && <div className="empty-state"><span className="empty-icon">✓</span><h3>No tasks yet</h3><p>Create your first task.</p></div>}
      {!isLoading && !error && tasks.length > 0 && <div className="tasks-board">{columns.map(([status, label]) => <div className="task-column" key={status}><div className="column-header"><h3>{label}</h3><span className="column-count">{tasks.filter((task) => task.status === status).length}</span></div><div className="tasks-list">{tasks.filter((task) => task.status === status).map((task) => <TaskCard key={task.id} task={task} onStatusChange={handleStatusChange} onEdit={(selectedTask) => { setFormError(''); setEditingTask(selectedTask) }} onDelete={handleDelete} />)}</div></div>)}</div>}
      {(isCreating || editingTask) && <TaskModal task={editingTask} onClose={() => { setIsCreating(false); setEditingTask(null) }} onSubmit={handleSubmit} isSaving={isSaving} error={formError} />}
    </div>
  )
}

function NoteCard({ note, onEdit, onDelete, isEditing, onSaveEdit, onCancelEdit, editData, setEditData }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isEditing) {
    return (
      <div className="note-card note-card-editing">
        <input
          type="text"
          className="note-edit-title"
          value={editData.title}
          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
          placeholder="Note title..."
        />
        <textarea
          className="note-edit-content"
          value={editData.content}
          onChange={(e) => setEditData({ ...editData, content: e.target.value })}
          placeholder="Note content..."
          rows="6"
        />
        <div className="note-edit-actions">
          <button className="save-note-btn" onClick={onSaveEdit}>
            Save
          </button>
          <button className="cancel-edit-btn" onClick={onCancelEdit}>
            Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="note-card">
      <div className="note-header">
        <h3 className="note-title">{note.title}</h3>
        <div className="note-actions">
          <button className="note-action-btn edit-btn" onClick={() => onEdit(note.id)}>
            ✎
          </button>
          <button className="note-action-btn delete-btn" onClick={() => onDelete(note.id)}>
            ✕
          </button>
        </div>
      </div>

      <p className="note-content">{note.content}</p>

      <div className="note-footer">
        <span className="note-date">{formatDate(note.createdAt)}</span>
        {note.updatedAt !== note.createdAt && (
          <span className="note-edited">(edited {formatDate(note.updatedAt)})</span>
        )}
      </div>
    </div>
  )
}

function NoteForm({ onAddNote, isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim()) return

    onAddNote({
      title: formData.title,
      content: formData.content,
    })

    setFormData({
      title: '',
      content: '',
    })
    setIsOpen(false)
  }

  return (
    <div className="note-form-container">
      {!isOpen ? (
        <button className="add-note-button" onClick={() => setIsOpen(true)}>
          + New Note
        </button>
      ) : (
        <form className="note-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder="Note title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <textarea
              className="form-textarea"
              placeholder="Write your note here..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows="6"
            />
          </div>

          <div className="form-row form-actions">
            <button type="submit" className="primary-button">
              Create Note
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// Global notes state indexed by projectId
let notesState = {}

function NotesSection({ projectId, project }) {
  // Initialize notes for this project if not exists
  if (!notesState[projectId]) {
    notesState[projectId] = [
      {
        id: 1,
        projectId,
        title: 'Project Requirements',
        content:
          'Document all project requirements and acceptance criteria. Include: user stories, functional requirements, non-functional requirements, and acceptance tests.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        projectId,
        title: 'Architecture Notes',
        content:
          'Key design decisions: Using microservices architecture with Docker containers. Database: PostgreSQL for relational data. Cache: Redis for performance. Message queue: RabbitMQ for async processing.',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        projectId,
        title: 'Meeting Notes - Aug 28',
        content:
          'Team sync meeting: Discussed sprint planning for next 2 weeks. Frontend team will focus on UI components. Backend team will work on API endpoints. QA will prepare test cases. Next meeting: Sept 4.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        projectId,
        title: 'API Endpoints Todo',
        content:
          'Remaining endpoints to implement:\n- PUT /projects/:id (update project)\n- DELETE /projects/:id (delete project)\n- GET /projects/:id/tasks (list tasks)\n- POST /tasks (create task)\n- PATCH /tasks/:id (update task status)',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
    notesState[projectId] = readProjectStorage(STORAGE_KEYS.notes, projectId, notesState[projectId])
  }

  const [notes, setNotes] = useState(notesState[projectId])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({ title: '', content: '' })

  const handleAddNote = (noteData) => {
    const newNote = {
      id: Math.max(...notes.map((n) => n.id), 0) + 1,
      projectId,
      ...noteData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    const updatedNotes = [...notes, newNote]
    setNotes(updatedNotes)
    notesState[projectId] = updatedNotes
    writeProjectStorage(STORAGE_KEYS.notes, projectId, updatedNotes)
  }

  const handleEditNote = (noteId) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      setEditingId(noteId)
      setEditData({ title: note.title, content: note.content })
    }
  }

  const handleSaveEdit = () => {
    const updatedNotes = notes.map((n) =>
      n.id === editingId
        ? { ...n, title: editData.title, content: editData.content, updatedAt: new Date().toISOString() }
        : n
    )
    setNotes(updatedNotes)
    notesState[projectId] = updatedNotes
    writeProjectStorage(STORAGE_KEYS.notes, projectId, updatedNotes)
    setEditingId(null)
    setEditData({ title: '', content: '' })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditData({ title: '', content: '' })
  }

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter((n) => n.id !== noteId)
    setNotes(updatedNotes)
    notesState[projectId] = updatedNotes
    writeProjectStorage(STORAGE_KEYS.notes, projectId, updatedNotes)
  }

  return (
    <div className="section-content notes-section">
      <div className="notes-header">
        <div className="notes-info">
          <h3>Project Notes</h3>
          <p className="notes-subtitle">{notes.length} notes</p>
        </div>
        <NoteForm onAddNote={handleAddNote} isOpen={isFormOpen} setIsOpen={setIsFormOpen} />
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📝</span>
          <h3>No notes yet</h3>
          <p>Add notes to keep important information organized</p>
        </div>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onEdit={handleEditNote}
              onDelete={handleDeleteNote}
              isEditing={editingId === note.id}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              editData={editData}
              setEditData={setEditData}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FileCard({ file, onRemove }) {
  const getFileIcon = (type) => {
    const iconMap = {
      pdf: '📄',
      doc: '📋',
      docx: '📋',
      txt: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '🎯',
      pptx: '🎯',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      zip: '📦',
      rar: '📦',
      mp4: '🎬',
      mp3: '🎵',
      default: '📎',
    }
    return iconMap[type] || iconMap.default
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="file-card">
      <div className="file-icon">{getFileIcon(file.type.toLowerCase())}</div>

      <div className="file-info">
        <h4 className="file-name">{file.name}</h4>
        <div className="file-meta">
          <span className="file-type">{file.type.toUpperCase()}</span>
          <span className="file-size">{formatFileSize(file.size)}</span>
        </div>
        <span className="file-date">{formatDate(file.uploadedAt)}</span>
      </div>

      <div className="file-actions">
        <button className="download-file-btn" title="Download file">
          ↓
        </button>
        <button className="remove-file-btn" onClick={() => onRemove(file.id)} title="Delete file">
          ✕
        </button>
      </div>
    </div>
  )
}

function FileUpload({ onFileSelect }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleFileInput = (e) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        onFileSelect({
          name: file.name,
          type: file.name.split('.').pop(),
          size: file.size,
        })
      })
      e.target.value = '' // Reset input
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = e.dataTransfer.files
    if (files) {
      Array.from(files).forEach((file) => {
        onFileSelect({
          name: file.name,
          type: file.name.split('.').pop(),
          size: file.size,
        })
      })
    }
  }

  return (
    <div
      className={`file-upload-area ${isDragging ? 'dragging' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="file-input"
        className="file-input-hidden"
        onChange={handleFileInput}
        multiple
        style={{ display: 'none' }}
      />
      <label htmlFor="file-input" className="file-upload-label">
        <span className="upload-icon">📁</span>
        <span className="upload-text">Click to upload or drag and drop</span>
        <span className="upload-subtext">Supported all file types</span>
      </label>
    </div>
  )
}

// Global files state indexed by projectId
let filesState = {}

function FilesSection({ projectId, project }) {
  // Initialize files for this project if not exists
  if (!filesState[projectId]) {
    filesState[projectId] = [
      {
        id: 1,
        projectId,
        name: 'Project_Proposal.pdf',
        type: 'pdf',
        size: 2457600,
        uploadedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        projectId,
        name: 'Design_Mockups.zip',
        type: 'zip',
        size: 15728640,
        uploadedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        projectId,
        name: 'API_Documentation.docx',
        type: 'docx',
        size: 512000,
        uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        projectId,
        name: 'Database_Schema.png',
        type: 'png',
        size: 1024000,
        uploadedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 5,
        projectId,
        name: 'Meeting_Notes_Aug28.txt',
        type: 'txt',
        size: 125000,
        uploadedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 6,
        projectId,
        name: 'Requirements_Spreadsheet.xlsx',
        type: 'xlsx',
        size: 768000,
        uploadedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }

  const [files, setFiles] = useState(filesState[projectId])

  const handleFileSelect = (fileData) => {
    const newFile = {
      id: Math.max(...files.map((f) => f.id), 0) + 1,
      projectId,
      ...fileData,
      uploadedAt: new Date().toISOString(),
    }
    const updatedFiles = [...files, newFile]
    setFiles(updatedFiles)
    filesState[projectId] = updatedFiles
  }

  const handleRemoveFile = (fileId) => {
    const updatedFiles = files.filter((f) => f.id !== fileId)
    setFiles(updatedFiles)
    filesState[projectId] = updatedFiles
  }

  const totalSize = files.reduce((sum, file) => sum + file.size, 0)

  const formatTotalSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="section-content files-section">
      <div className="files-header">
        <div className="files-info">
          <h3>Project Files</h3>
          <p className="files-subtitle">
            {files.length} files • {formatTotalSize(totalSize)}
          </p>
        </div>
      </div>

      <FileUpload onFileSelect={handleFileSelect} />

      {files.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📁</span>
          <h3>No files yet</h3>
          <p>Upload files to share with your team</p>
        </div>
      ) : (
        <div className="files-list">
          <div className="files-list-header">
            <span className="header-name">Name</span>
            <span className="header-size">Size</span>
            <span className="header-date">Date</span>
            <span className="header-actions">Actions</span>
          </div>
          {files.map((file) => (
            <FileCard key={file.id} file={file} onRemove={handleRemoveFile} />
          ))}
        </div>
      )}
    </div>
  )
}

function MemberCard({ member, isOwner, onRemove }) {
  const getRoleColor = (role) => {
    const colors = {
      Owner: '#7c3aed',
      Admin: '#f97316',
      Member: '#06b6d4',
      Viewer: '#769792',
    }
    return colors[role] || colors.Member
  }

  return (
    <div className="member-card">
      <div className="member-header">
        <div className="member-avatar">{member.avatar}</div>
        <div className="member-details">
          <h4 className="member-name">{member.name}</h4>
          <p className="member-email">{member.email}</p>
        </div>
      </div>

      <div className="member-role">
        <span className="role-badge" style={{ background: getRoleColor(member.role) }}>
          {member.role}
        </span>
      </div>

      {!isOwner && (
        <button className="remove-member-btn" onClick={() => onRemove(member.id)} title="Remove member">
          ✕
        </button>
      )}
    </div>
  )
}

function AddMemberForm({ onAddMember, isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    email: '',
    role: 'Member',
  })

  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return
    }

    onAddMember({
      email: formData.email,
      role: formData.role,
    })

    setFormData({
      email: '',
      role: 'Member',
    })
    setIsOpen(false)
  }

  return (
    <div className="add-member-container">
      {!isOpen ? (
        <button className="add-member-button" onClick={() => setIsOpen(true)}>
          + Add Member
        </button>
      ) : (
        <form className="add-member-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="email"
              className="form-input"
              placeholder="Email address *"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>

          {error && <div className="form-error">{error}</div>}

          <div className="form-row form-actions">
            <button type="submit" className="primary-button">
              Add Member
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setIsOpen(false)
                setError('')
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// Global members state indexed by projectId
let membersState = {}

function MembersSection({ projectId, project }) {
  // Initialize members for this project if not exists
  if (!membersState[projectId]) {
    const baseMembers = [
      {
        id: 1,
        projectId,
        name: 'You',
        email: 'you@example.com',
        role: 'Owner',
        avatar: '👤',
      },
    ]

    // Add team members only for Group projects
    if (project.type === 'Group') {
      baseMembers.push(
        {
          id: 2,
          projectId,
          name: 'Alex Chen',
          email: 'alex.chen@example.com',
          role: 'Admin',
          avatar: '👨‍💻',
        },
        {
          id: 3,
          projectId,
          name: 'Sarah Williams',
          email: 'sarah.williams@example.com',
          role: 'Member',
          avatar: '👩‍💼',
        },
        {
          id: 4,
          projectId,
          name: 'Mahathi Reddy',
          email: 'mahathi.reddy@example.com',
          role: 'Member',
          avatar: '👨‍🎨',
        },
        {
          id: 5,
          projectId,
          name: 'Emma Thompson',
          email: 'emma.thompson@example.com',
          role: 'Viewer',
          avatar: '👩‍🔬',
        }
      )
    }

    membersState[projectId] = baseMembers
    membersState[projectId] = readProjectStorage(STORAGE_KEYS.members, projectId, membersState[projectId])
  }

  const [members, setMembers] = useState(membersState[projectId])
  const [isFormOpen, setIsFormOpen] = useState(false)

  const handleAddMember = (memberData) => {
    const newMember = {
      id: Math.max(...members.map((m) => m.id), 0) + 1,
      projectId,
      name: memberData.email.split('@')[0], // Use email prefix as initial name
      email: memberData.email,
      role: memberData.role,
      avatar: '👤', // Default avatar
    }
    const updatedMembers = [...members, newMember]
    setMembers(updatedMembers)
    membersState[projectId] = updatedMembers
    writeProjectStorage(STORAGE_KEYS.members, projectId, updatedMembers)
  }

  const handleRemoveMember = (memberId) => {
    // Don't allow removing the owner
    const member = members.find((m) => m.id === memberId)
    if (member?.role === 'Owner') return

    const updatedMembers = members.filter((m) => m.id !== memberId)
    setMembers(updatedMembers)
    membersState[projectId] = updatedMembers
    writeProjectStorage(STORAGE_KEYS.members, projectId, updatedMembers)
  }

  const owner = members.find((m) => m.role === 'Owner')
  const teamMembers = members.filter((m) => m.role !== 'Owner')

  return (
    <div className="section-content members-section">
      <div className="members-header">
        <div className="members-info">
          <h3>Project Members</h3>
          <p className="members-subtitle">{members.length} member{members.length !== 1 ? 's' : ''}</p>
        </div>
        {project.type === 'Group' && (
          <AddMemberForm onAddMember={handleAddMember} isOpen={isFormOpen} setIsOpen={setIsFormOpen} />
        )}
      </div>

      {/* Project Owner Section */}
      <div className="members-section-group">
        <h4 className="group-title">Project Owner</h4>
        {owner && (
          <MemberCard member={owner} isOwner={true} onRemove={handleRemoveMember} />
        )}
      </div>

      {/* Team Members Section */}
      {project.type === 'Group' ? (
        <div className="members-section-group">
          <h4 className="group-title">Team Members</h4>
          {teamMembers.length === 0 ? (
            <div className="no-members">
              <p>No team members added yet. Invite team members to collaborate!</p>
            </div>
          ) : (
            <div className="members-list">
              {teamMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  isOwner={false}
                  onRemove={handleRemoveMember}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="members-section-group">
          <h4 className="group-title">Team Members</h4>
          <div className="individual-project-notice">
            <span className="notice-icon">👤</span>
            <p className="notice-text">This is an individual project. You are the sole owner and member.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function AnnouncementCard({ announcement, isOwner, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="announcement-card">
      <div className="announcement-header">
        <h3 className="announcement-title">{announcement.title}</h3>
        {isOwner && (
          <button
            className="delete-announcement-btn"
            onClick={() => onDelete(announcement.id)}
            title="Delete announcement"
          >
            ✕
          </button>
        )}
      </div>

      <p className="announcement-message">{announcement.message}</p>

      <div className="announcement-footer">
        <span className="announcement-date">{formatDate(announcement.createdAt)}</span>
        <span className="announcement-badge">📢 Announcement</span>
      </div>
    </div>
  )
}

function AnnouncementForm({ onAddAnnouncement, isOpen, setIsOpen }) {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.message.trim()) return

    onAddAnnouncement({
      title: formData.title,
      message: formData.message,
    })

    setFormData({
      title: '',
      message: '',
    })
    setIsOpen(false)
  }

  return (
    <div className="announcement-form-container">
      {!isOpen ? (
        <button className="post-announcement-button" onClick={() => setIsOpen(true)}>
          📢 Post Announcement
        </button>
      ) : (
        <form className="announcement-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <input
              type="text"
              className="form-input"
              placeholder="Announcement title *"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="form-row">
            <textarea
              className="form-textarea"
              placeholder="Write your announcement message..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows="4"
              required
            />
          </div>

          <div className="form-row form-actions">
            <button type="submit" className="primary-button">
              Post Announcement
            </button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

// Global announcements state indexed by projectId
let announcementsState = {}

function AnnouncementsSection({ projectId, project }) {
  // Initialize announcements for this project if not exists
  if (!announcementsState[projectId]) {
    announcementsState[projectId] = [
      {
        id: 1,
        projectId,
        title: 'Project Kick-off Meeting Scheduled',
        message:
          'We are excited to announce the official project kick-off meeting. All team members are required to attend. The meeting will cover project goals, timeline, and team responsibilities. Meeting details will be sent via email.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 2,
        projectId,
        title: 'Database Migration Complete',
        message:
          'The database migration has been successfully completed. All data has been transferred to the new PostgreSQL instance. Performance improvements are already noticeable. Thank you for your patience during this maintenance.',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 3,
        projectId,
        title: 'New Sprint Starting Tomorrow',
        message:
          'Sprint 3 begins tomorrow with a new set of features. Please review the sprint board and make sure you understand your assigned tasks. Daily stand-ups will continue at 10 AM EST. Good luck team!',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 4,
        projectId,
        title: 'Maintenance Window Scheduled for Aug 31',
        message:
          'A scheduled maintenance window has been planned for August 31, 2026 from 2:00 PM to 4:00 PM EST. The system will be offline during this time. Please plan accordingly and save your work.',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      },
    ]
    announcementsState[projectId] = readProjectStorage(
      STORAGE_KEYS.announcements,
      projectId,
      announcementsState[projectId]
    )
  }

  const [announcements, setAnnouncements] = useState(announcementsState[projectId])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const isOwner = true // In a real app, this would check actual ownership

  const handleAddAnnouncement = (announcementData) => {
    const newAnnouncement = {
      id: Math.max(...announcements.map((a) => a.id), 0) + 1,
      projectId,
      ...announcementData,
      createdAt: new Date().toISOString(),
    }
    const updatedAnnouncements = [...announcements, newAnnouncement]
    setAnnouncements(updatedAnnouncements)
    announcementsState[projectId] = updatedAnnouncements
    writeProjectStorage(STORAGE_KEYS.announcements, projectId, updatedAnnouncements)
  }

  const handleDeleteAnnouncement = (announcementId) => {
    const updatedAnnouncements = announcements.filter((a) => a.id !== announcementId)
    setAnnouncements(updatedAnnouncements)
    announcementsState[projectId] = updatedAnnouncements
    writeProjectStorage(STORAGE_KEYS.announcements, projectId, updatedAnnouncements)
  }

  return (
    <div className="section-content announcements-section">
      <div className="announcements-header">
        <div className="announcements-info">
          <h3>Project Announcements</h3>
          <p className="announcements-subtitle">{announcements.length} announcement{announcements.length !== 1 ? 's' : ''}</p>
        </div>
        {isOwner && (
          <AnnouncementForm
            onAddAnnouncement={handleAddAnnouncement}
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
          />
        )}
      </div>

      {announcements.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📢</span>
          <h3>No announcements yet</h3>
          <p>Share important updates with your team</p>
        </div>
      ) : (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              isOwner={isOwner}
              onDelete={handleDeleteAnnouncement}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function SettingsSection({ project, onUpdate, onDelete }) {
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description,
    type: project.type,
    deadline: project.deadline,
    status: formatProjectStatus(project.status),
  })
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.deadline.trim()) return

    onUpdate({
      ...formData,
      name: formData.name.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline.trim(),
    })
  }

  return (
    <div className="section-content settings-section">
      <div className="settings-header">
        <div>
          <h3>Project Settings</h3>
          <p className="settings-subtitle">Update the details for this project.</p>
        </div>
      </div>

      <form className="settings-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="settings-name">Project Name</label>
          <input
            id="settings-name"
            name="name"
            className="form-input"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="settings-description">Description</label>
          <textarea
            id="settings-description"
            name="description"
            className="form-textarea"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="settings-form-grid">
          <div className="form-group">
            <label htmlFor="settings-type">Project Type</label>
            <select
              id="settings-type"
              name="type"
              className="form-select"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="settings-status">Project Status</label>
            <select
              id="settings-status"
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="settings-deadline">Deadline</label>
          <input
            id="settings-deadline"
            name="deadline"
            className="form-input"
            value={formData.deadline}
            onChange={handleChange}
            required
          />
        </div>

        <div className="settings-actions">
          <button type="submit" className="primary-button">
            Save Changes
          </button>
        </div>
      </form>

      <div className="settings-danger-zone">
        <div>
          <h4>Delete Project</h4>
          <p>Remove this project and all of its workspace data.</p>
        </div>
        <button
          type="button"
          className="delete-project-button"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          Delete Project
        </button>
      </div>

      {isDeleteDialogOpen && (
        <div className="modal-overlay" onClick={() => setIsDeleteDialogOpen(false)}>
          <div className="modal-content delete-confirmation" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete project?</h2>
              <button
                className="modal-close"
                onClick={() => setIsDeleteDialogOpen(false)}
                aria-label="Close confirmation dialog"
              >
                ✕
              </button>
            </div>
            <div className="delete-confirmation-body">
              <p>
                This will permanently delete <strong>{project.name}</strong> and all associated
                tasks, messages, notes, files, members, and announcements.
              </p>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  Cancel
                </button>
                <button type="button" className="delete-project-button" onClick={onDelete}>
                  Delete Project
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: '📊' },
  { id: 'tasks', label: 'Tasks', icon: '✓' },
  { id: 'members', label: 'Members', icon: '👥' },
  { id: 'discussion', label: 'Chat', icon: '💬' },
  { id: 'notes', label: 'Notes', icon: '📝' },
  { id: 'files', label: 'Files', icon: '📁' },
  { id: 'announcements', label: 'Announcements', icon: '📢' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]

function ProjectWorkspace() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeSection, setActiveSection] = useState('overview')
  const [projectProgress, setProjectProgress] = useState(project?.progress || 0)

  useEffect(() => {
    const controller = new AbortController()
    setIsLoading(true)
    setActiveSection('overview')

    getProject(projectId, controller.signal)
      .then((nextProject) => {
        setProject({
          ...nextProject,
          accent: nextProject.accent || '#7c3aed',
          members: nextProject.members ?? 0,
          type: nextProject.type || 'Project',
        })
        setProjectProgress(nextProject.progress || 0)
        setLoadError('')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setProject(null)
          setLoadError(error.message)
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })

    return () => controller.abort()
  }, [projectId])

  if (isLoading) {
    return (
      <div className="workspace-page">
        <div className="project-not-found">
          <p>Loading project workspace...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="workspace-page">
        <div className="project-not-found">
          <h2>Project not found</h2>
          <p>{loadError || "The project you're looking for doesn't exist."}</p>
          <button className="primary-button" onClick={() => navigate('/')}>
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleProgressUpdate = (newProgress) => {
    setProjectProgress(newProgress)
  }

  const handleProjectUpdate = (updates) => {
    setProject((currentProject) => ({ ...currentProject, ...updates, progress: projectProgress }))
  }

  const handleProjectDelete = () => {
    const relatedStorageKeys = [
      STORAGE_KEYS.tasks,
      STORAGE_KEYS.discussions,
      STORAGE_KEYS.notes,
      STORAGE_KEYS.files,
      STORAGE_KEYS.members,
      STORAGE_KEYS.announcements,
    ]
    relatedStorageKeys.forEach((key) => removeProjectStorage(key, project.id))

    delete tasksState[project.id]
    delete discussionState[project.id]
    delete notesState[project.id]
    delete filesState[project.id]
    delete membersState[project.id]
    delete announcementsState[project.id]
    navigate('/')
  }

  const projectStatus = formatProjectStatus(project.status)

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection key={project.id} project={{ ...project, progress: projectProgress }} />
      case 'discussion':
        return <DiscussionSection key={project.id} projectId={project.id} project={project} />
      case 'tasks':
        return (
          <TasksSection
            key={project.id}
            projectId={project.id}
            project={project}
            onProgressUpdate={handleProgressUpdate}
          />
        )
      case 'notes':
        return <NotesSection key={project.id} projectId={project.id} project={project} />
      case 'files':
        return <FilesSection key={project.id} projectId={project.id} project={project} />
      case 'members':
        return <MembersSection key={project.id} projectId={project.id} project={project} />
      case 'announcements':
        return <AnnouncementsSection key={project.id} projectId={project.id} project={project} />
      case 'settings':
        return (
          <SettingsSection
            key={project.id}
            project={project}
            onUpdate={handleProjectUpdate}
            onDelete={handleProjectDelete}
          />
        )
      default:
        return <OverviewSection key={project.id} project={{ ...project, progress: projectProgress }} />
    }
  }

  return (
    <div className="workspace-page">
      <div className="workspace-header-full">
        <div className="workspace-header-top">
          <button className="back-button" onClick={() => navigate('/')}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="workspace-header-content">
          <div className="header-left">
            <h1>{project.name}</h1>
            <div className="header-badges">
              <p className="workspace-project-description">{project.description}</p>
              <span
                className={`badge badge-status project-status-${projectStatus
                  .toLowerCase()
                  .replaceAll(' ', '-')}`}
              >
                {projectStatus}
              </span>
              <span className="badge badge-deadline">📅 {project.deadline || 'No deadline'}</span>
              <span className="badge badge-members">👥 {project.members ?? 0} members</span>
            </div>
          </div>

          <div className="header-right">
            <div className="progress-card">
              <span className="progress-card-label">Progress</span>
              <div className="progress-card-value" style={{ color: project.accent }}>
                {projectProgress}%
              </div>
              <div className="progress-card-bar">
                <div
                  className="progress-card-fill"
                  style={{
                    width: `${projectProgress}%`,
                    background: project.accent,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="workspace-nav">
        <div className="nav-container">
          {SECTIONS.map((section) => (
            <button
              key={section.id}
              className={`nav-item ${activeSection === section.id ? 'active' : ''}`}
              onClick={() => setActiveSection(section.id)}
            >
              <span className="nav-icon">{section.icon}</span>
              <span className="nav-label">{section.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <div className="workspace-body">
        {renderSection()}
      </div>
    </div>
  )
}

export default ProjectWorkspace
