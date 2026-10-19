export const STORAGE_KEYS = {
  projects: 'collabspace-projects',
  tasks: 'collabspace-tasks',
  discussions: 'collabspace-discussions',
  notes: 'collabspace-notes',
  files: 'collabspace-files',
  members: 'collabspace-members',
  announcements: 'collabspace-announcements',
}

export function readStorage(key, fallback) {
  try {
    const storedValue = window.localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : fallback
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage may be unavailable or full; keep the in-memory UI usable.
  }
}

export function readProjectStorage(key, projectId, fallback) {
  const storedProjects = readStorage(key, {})
  const projectKey = String(projectId)
  const storedValue = storedProjects[projectKey]

  if (storedValue) {
    const isolatedValue = isolateProjectRecords(storedValue, projectId)
    if (isolatedValue !== storedValue) {
      writeStorage(key, { ...storedProjects, [projectKey]: isolatedValue })
    }
    return isolatedValue
  }

  const isolatedFallback = isolateProjectRecords(fallback, projectId)
  const nextProjects = { ...storedProjects, [projectKey]: isolatedFallback }
  writeStorage(key, nextProjects)
  return isolatedFallback
}

export function writeProjectStorage(key, projectId, value) {
  const storedProjects = readStorage(key, {})
  const projectKey = String(projectId)
  writeStorage(key, {
    ...storedProjects,
    [projectKey]: isolateProjectRecords(value, projectId),
  })
}

export function removeProjectStorage(key, projectId) {
  const storedProjects = readStorage(key, {})
  const projectKey = String(projectId)

  if (!Object.prototype.hasOwnProperty.call(storedProjects, projectKey)) return

  const remainingProjects = { ...storedProjects }
  delete remainingProjects[projectKey]
  writeStorage(key, remainingProjects)
}

function isolateProjectRecords(value, projectId) {
  if (!Array.isArray(value)) return value

  const projectKey = String(projectId)
  const isolatedValue = value.filter((record) => String(record.projectId) === projectKey)
  return isolatedValue.length === value.length ? value : isolatedValue
}
