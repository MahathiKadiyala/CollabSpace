import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createProject, getProjects } from '../utils/api.js'

const ACCENT_COLORS = ['#7c3aed', '#10b981', '#f97316', '#06b6d4', '#ec4899', '#f59e0b']
const DEFAULT_OWNER_ID = 1

const parseDeadline = (deadline) => new Date(`${deadline}T00:00:00`).getTime()

const formatDeadline = (deadline) => {
  if (!deadline) return 'No deadline'

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(`${deadline}T00:00:00`))
}

const formatStatus = (status) =>
  status
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

function ProjectCard({ id, name, type, status, description, deadline, progress, members, accent }) {
  const navigate = useNavigate()
  const resolvedStatus = formatStatus(status || (progress === 100 ? 'completed' : 'planning'))

  const handleClick = () => {
    navigate(`/projects/${id}`)
  }

  return (
    <article className="project-card" onClick={handleClick} role="button" tabIndex="0">
      <div className="project-card-header">
        <span className="project-icon" aria-hidden="true">
          <span></span>
        </span>
        <div className="project-header-info">
          <span className="project-title">{name}</span>
          <span className="project-type">{type || 'Project'}</span>
          <span className={`project-status project-status-${resolvedStatus.toLowerCase().replaceAll(' ', '-')}`}>
            {resolvedStatus}
          </span>
        </div>
      </div>

      <div className="project-description">{description}</div>

      <div className="project-meta">
        <span className="meta-item">
          <span className="meta-label">Deadline:</span>
          <span className="meta-value">{formatDeadline(deadline)}</span>
        </span>
        <span className="meta-item">
          <span className="meta-label">Members:</span>
          <span className="meta-value">{members ?? '—'}</span>
        </span>
      </div>

      <div className="project-progress-wrap">
        <div className="progress-row">
          <div className="progress-label">Progress</div>
          <div className="progress-percent">{progress}%</div>
        </div>
        <div className="progress-bar">
          <div className="progress-bar-fill" style={{ width: `${progress}%`, background: accent }}></div>
        </div>
      </div>
    </article>
  )
}

function CreateProjectModal({ isOpen, onClose, onCreateProject }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    deadline: '',
  })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
    setSubmitError('')
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.name.trim()) {
      newErrors.name = 'Project Name is required'
    }
    if (!formData.deadline.trim()) {
      newErrors.deadline = 'Deadline is required'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validateForm()

    if (Object.keys(newErrors).length === 0) {
      try {
        await onCreateProject(formData)
        setFormData({ name: '', description: '', status: 'planning', deadline: '' })
      } catch (error) {
        setSubmitError(error.message)
      }
    } else {
      setErrors(newErrors)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create New Project</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter project name"
              className={errors.name ? 'form-input error' : 'form-input'}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project"
              className="form-textarea"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Project Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-select"
            >
              <option value="planning">Planning</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="deadline">Deadline *</label>
            <input
              type="date"
              id="deadline"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              className={errors.deadline ? 'form-input error' : 'form-input'}
            />
            {errors.deadline && <span className="error-message">{errors.deadline}</span>}
          </div>

          {submitError && <p className="error-message">{submitError}</p>}

          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary">
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Dashboard() {
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [apiError, setApiError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [sortOption, setSortOption] = useState('default')

  const loadProjects = async (signal) => {
    setIsLoading(true)
    try {
      setProjects(await getProjects(signal))
      setApiError('')
    } catch (error) {
      if (error.name !== 'AbortError') {
        setApiError(error.message)
      }
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }

  useEffect(() => {
    const controller = new AbortController()
    getProjects(controller.signal)
      .then((loadedProjects) => {
        setProjects(loadedProjects)
        setApiError('')
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setApiError(error.message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false)
      })
    return () => controller.abort()
  }, [])

  const handleCreateProject = async (newProjectData) => {
    await createProject({
      ...newProjectData,
      owner_id: DEFAULT_OWNER_ID,
      progress: 0,
    })
    await loadProjects()
    setIsModalOpen(false)
  }

  const visibleProjects = projects
    .filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesType = typeFilter === 'All' || !project.type || project.type === typeFilter
      const matchesStatus = statusFilter === 'All' || formatStatus(project.status) === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
    .sort((firstProject, secondProject) => {
      if (sortOption === 'deadline-asc') {
        return parseDeadline(firstProject.deadline) - parseDeadline(secondProject.deadline)
      }
      if (sortOption === 'deadline-desc') {
        return parseDeadline(secondProject.deadline) - parseDeadline(firstProject.deadline)
      }
      if (sortOption === 'progress-asc') {
        return firstProject.progress - secondProject.progress
      }
      if (sortOption === 'progress-desc') {
        return secondProject.progress - firstProject.progress
      }
      return 0
    })

  return (
    <div className="dashboard-page">
      <section className="welcome-block">
        <h1>Welcome back, Mahathi 👋</h1>
      </section>

      <section className="section-block">
        <div className="section-title-row">
          <h2>Your Projects</h2>
          <button
            className="primary-button new-project-button"
            onClick={() => setIsModalOpen(true)}
          >
            + New Project
          </button>
        </div>

        <div className="project-controls" aria-label="Project search and filters">
          <label className="project-search">
            <span className="sr-only">Search projects</span>
            <input
              type="search"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </label>

          <label className="project-filter">
            <span className="sr-only">Filter by project type</span>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All types</option>
              <option value="Individual">Individual</option>
              <option value="Group">Group</option>
            </select>
          </label>

          <label className="project-filter">
            <span className="sr-only">Filter by project status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="All">All statuses</option>
              <option value="Planning">Planning</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </label>

          <label className="project-filter project-sort">
            <span className="sr-only">Sort projects</span>
            <select value={sortOption} onChange={(e) => setSortOption(e.target.value)}>
              <option value="default">Sort projects</option>
              <option value="deadline-asc">Deadline: Soonest</option>
              <option value="deadline-desc">Deadline: Latest</option>
              <option value="progress-desc">Progress: Highest</option>
              <option value="progress-asc">Progress: Lowest</option>
            </select>
          </label>
        </div>

        {isLoading && <div className="project-filter-empty"><p>Loading projects...</p></div>}

        {!isLoading && apiError && (
          <div className="project-filter-empty"><p>Could not load projects: {apiError}</p></div>
        )}

        {!isLoading && !apiError && visibleProjects.length > 0 && (
          <div className="project-grid">
            {visibleProjects.map((project, index) => (
              <ProjectCard key={project.id} {...project} accent={ACCENT_COLORS[index % ACCENT_COLORS.length]} />
            ))}
          </div>
        )}

        {!isLoading && !apiError && visibleProjects.length === 0 && (
          <div className="project-filter-empty">
            <p>{projects.length === 0 ? 'No projects yet.' : 'No projects match your current search and filters.'}</p>
          </div>
        )}
      </section>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateProject={handleCreateProject}
      />
    </div>
  )
}

export default Dashboard
