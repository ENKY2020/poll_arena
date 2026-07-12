import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { subscribeToNewsletter } from '../../services/analyticService'
import { useLanguage } from '../../context/LanguageContext'


function Footer() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState('')
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const { t } = useLanguage()   

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
         <p>{t.tagline}</p>
        <strong>{t.footerMotto}</strong>
      <small>{t.copyright}</small>
      </div>

      <div className="footer-column">
        <h4>{t.quickLinks}</h4>
        <Link to="/">{t.home}</Link>
        <Link to="/live-results">{t.liveResults}</Link>
        <Link to="/categories">{t.categories}</Link>
        <Link to="/how-it-works">{t.howItWorks}</Link>
       <Link to="/about-us">{t.aboutUs}</Link>
        <Link to="/book-table">{t.events}</Link>
      </div>

      <div className="footer-column">
       <h4>{t.company}</h4>
        <Link to="/about-us">{t.aboutUs}</Link>
        <Link to="/about-us#mission">{t.ourMission}</Link>
        <Link to="/about-us#vision">{t.ourVision}</Link>
        <Link to="/about-us#presence">{t.ourPresence}</Link>
        <Link to="/about-us#contact">{t.contactUs}</Link>
      </div>
<div className="footer-event-card">
  <h4>{t.upcomingEvents}</h4>

  <p>
    {t.reserveSeatsDescription}
  </p>

  <Link
    to="/book-table"
    className="footer-event-btn"
  >
   🎟 {t.reserveEventTable} →
  </Link>
</div>
      <div className="footer-column">
       <h4>{t.connectWithUs}</h4>

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

       <h4>{t.getApp}</h4>
        <p>{t.getAppDescription}</p>

        <button
          type="button"
          className="btn btn-primary full"
          onClick={handleInstallApp}
          disabled={isInstalled}
        >
         {isInstalled ? t.appInstalled : t.installApp}
        </button>

        <form className="footer-newsletter" onSubmit={handleNewsletterSubmit}>
          <h4>{t.weeklyInsights}</h4>
          <p>{t.weeklyInsightsDescription}</p>

          <div className="footer-newsletter-row">
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <button type="submit" disabled={newsletterLoading}>
              {newsletterLoading ? t.joining : t.subscribe}
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