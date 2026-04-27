import { NavLink } from 'react-router-dom'

function AdminSidebar() {
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId)

    if (section) {
      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-logo">✓</div>

        <div>
          <h2>POLL ARENA</h2>
          <p>Your Voice, Your Choice</p>
        </div>
      </div>

      <nav className="admin-nav">
        <button
          type="button"
          className="admin-link"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          Dashboard
        </button>

        <div className="admin-group">
          <button type="button" className="admin-link active">
            Polls
          </button>

          <div className="admin-submenu">
            <button
              type="button"
              className="admin-sublink"
              onClick={() => scrollToSection('create-poll-section')}
            >
              Create New Poll
            </button>

            <button
              type="button"
              className="admin-sublink"
              onClick={() => scrollToSection('poll-management-section')}
            >
              Poll Management
            </button>
          </div>
        </div>

        <button
          type="button"
          className="admin-link"
          onClick={() => scrollToSection('categories-section')}
        >
          Categories
        </button>

        <button
          type="button"
          className="admin-link"
          onClick={() => scrollToSection('users-section')}
        >
          Users
        </button>

        <button
          type="button"
          className="admin-link"
          onClick={() => scrollToSection('analytics-section')}
        >
          Analytics
        </button>

        <button
          type="button"
          className="admin-link"
          onClick={() => scrollToSection('settings-section')}
        >
          Settings
        </button>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="impact-card">
          <h4>Make an Impact!</h4>
          <p>Every poll creates insight and better decisions.</p>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar