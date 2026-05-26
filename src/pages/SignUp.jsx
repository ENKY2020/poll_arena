import { Link } from 'react-router-dom'
import '../styles/login.css'

function Signup() {
  return (
    <section className="login-page">
      <div className="login-shell signup-shell">
        <div className="login-brand-panel">
          <div className="login-brand-pill">
            <img src="/pollarena1.jpeg" alt="Poll Arena" />
            <span>Poll Arena</span>
          </div>

          <h1>Create your Poll Arena profile.</h1>

          <p>
            Join the arena through Google, then complete your profile preferences
            inside Settings.
          </p>

          <div className="login-feature-grid">
            <span>Fast Access</span>
            <span>Secure Login</span>
            <span>Live Polls</span>
          </div>

          <div className="login-quote-card">
            <strong>“Data should drive action.”</strong>
            <small>Poll Arena International</small>
          </div>
        </div>

        <div className="login-card">
          <div className="login-logo-wrap">
            <img src="/pollarena1.jpeg" alt="Poll Arena logo" />
          </div>

          <h2>Create Profile</h2>
          <p className="hero-text">
            Poll Arena uses Google sign-in for quick and secure access.
          </p>

          <Link className="google-login-btn signup-google-link" to="/login">
            <span>G</span>
            Continue with Google
          </Link>

          <div className="auth-divider">
            <span>after login</span>
          </div>

          <div className="signup-steps">
            <div>
              <strong>1</strong>
              <span>Login with Google</span>
            </div>

            <div>
              <strong>2</strong>
              <span>Open Settings</span>
            </div>

            <div>
              <strong>3</strong>
              <span>Add country, county, or region</span>
            </div>
          </div>

          <div className="login-help-row">
            <span>Already have access?</span>
            <Link to="/login">Login</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Signup