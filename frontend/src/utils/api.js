const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, options)
  const body = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(body?.detail || `Request failed with status ${response.status}`)
  }

  return body
}

export async function getHealth(signal) {
  return request('/api/health', { signal })
}

export async function getProjects(signal) {
  return request('/api/projects', { signal })
}

export async function getProject(projectId, signal) {
  return request(`/api/projects/${projectId}`, { signal })
}

export async function createProject(project, signal) {
  return request('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(project),
    signal,
  })
}

export async function getProjectTasks(projectId, signal) {
  return request(`/api/projects/${projectId}/tasks`, { signal })
}

export async function createTask(task, signal) {
  return request('/api/tasks', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(task),
    signal,
  })
}

export async function updateTask(taskId, updates, signal) {
  return request(`/api/tasks/${taskId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
    signal,
  })
}

export async function deleteTask(taskId, signal) {
  return request(`/api/tasks/${taskId}`, { method: 'DELETE', signal })
}
