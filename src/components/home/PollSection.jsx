import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PollCard from './PollCard'
import { getActivePolls } from '../../services/pollService'
import {
  getLatestNewsArticles,
  getSponsorAds,
  getTodaySnapshot,
} from '../../services/contentServices'
import '../../styles/pollSection.css'
import '../../styles/ads.css'

const fallbackMessages = {
  Sunday: {
    title: 'Today is Sunday',
    subtitle: 'Reset, reflect, and stay informed.',
    quote: 'It is not just a matter of doing, it is a matter of being alive.',
  },
  Monday: {
    title: 'Monday Momentum',
    subtitle: 'Start the week with clear opinions and better decisions.',
    quote: 'Small steps today create stronger results tomorrow.',
  },
  Tuesday: {
    title: 'Tuesday Pulse',
    subtitle: 'Keep tracking what people think.',
    quote: 'Public opinion moves fast. Stay awake.',
  },
  Wednesday: {
    title: 'Midweek Insight',
    subtitle: 'Halfway through the week, the conversation is still alive.',
    quote: 'Good decisions begin with listening.',
  },
  Thursday: {
    title: 'Thursday Focus',
    subtitle: 'A good day to compare views and watch trends shift.',
    quote: 'Clarity comes when many voices are measured well.',
  },
  Friday: {
    title: 'Friday Public Pulse',
    subtitle: 'End the week knowing what people really think.',
    quote: 'The crowd always says something. The smart ones listen.',
  },
  Saturday: {
    title: 'Saturday Snapshot',
    subtitle: 'Weekend opinions still matter.',
    quote: 'Every voice adds something to the arena.',
  },
}

function isAdActive(ad) {
  if (ad.status !== 'active') return false

  const today = new Date().toISOString().slice(0, 10)

  if (ad.start_date && ad.start_date > today) return false
  if (ad.end_date && ad.end_date < today) return false

  return true
}

