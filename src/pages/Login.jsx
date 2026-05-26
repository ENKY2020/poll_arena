import { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import '../styles/login.css'

function Login() {
  const location = useLocation()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const returnTo = useMemo(() => {
    const params = new URLSearchParams(location.search)
    const rawReturnTo = params.get('returnTo')

    if (!rawReturnTo) return '/'

    try {
      const decoded = decodeURIComponent(rawReturnTo)

      if (!decoded.startsWith('/')) return '/'

      return decoded
    } catch {
      return '/'
    }
  }, [location.search])

  const getRedirectUrl = () => {
    if (window.location.hostname === 'localhost') {
      return 'http://localhost:5174/auth/callback'
    }

    return `${window.location.origin}/auth/callback`
  }

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      setMessage('')

      localStorage.setItem('pollarena_return_to', returnTo)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl(),
        },
      })

      if (error) throw error
    } catch (err) {
      setError(err.message || 'Google login failed.')
      setLoading(false)
    }
  }

  const handleEmailLogin = async (event) => {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      setMessage('Login successful. Redirecting...')
      setEmail('')
      setPassword('')

      setTimeout(() => {
        window.location.href = returnTo
      }, 700)
    } catch (err) {
      setError(err.message || 'Login failed.')
      setLoading(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-shell">
        <div className="login-brand-panel">
          <div className="login-brand-pill">
            <img src="/pollarena1.jpeg" alt="Poll Arena" />
            <span>Poll Arena</span>
          </div>

          <h1>Public opinion, live intelligence.</h1>

          <p>
            Access real-time polls, live results, public sentiment, and strategic
            insights from one modern platform.
          </p>

          <div className="login-feature-grid">
            <span>Live Results</span>
            <span>Market Intelligence</span>
            <span>Public Polling</span>
          </div>

          <div className="login-quote-card">
            <strong>“Your voice. Your choice. Your impact.”</strong>
            <small>Poll Arena International</small>
          </div>
        </div>

        <div className="login-card">
          <div className="login-logo-wrap">
            <img src="/pollarena1.jpeg" alt="Poll Arena logo" />
          </div>

          <h2>Welcome Back</h2>
          <p className="hero-text">
            Login to vote, share polls, and continue your Poll Arena activity.
          </p>

          {returnTo !== '/' && (
            <div className="login-return-box">
              You’ll return to where you left off after login.
            </div>
          )}

          <button
            type="button"
            className="google-login-btn"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <span>G</span>
            {loading ? 'Please wait...' : 'Continue with Google'}
          </button>

          <div className="auth-divider">
            <span>or login with email</span>
          </div>

          <form className="auth-form" onSubmit={handleEmailLogin}>
            <div className="form-group">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <button className="btn btn-primary full" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="login-help-row">
            <span>New here?</span>
            <Link to="/signup">Create your profile</Link>
          </div>

          {message && <p className="auth-success">{message}</p>}
          {error && <p className="auth-error">{error}</p>}
        </div>
      </div>
    </section>
  )
}

export default Login