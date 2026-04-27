import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient'

const AuthContext = createContext(null)

const ADMIN_EMAILS = [
  'mugendievans10@gmail.com',
  'pollarenainternational@gmail.com',
]

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadSession = async () => {
      setLoading(true)

      const { data, error } = await supabase.auth.getSession()

      if (!isMounted) return

      if (error) {
        console.error('AUTH SESSION ERROR:', error.message)
      }

      const currentSession = data?.session ?? null
      const currentUser = currentSession?.user ?? null

      setSession(currentSession)
      setUser(currentUser)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      const currentUser = currentSession?.user ?? null

      setSession(currentSession ?? null)
      setUser(currentUser)
      setLoading(false)

      console.log('AUTH EVENT:', event)
      console.log('AUTH EMAIL:', currentUser?.email)
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  const normalizedEmail = user?.email?.toLowerCase() || ''

  const isAdmin = useMemo(() => {
    return ADMIN_EMAILS.map((email) => email.toLowerCase()).includes(
      normalizedEmail
    )
  }, [normalizedEmail])

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('SIGN OUT ERROR:', error.message)
      return { success: false, error }
    }

    setSession(null)
    setUser(null)

    return { success: true }
  }

  const value = {
    user,
    session,
    loading,
    isAdmin,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}

export { AuthProvider, useAuth }