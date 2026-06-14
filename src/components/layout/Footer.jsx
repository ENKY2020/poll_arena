import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { subscribeToNewsletter } from '../../services/analyticService'

function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)

  const socialLinks = [
    {
      label: 'Facebook',
      url: 'https://www.facebook.com/share/18fuPxrb8P/',
    },
    {
      label: 'X (Twitter)',
      url: 'https://x.com/i/status/2037181949349924944',
    },
    {
      label: 'TikTok',
      url: 'https://www.tiktok.com/t/ZTknS1mT7/',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/p/DWWgz2Agmar/?igsh=MXJ2cWR5aDYxaWlmcg==',
    },
  ]

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault()
      setDeferredPrompt(event)
    }

    const handleInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)

    if (window.matchMedia?.('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) {
      alert(
        'Install option is not available yet. Open this site in Chrome or Edge, then try again after the app finishes loading.'
      )
      return
    }

    deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  const handleNewsletterSubmit = async (event) => {
    event.preventDefault()

    try {
      setNewsletterLoading(true)
      setNewsletterStatus('')

      const result = await subscribeToNewsletter({
        email,
        source: 'footer',
      })

      setNewsletterStatus(result.message)

      if (result.success) {
        setEmail('')
      }
    } catch (error) {
      console.error('Newsletter signup failed:', error)
      setNewsletterStatus('Subscription failed. Please try again.')
    } finally {
      setNewsletterLoading(false)
    }
  }

  return (
    <footer className="footer full-footer">
      <div className="footer-brand">
        <img
          src="/pollarena1.jpeg"
          alt="Poll Arena logo"
          className="footer-logo-img"
        />

        <h3>Poll Arena International</h3>
        <p>Real-Time Public Opinion</p>
        <strong>Your voice. Your choice. Your impact.</strong>
        <small>© 2026 Poll Arena International. All rights reserved.</small>
      </div>

      <div className="footer-column">
        <h4>Quick Links</h4>
        <Link to="/">Home</Link>
        <Link to="/live-results">Live Results</Link>
        <Link to="/categories">Categories</Link>
        <Link to="/how-it-works">How It Works</Link>
        <Link to="/about-us">About Us</Link>
        <Link to="/book-table" className="footer-book-link">
  🎟 Reserve Event Table →
</Link>
      </div>
      <div className="footer-event-card">
  <h4>Upcoming Events</h4>

  <p>
    Reserve seats and tables for awards, forums,
    conferences and networking events.
  </p>

  <Link
    to="/book-table"
    className="footer-event-btn"
  >
    🎟 Book a Table →
  </Link>
</div>

      <div className="footer-column">
        <h4>Company</h4>
        <Link to="/about-us">About Us</Link>
        <Link to="/about-us#mission">Our Mission</Link>
        <Link to="/about-us#vision">Our Vision</Link>
        <Link to="/about-us#presence">Our Presence</Link>
        <Link to="/about-us#contact">Contact Us</Link>
      </div>

      <div className="footer-column">
        <h4>Connect With Us</h4>

        {socialLinks.map((social) => (
          <a
            key={social.label}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {social.label}
          </a>
        ))}
      </div>

      <div className="footer-app-card">
        <div className="footer-phone-mini">
          <img src="/pollarena1.jpeg" alt="Poll Arena app" />
        </div>

        <h4>Get the App</h4>
        <p>Add Poll Arena to your home screen for fast access.</p>

        <button
          type="button"
          className="btn btn-primary full"
          onClick={handleInstallApp}
          disabled={isInstalled}
        >
          {isInstalled ? 'App Installed' : 'Install App'}
        </button>

        <form className="footer-newsletter" onSubmit={handleNewsletterSubmit}>
          <h4>Get Weekly Insights</h4>
          <p>Receive poll trends, public opinion updates, and platform news.</p>

          <div className="footer-newsletter-row">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button type="submit" disabled={newsletterLoading}>
              {newsletterLoading ? 'Joining...' : 'Subscribe'}
            </button>
          </div>

          {newsletterStatus && (
            <small className="footer-newsletter-status">
              {newsletterStatus}
            </small>
          )}
        </form>
      </div>
    </footer>
  )
}

export default Footer