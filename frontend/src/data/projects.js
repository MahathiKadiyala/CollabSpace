export const initialProjects = [
  {
    id: 1,
    name: 'AI Attendance System',
    type: 'Group',
    status: 'In Progress',
    description: 'An AI-powered attendance tracking system for teams and organizations',
    deadline: '30 September 2026',
    progress: 65,
    members: 4,
    accent: '#7c3aed',
  },
  {
    id: 2,
    name: 'Personal ML Learning',
    type: 'Individual',
    status: 'In Progress',
    description: 'A personal learning path for building practical machine learning skills',
    deadline: '15 October 2026',
    progress: 40,
    members: 1,
    accent: '#10b981',
  },
]

export function getProjectStatus(project) {
  if (project.status) return project.status
  if (project.progress === 100) return 'Completed'
  if (project.progress === 0) return 'Planning'
  return 'In Progress'
}
