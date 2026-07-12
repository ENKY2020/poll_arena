import { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useLanguage } from '../context/LanguageContext'

const languages = [
  { code: 'en', name: 'English 🇬🇧' },
  { code: 'sw', name: 'Kiswahili 🇰🇪' },
  { code: 'fr', name: 'Français 🇫🇷' },
  { code: 'ar', name: 'العربية 🇸🇦' },
  { code: 'es', name: 'Español 🇪🇸' },
  { code: 'pt', name: 'Português 🇵🇹' },
]

const countries = ['Kenya', 'Uganda', 'Tanzania', 'Rwanda', 'Nigeria', 'South Africa', 'United States', 'United Arab Emirates', 'Other']

const kenyaCounties = [
  'Nairobi',
  'Mombasa',
  'Kisumu',
  'Nakuru',
  'Kiambu',
  'Machakos',
  'Kajiado',
  'Murang’a',
  'Nyeri',
  'Uasin Gishu',
  'Meru',
  'Kisii',
  'Kakamega',
  'Bungoma',
  'Other',
]

function Settings() {
  const [user, setUser] = useState(null)
const [profile, setProfile] = useState({
  full_name: '',
  country: 'Kenya',
  county: '',
  preferred_language: 'en',
  newsletter_opt_in: false,
})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const { changeLanguage } = useLanguage()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) throw userError

      if (!user) {
        setUser(null)
        return
      }

      setUser(user)

      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()

      if (profileError) throw profileError

      if (data) {
        setProfile({
          full_name: data.full_name || user.user_metadata?.full_name || '',
          country: data.country || 'Kenya',
          preferred_language: data.preferred_language || 'en',
          county: data.county || '',
          newsletter_opt_in: Boolean(data.newsletter_opt_in),
        })
      } else {
        setProfile({
          full_name: user.user_metadata?.full_name || '',
          preferred_language: 'en',
          country: 'Kenya',
          county: '',
          newsletter_opt_in: false,
        })
      }
    } catch (err) {
      console.error('Profile load failed:', err)
      setError(err.message || 'Failed to load settings.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target

    setProfile((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (!user) {
      setError('Please login first.')
      return
    }

    try {
      setSaving(true)
      setMessage('')
      setError('')

      const payload = {
        user_id: user.id,
        email: user.email,
        full_name: profile.full_name.trim(),
        preferred_language: profile.preferred_language,
        country: profile.country,
        county: profile.county,
        newsletter_opt_in: profile.newsletter_opt_in,
        updated_at: new Date().toISOString(),
      }

      const { error: upsertError } = await supabase
        .from('user_profiles')
        .upsert(payload, { onConflict: 'user_id' })

      if (upsertError) throw upsertError

      if (profile.newsletter_opt_in && user.email) {
  await supabase.from('newsletter_subscribers').upsert(
    {
      email: user.email.toLowerCase(),
      source: 'settings',
      status: 'active',
    },
    { onConflict: 'email' }
  )
}

changeLanguage(profile.preferred_language)

setMessage('Profile preferences saved successfully.')

    } catch (err) {
      console.error('Profile save failed:', err)
      setError(err.message || 'Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <section className="poll-section">
        <div className="poll-card">
          <h3>Settings</h3>
          <p className="hero-text">Loading your preferences...</p>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section className="poll-section">
        <div className="poll-card">
          <h3>Settings</h3>
          <p className="hero-text">Please login to manage your profile preferences.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="poll-section">
      <div className="section-header">
        <div>
          <h2>Settings</h2>
          <span>Manage account preferences and location intelligence</span>
        </div>
      </div>

      <form className="poll-card settings-profile-card" onSubmit={handleSave}>
        <h3>Profile Intelligence</h3>
        <p className="hero-text">
          Help Poll Arena understand where public opinion is growing. This is optional and can be updated anytime.
        </p>

        <div className="auth-form">
          <div className="form-group">
            <label htmlFor="full_name">Display Name</label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              value={profile.full_name}
              onChange={handleChange}
              placeholder="Your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country</label>
            <select
              id="country"
              name="country"
              value={profile.country}
              onChange={handleChange}
            >
              {countries.map((country) => (
                <option key={country} value={country}>
                  {country}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="county">County / Region</label>

            {profile.country === 'Kenya' ? (
              <select
                id="county"
                name="county"
                value={profile.county}
                onChange={handleChange}
              >
                <option value="">Select county</option>
                {kenyaCounties.map((county) => (
                  <option key={county} value={county}>
                    {county}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="county"
                name="county"
                type="text"
                value={profile.county}
                onChange={handleChange}
                placeholder="Enter your region"
              />
            )}
          </div>
<div className="form-group">
  <label htmlFor="preferred_language">
    🌍 Application Language
  </label>

  <select
    id="preferred_language"
    name="preferred_language"
    value={profile.preferred_language}
    onChange={handleChange}
  >
    {languages.map((language) => (
      <option
        key={language.code}
        value={language.code}
      >
        {language.name}
      </option>
    ))}
  </select>

  <small className="settings-helper">
    Choose the language used throughout Poll Arena.
  </small>
</div>
          <label className="settings-check-row">
            <input
              type="checkbox"
              name="newsletter_opt_in"
              checked={profile.newsletter_opt_in}
              onChange={handleChange}
            />
            <span>Send me weekly Poll Arena insights and updates</span>
          </label>

          <button type="submit" className="btn btn-primary full" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}
      </form>
    </section>
  )
}

export default Settings