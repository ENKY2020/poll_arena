import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function Navbar() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const navigate = useNavigate()

  console.log('NAVBAR USER:', user)
  console.log('NAVBAR EMAIL:', user?.email)
  console.log('NAVBAR IS ADMIN:', isAdmin)
  console.log('NAVBAR LOADING:', loading)

  const handleLogout = async () => {
    const result = await signOut()

    if (result?.success) {
      navigate('/login')
    }
  }

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'User'

  return (
    <header className="navbar">
      <div className="logo-wrap">
        <div className="logo-mark">PA</div>

        <div className="logo-text">
          <h2>Poll Arena</h2>
          <span>Real-Time Public Opinion</span>
        </div>
      </div>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/live-results">Live Results</NavLink>
        <NavLink to="/categories">Categories</NavLink>
        <NavLink to="/how-it-works">How It Works</NavLink>

        {isAdmin && (
          <NavLink to="/admin" className="admin-nav-link">
            Admin Panel
          </NavLink>
        )}
      </nav>

      <div className="nav-actions">
        {loading ? (
          <span className="nav-user-text">Checking session...</span>
        ) : user ? (
          <>
            <span className="nav-user-text">Hi, {displayName}</span>

            {isAdmin && (
              <NavLink to="/admin" className="btn btn-secondary">
                Dashboard
              </NavLink>
            )}

            <button className="btn btn-ghost" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login" className="btn btn-ghost">
              Login
            </NavLink>

            <NavLink to="/signup" className="btn btn-primary">
              Sign Up
            </NavLink>
          </>
        )}
      </div>
    </header>
  )
}

export default Navbar