import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

function Navbar() {
  const navigate = useNavigate()
  const { user, isAdmin, signOut } = useAuth()
  const { t } = useLanguage()



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
        <NavLink to="/">{t.home}</NavLink>
        <NavLink to="/how-it-works">
  {t.howItWorks}
</NavLink>
        <NavLink to="/about-us">
  {t.aboutUs}
</NavLink>

       <NavLink
  to="/live-results"
  onClick={(event) => protectLink(event, '/live-results')}
>
  {t.liveResults}
</NavLink>

<NavLink
  to="/categories"
  onClick={(event) => protectLink(event, '/categories')}
>
  {t.categories}
</NavLink>

       <NavLink
  to="/news-center"
  onClick={(event) => protectLink(event, '/news-center')}
>
  {t.newsCenter}
</NavLink>

       <NavLink to="/book-table">
  {t.events}
</NavLink>

        {user && (
  <NavLink to="/settings">
    {t.settings}
  </NavLink>
)}

        {user && isAdmin && (
         <NavLink to="/admin" className="admin-nav-link">
  {t.adminPanel}
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
            {t.login}
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
              {t.logout}
            </button>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar