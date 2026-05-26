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

  const navItems = [
    ['Dashboard', 'dashboard-section', '🏠'],
    ['Create Poll', 'create-poll-section', '➕'],
    ['Poll Management', 'poll-management-section', '📊'],
    ['News Center', 'news-section', '📰'],
    ['Ads & Sponsors', 'ads-section', '📢'],
    ['Daily Snapshot', 'daily-snapshot-section', '📌'],
    ['Categories', 'categories-section', '🏷️'],
    ['Users', 'users-section', '👥'],
    ['Analytics', 'analytics-section', '📈'],
    ['Settings', 'settings-section', '⚙️'],
  ]

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand upgraded-admin-brand">
        <img src="/pollarena1.jpeg" alt="Poll Arena" />

        <div>
          <h2>POLL ARENA</h2>
          <p>Control Center</p>
        </div>
      </div>

      <nav className="admin-nav upgraded-admin-nav">
        {navItems.map(([label, sectionId, icon]) => (
          <button
            key={sectionId}
            type="button"
            className="admin-link upgraded-admin-link"
            onClick={() => scrollToSection(sectionId)}
          >
            <span>{icon}</span>
            {label}
          </button>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <div className="impact-card upgraded-impact-card">
          <span>Live Intelligence</span>
          <h4>Make an Impact</h4>
          <p>Every poll creates insight, strategy, and better decisions.</p>
        </div>
      </div>
    </aside>
  )
}

export default AdminSidebar