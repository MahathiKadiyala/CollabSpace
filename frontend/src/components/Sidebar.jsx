function Sidebar({ isOpen, onClose }) {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="brand">
        <span className="brand-icon">C</span>
        <span className="brand-text">CollabSpace</span>
      </div>

      <nav className="nav-list">
        <a href="#" className="nav-link active" onClick={onClose}>
          <span className="nav-icon">🏠</span>
          <span>Dashboard</span>
        </a>
        <a href="#" className="nav-link" onClick={onClose}>
          <span className="nav-icon">📁</span>
          <span>Projects</span>
        </a>
      </nav>

      <div className="user-pill">
        <span className="avatar">👤</span>
        <span>Mahathi</span>
      </div>
    </aside>
  )
}

export default Sidebar
