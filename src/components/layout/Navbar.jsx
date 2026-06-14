import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const navigate = useNavigate()
  const { user, isAdmin, signOut } = useAuth()

  const goToLogin = (path = '/') => {
    navigate(`/login?returnTo=${encodeURIComponent(path)}`)
  }

  const protectLink = (event, path) => {
    if (user) return
    event.preventDefault()
    goToLogin(path)
  }

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="navbar compact-navbar">
      <Link to="/" className="brand navbar-brand">
        <img
          src="/pollarena1.jpeg"
          alt="Poll Arena"
          className="navbar-logo"
        />

        <div className="navbar-brand-text">
          <strong>Poll Arena International</strong>
          <span>Real-Time Public Opinion</span>
        </div>
      </Link>

      <nav className="nav-links navbar-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/how-it-works">How It Works</NavLink>
        <NavLink to="/about-us">About Us</NavLink>

        <NavLink
          to="/live-results"
          onClick={(event) => protectLink(event, '/live-results')}
        >
          Live Results
        </NavLink>

        <NavLink
          to="/categories"
          onClick={(event) => protectLink(event, '/categories')}
        >
          Categories
        </NavLink>

        <NavLink
          to="/news-center"
          onClick={(event) => protectLink(event, '/news-center')}
        >
          News Center
        </NavLink>
        <NavLink to="/book-table">
  Events
</NavLink>

        {user && <NavLink to="/settings">Settings</NavLink>}

        {user && isAdmin && (
          <NavLink to="/admin" className="admin-nav-link">
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="nav-actions navbar-actions">
        {!user ? (
          <button
            type="button"
            className="btn btn-primary nav-login-btn"
            onClick={() => goToLogin(window.location.pathname + window.location.search)}
          >
            Login
          </button>
        ) : (
          <>
            <span className="nav-user">
              {user.user_metadata?.full_name || user.email}
            </span>

            <button
              type="button"
              className="btn btn-secondary nav-login-btn"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar