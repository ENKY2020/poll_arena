import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AdminSidebar from '../components/admin/AdminSidebar'
import CreatePollForm from '../components/admin/CreatePollForm'
import PollManager from '../components/admin/PollManager'
import NewsManager from '../components/admin/NewsManager'
import AdManager from '../components/admin/AdManager'
import DailySnapshotManager from '../components/admin/DailySnapshotManager'
import AnalyticsPanel from '../components/admin/AnalyticsPanel'
import '../styles/admin.css'

function Admin() {
  const { user, loading, isAdmin } = useAuth()

  if (loading) {
    return (
      <section className="poll-section">
        <div className="poll-card">
          <h3>Checking admin access...</h3>
          <p className="hero-text">Please wait while we verify your permissions.</p>
        </div>
      </section>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  if (!isAdmin) {
    return (
      <section className="poll-section">
        <div className="poll-card">
          <h3>Access Denied</h3>
          <p className="hero-text">You do not have permission to access this page.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="admin-page">
      <AdminSidebar />

      <main className="admin-main">
        <div className="admin-hero-card" id="dashboard-section">
          <div>
            <span className="admin-kicker">Control Center</span>
            <h2>Admin Dashboard</h2>
            <p>
              Create, publish, monitor and manage polls, news, sponsored ads,
              daily snapshots and platform intelligence.
            </p>
          </div>

          <div className="admin-hero-badge">
            <strong>Live</strong>
            <span>Admin Mode</span>
          </div>
        </div>

        <div className="admin-content">
          <div id="create-poll-section">
            <CreatePollForm />
          </div>

          <div id="poll-management-section">
            <PollManager />
          </div>

          <div id="news-section">
            <NewsManager />
          </div>

          <div id="ads-section">
            <AdManager />
          </div>

          <div id="daily-snapshot-section">
            <DailySnapshotManager />
          </div>

          <section id="categories-section" className="poll-card admin-info-card">
            <div className="admin-info-header">
              <div>
                <span className="mini-pill">Categories</span>
                <h3>Poll Category System</h3>
              </div>
            </div>

            <p className="hero-text">
              Categories are currently assigned when creating polls. They help group
              results, filter live results, and power future intelligence reports.
            </p>

            <div className="admin-mini-grid">
              <div>
                <strong>sports</strong>
                <span>Sports polling and fan sentiment</span>
              </div>

              <div>
                <strong>education-innovation</strong>
                <span>Education, certificates and institutional opinions</span>
              </div>

              <div>
                <strong>politics</strong>
                <span>Public opinion and political sentiment</span>
              </div>
            </div>

            <p className="admin-note">
              Full category creation/editing can come later when we add dynamic category management.
            </p>
          </section>

          <section id="users-section" className="poll-card admin-info-card">
            <div className="admin-info-header">
              <div>
                <span className="mini-pill">Users</span>
                <h3>User Intelligence</h3>
              </div>
            </div>

            <p className="hero-text">
              User location and newsletter preferences are now collected through Settings
              after Google login.
            </p>

            <div className="admin-mini-grid">
              <div>
                <strong>Profiles</strong>
                <span>Country, county/region and display name</span>
              </div>

              <div>
                <strong>Newsletter</strong>
                <span>Users who opted into weekly insights</span>
              </div>

              <div>
                <strong>Growth Data</strong>
                <span>Sources, shares and platform behavior</span>
              </div>
            </div>
          </section>

          <div id="analytics-section">
            <AnalyticsPanel />
          </div>

          <section id="settings-section" className="poll-card admin-info-card">
            <div className="admin-info-header">
              <div>
                <span className="mini-pill">Settings</span>
                <h3>Platform Settings</h3>
              </div>
            </div>

            <p className="hero-text">
              Current settings are intentionally lightweight while Poll Arena grows.
              The important admin controls are already available through poll creation,
              poll management, news publishing, ads, snapshots and analytics.
            </p>

            <div className="admin-mini-grid">
              <div>
                <strong>Poll Rules</strong>
                <span>One vote per logged-in user</span>
              </div>

              <div>
                <strong>Analytics</strong>
                <span>UTM, share, traffic and newsletter tracking</span>
              </div>

              <div>
                <strong>Profile Data</strong>
                <span>Optional country and county/region collection</span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </section>
  )
}

export default Admin