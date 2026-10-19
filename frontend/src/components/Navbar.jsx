import { useEffect, useState } from 'react'
import { getHealth } from '../utils/api.js'

function Navbar({ onMenuClick, isSidebarOpen }) {
  const [backendStatus, setBackendStatus] = useState('loading')

  useEffect(() => {
    const controller = new AbortController()

    getHealth(controller.signal)
      .then(() => setBackendStatus('connected'))
      .catch((error) => {
        if (error.name !== 'AbortError') {
          setBackendStatus('offline')
        }
      })

    return () => controller.abort()
  }, [])

  const statusLabels = {
    loading: 'Checking backend',
    connected: 'Backend connected',
    offline: 'Backend unavailable',
  }

  return (
    <header className="topbar">
      <button className="hamburger-menu" onClick={onMenuClick} title="Toggle sidebar">
        <span className={`hamburger-line ${isSidebarOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isSidebarOpen ? 'open' : ''}`}></span>
        <span className={`hamburger-line ${isSidebarOpen ? 'open' : ''}`}></span>
      </button>
      <div className="topbar-title">
        <span className="page-title">CollabSpace</span>
      </div>
      <div className="topbar-actions">
        <div
          className={`backend-status backend-status-${backendStatus}`}
          aria-live="polite"
          title={statusLabels[backendStatus]}
        >
          <span className="backend-status-dot" aria-hidden="true"></span>
          <span>{statusLabels[backendStatus]}</span>
        </div>
        <div className="topbar-user">
        <span className="user-name">👤 Mahathi</span>
        </div>
      </div>
    </header>
  )
}

export default Navbar
