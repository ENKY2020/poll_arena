import { useState } from 'react'
import { supabase } from '../services/supabaseClient'

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:5173/auth/callback',
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')
    setMessage('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setMessage('Login successful. Redirecting...')
    setEmail('')
    setPassword('')

    setTimeout(() => {
      window.location.href = '/'
    }, 800)

    setLoading(false)
  }

  return (
    <section className="poll-section">
      <div className="section-header">
        <h2>Login</h2>
        <span>Access your Poll Arena account</span>
      </div>

      <div className="auth-card">
        <h3>Welcome Back</h3>
        <p className="hero-text">Sign in to continue to Poll Arena.</p>

        <button
          type="button"
          className="btn btn-secondary full google-btn"
          onClick={handleGoogleLogin}
          disabled={loading}
        >
          {loading ? 'Please wait...' : 'Continue with Google'}
        </button>

        <div className="auth-divider">
          <span>or sign in with email</span>
        </div>

        <form className="auth-form" onSubmit={handleEmailLogin}>
          <div className="form-group">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button
            className="btn btn-primary full"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
      </div>
    </section>
  )
}

export default Login