function PollSection() {
  const navigate = useNavigate()
  const location = useLocation()
  const pollScrollRef = useRef(null)
  const pollRefs = useRef({})

  const [polls, setPolls] = useState([])
  const [ads, setAds] = useState([])
  const [news, setNews] = useState([])
  const [snapshot, setSnapshot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fallbackToday = useMemo(() => {
    const now = new Date()
    const day = now.toLocaleDateString('en-US', { weekday: 'long' })
    const date = now.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    return {
      day,
      date,
      ...(fallbackMessages[day] || fallbackMessages.Sunday),
    }
  }, [])

  const todayData = snapshot || fallbackToday
  const activeAds = ads.filter(isAdActive)

  const sidebarAd = activeAds.find(
    (ad) => ad.placement === 'homepage_sidebar' || ad.placement === 'both'
  )

  const bannerAd = activeAds.find(
    (ad) => ad.placement === 'homepage_banner' || ad.placement === 'both'
  )

  const loadHomeContent = async () => {
    try {
      setError('')

      const [pollData, adData, newsData, snapshotData] = await Promise.all([
        getActivePolls(),
        getSponsorAds(),
        getLatestNewsArticles(3),
        getTodaySnapshot(),
      ])

      setPolls(pollData || [])
      setAds(adData || [])
      setNews(newsData || [])
      setSnapshot(snapshotData)
    } catch (err) {
      setError(err.message || 'Failed to load homepage content.')
    } finally {
      setLoading(false)
    }
  }

  const scrollPolls = (direction) => {
    if (!pollScrollRef.current) return

    const amount = direction === 'left' ? -420 : 420

    pollScrollRef.current.scrollBy({
      left: amount,
      behavior: 'smooth',
    })
  }

  const openAd = (ad) => {
    if (ad?.cta_url) {
      if (ad.cta_url.startsWith('/')) {
        navigate(ad.cta_url)
        return
      }

      window.open(ad.cta_url, '_blank', 'noopener,noreferrer')
      return
    }

    if (ad?.cta_phone) {
      window.open(`tel:${ad.cta_phone}`, '_self')
      return
    }

    navigate('/news')
  }

  const shareAd = async (ad) => {
    const shareText = `${ad.title} - ${ad.description || ''} ${
      ad.cta_url || ad.cta_phone || window.location.href
    }`

    try {
      if (navigator.share) {
        await navigator.share({
          title: ad.title,
          text: shareText,
          url: ad.cta_url?.startsWith('/')
            ? `${window.location.origin}${ad.cta_url}`
            : ad.cta_url || window.location.href,
        })
        return
      }

      await navigator.clipboard.writeText(shareText)
      alert('Ad copied. You can share it now.')
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  useEffect(() => {
    loadHomeContent()
  }, [])

  useEffect(() => {
  if (!polls.length) return

  const params = new URLSearchParams(location.search)
  const slug = params.get('poll')

  if (!slug) return

  const element = pollRefs.current[slug]

  if (!element) return

  setTimeout(() => {
    element.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    })

    element.classList.add('highlight-poll')

    setTimeout(() => {
      element.classList.remove('highlight-poll')
    }, 2500)
  }, 400)
}, [polls, location.search])

  return (
    <section className="poll-section" id="live-polls">
      <div className="section-header">
<div>
  <h2>Trending Live Polls</h2>
  <span className="poll-subtext">
    Updated in real time • ← Scroll for more polls →
  </span>
</div>

        {!loading && !error && polls.length > 1 && (
          <div className="poll-scroll-actions">
            <button type="button" onClick={() => scrollPolls('left')}>
              ←
            </button>
            <button type="button" onClick={() => scrollPolls('right')}>
              →
            </button>
          </div>
        )}
      </div>

      <div className="poll-content-layout">
        <div className="poll-main-column">
          {loading && (
            <div className="poll-card">
              <p className="hero-text">Loading live polls...</p>
            </div>
          )}

          {error && (
            <div className="poll-card">
              <p className="auth-error">{error}</p>
            </div>
          )}

          {!loading && !error && polls.length === 0 && (
            <div className="poll-card">
              <h3>No active polls yet</h3>
              <p className="hero-text">
                Publish a poll from the admin panel to make it appear here.
              </p>
            </div>
          )}

          {!loading && !error && polls.length > 0 && (
            <div className="home-poll-carousel">
              <div className="poll-grid poll-scroll-track" ref={pollScrollRef}>
               {polls.map((poll) => (
  <div
    key={poll.id}
    ref={(el) => {
      pollRefs.current[poll.slug] = el
    }}
  >
    <PollCard
      poll={poll}
      onVoteSuccess={loadHomeContent}
    />
  </div>
))}
              </div>
            </div>
          )}

          {bannerAd && (
            <div className="wide-sponsored-ad">
              <div className="wide-ad-text">
                <span>Sponsored</span>
                <h3>{bannerAd.title}</h3>
                <p>{bannerAd.description}</p>
              </div>

              {bannerAd.image_url && (
                <img src={bannerAd.image_url} alt={bannerAd.title} />
              )}

              <div className="wide-ad-actions">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openAd(bannerAd)}
                >
                  {bannerAd.cta_text || 'Explore'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => shareAd(bannerAd)}
                >
                  Share
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="poll-side-column">
          <div className="today-card">
            <div className="today-card-header">
              <h3>{todayData.title}</h3>
              <span>{todayData.date || todayData.event_date}</span>
            </div>

            {todayData.subtitle && <p>{todayData.subtitle}</p>}
            {todayData.quote && <blockquote>“{todayData.quote}”</blockquote>}
          </div>

          {news.length > 0 && (
            <div className="latest-news-card">
              <div className="latest-news-header">
                <h3>Latest News</h3>

                <button
                  type="button"
                  className="news-view-all-btn"
                  onClick={() => navigate('/news')}
                >
                  View all
                </button>
              </div>

              {news.map((item) => (
                <button
                  type="button"
                  className="news-mini-card"
                  key={item.id}
                  onClick={() => navigate('/news')}
                >
                  {item.image_url && (
                    <img src={item.image_url} alt={item.title} />
                  )}

                  <div>
                    {item.category && <span>{item.category}</span>}
                    <h4>{item.title}</h4>
                    {item.summary && <p>{item.summary}</p>}
                  </div>
                </button>
              ))}
            </div>
          )}

          {sidebarAd && (
            <div className="side-sponsored-ad">
              <span>Sponsored</span>

              <div className="side-ad-body">
                {sidebarAd.image_url && (
                  <img src={sidebarAd.image_url} alt={sidebarAd.title} />
                )}

                <div>
                  <h3>{sidebarAd.title}</h3>
                  <p>{sidebarAd.description}</p>
                </div>
              </div>

              <div className="side-ad-actions">
                <button
                  type="button"
                  className="btn btn-primary full"
                  onClick={() => openAd(sidebarAd)}
                >
                  {sidebarAd.cta_text || 'Explore'}
                </button>

                <button
                  type="button"
                  className="btn btn-secondary full"
                  onClick={() => shareAd(sidebarAd)}
                >
                  Share Ad
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

export default PollSection