import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'

function AuthCallback() {
  const navigate = useNavigate()

  useEffect(() => {
    const finishLogin = async () => {
      const { error } = await supabase.auth.exchangeCodeForSession(
        window.location.href
      )

      if (error) {
        console.error('AUTH CALLBACK ERROR:', error.message)
        navigate('/login')
        return
      }

      navigate('/')
    }

    finishLogin()
  }, [navigate])

  return (
    <section className="poll-section">
      <div className="poll-card">
        <h3>Signing you in...</h3>
        <p className="hero-text">Please wait while Poll Arena completes login.</p>
      </div>
    </section>
  )
}

export default AuthCallback