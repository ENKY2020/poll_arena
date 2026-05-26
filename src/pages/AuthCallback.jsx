import { useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import AppLoader from '../components/common/AppLoader'

function AuthCallback() {
  useEffect(() => {
    const finishLogin = async () => {
      try {
        await supabase.auth.getSession()

        const returnTo = localStorage.getItem('pollarena_return_to') || '/'
        localStorage.removeItem('pollarena_return_to')

        window.location.replace(returnTo)
      } catch (error) {
        console.error('Auth callback failed:', error)
        window.location.replace('/login')
      }
    }

    finishLogin()
  }, [])

  return <AppLoader message="Signing you in..." />
}

export default AuthCallback