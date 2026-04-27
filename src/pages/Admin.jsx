import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminSidebar from '../components/admin/AdminSidebar'
import CreatePollForm from '../components/admin/CreatePollForm'
import PollManager from '../components/admin/PollManager'
import AnalyticsPanel from '../components/admin/AnalyticsPanel'
import '../styles/admin.css'

function Admin() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <section className="poll-section">
        <div className="section-header">
          <h2>Admin Panel</h2>
          <span>Checking access...</span>
        </div>

        <div className="poll-card">
          <h3>Loading...</h3>
          <p className="hero-text">Please wait while we verify your admin access.</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!isAdmin) {
    return (
      <section className="poll-section">
        <div className="section-header">
          <h2>Access Denied</h2>
          <span>Admins only</span>
        </div>

        <div className="poll-card">
          <h3>Unauthorized</h3>
          <p className="hero-text">
            You do not have permission to access this page.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <AdminSidebar />

      <div className="admin-main">
        <div className="section-header">
          <h2>Admin Dashboard</h2>
          <span>Create, publish, monitor and manage polls</span>
        </div>

        <div className="admin-content">
          <div id="create-poll-section">
            <CreatePollForm />
          </div>

          <div id="poll-management-section">
            <PollManager />
          </div>

          <section id="categories-section" className="poll-card">
            <h3>Categories</h3>
            <p className="hero-text">
              Categories are currently used when creating polls. Full category management comes next.
            </p>
          </section>

          <section id="users-section" className="poll-card">
            <h3>Users</h3>
            <p className="hero-text">
              User management will show voters, admins and activity records.
            </p>
          </section>

<div id="analytics-section">
  <AnalyticsPanel />
</div>

          <section id="settings-section" className="poll-card">
            <h3>Settings</h3>
            <p className="hero-text">
              Platform settings, poll rules and admin preferences will live here.
            </p>
          </section>
        </div>
      </div>
    </section>
  )
}

export default Admin