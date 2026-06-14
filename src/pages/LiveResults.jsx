import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  getActivePolls,
  getPollBySlug,
} from '../services/pollService'
import { trackShare } from '../services/analyticService'
import { supabase } from '../services/supabaseClient'
import AppLoader from '../components/common/AppLoader'

const PIE_COLORS = ['#1f5bc4', '#7c3aed', '#f2b705', '#0ea5e9', '#10b981', '#ef4444']

function LiveResults() {
  const [polls, setPolls] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [shareLoading, setShareLoading] = useState('')
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const { slug } = useParams()

  const loadResults = async (isRefresh = false) => {
  try {
    setError('')
    isRefresh ? setRefreshing(true) : setLoading(true)

    if (slug) {
      const poll = await getPollBySlug(slug)
      setPolls(poll ? [poll] : [])
    } else {
      const data = await getActivePolls()
      setPolls(data || [])
    }

    setLastUpdated(new Date())
  } catch (err) {
    setError(err.message || 'Failed to load live results.')
  } finally {
    setLoading(false)
    setRefreshing(false)
  }
}

 useEffect(() => {
  loadResults()
}, [slug])

  const goToLogin = () => {
    const returnTo = encodeURIComponent(
      window.location.pathname + window.location.search
    )

    window.location.href = `/login?returnTo=${returnTo}`
  }

  const requireLoginForAction = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first to share Poll Arena results.')
      goToLogin()
      return false
    }

    return true
  }

  const getOptionVotes = (option) =>
    option.votes?.length || option.vote_count || option.votes_count || 0

  const getPollVotes = (poll) =>
    (poll.poll_options || []).reduce((sum, option) => sum + getOptionVotes(option), 0)

  const getPercentage = (optionVotes, totalVotes) => {
    if (!totalVotes) return '0.0'
    return ((optionVotes / totalVotes) * 100).toFixed(1)
  }

const getPollShareUrl = (poll, platform = 'direct') => {
  if (!poll.slug) {
    return `${window.location.origin}/live-results`
  }

  return `${window.location.origin}/poll/${poll.slug}`
}

  const getPollShareText = (poll) => {
    const totalVotes = getPollVotes(poll)
    return `Check the live results on Poll Arena:\n"${poll.question}"\n\nTotal votes: ${totalVotes}`
  }

  const saveShareAnalytics = async (platform, poll, shareUrl) => {
    await trackShare({
      pollId: poll.id,
      platform,
      shareUrl,
    })
  }

  const handleNativeShare = async (poll) => {
    const canContinue = await requireLoginForAction()
    if (!canContinue) return

    const platform = 'native'
    const shareText = getPollShareText(poll)
    const shareUrl = getPollShareUrl(poll, platform)

    try {
      setShareLoading(`${poll.id}-${platform}`)
      await saveShareAnalytics(platform, poll, shareUrl)

      if (navigator.share) {
        await navigator.share({
          title: poll.question,
          text: shareText,
          url: shareUrl,
        })
        return
      }

      await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
      alert('Live results link copied.')
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setShareLoading('')
    }
  }

  const handleCopyLink = async (poll) => {
    const canContinue = await requireLoginForAction()
    if (!canContinue) return

    const platform = 'copy_link'
    const shareUrl = getPollShareUrl(poll, platform)

    try {
      setShareLoading(`${poll.id}-${platform}`)
      await navigator.clipboard.writeText(shareUrl)
      await saveShareAnalytics(platform, poll, shareUrl)
      alert('Live results link copied.')
    } catch (err) {
      console.error('Copy failed:', err)
    } finally {
      setShareLoading('')
    }
  }

  const openShareLink = async (platform, poll) => {
    const canContinue = await requireLoginForAction()
    if (!canContinue) return

    const shareUrl = getPollShareUrl(poll, platform)
    const url = encodeURIComponent(shareUrl)
    const text = encodeURIComponent(getPollShareText(poll))

    const links = {
      whatsapp: `https://wa.me/?text=${text}%0A${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    }

    try {
      setShareLoading(`${poll.id}-${platform}`)
      await saveShareAnalytics(platform, poll, shareUrl)
      window.open(links[platform], '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Platform share failed:', err)
    } finally {
      setShareLoading('')
    }
  }

  const analytics = useMemo(() => {
    const totalVotes = polls.reduce((sum, poll) => sum + getPollVotes(poll), 0)
    const categoryMap = {}

    polls.forEach((poll) => {
      const category = poll.category || 'General'
      categoryMap[category] = (categoryMap[category] || 0) + getPollVotes(poll)
    })

    const topCategory =
      Object.entries(categoryMap).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

    const mostVotedPoll = [...polls].sort((a, b) => getPollVotes(b) - getPollVotes(a))[0]

    const mostCompetitivePoll = [...polls].find((poll) => {
      const options = poll.poll_options || []
      if (options.length < 2) return false

      const sorted = [...options].sort((a, b) => getOptionVotes(b) - getOptionVotes(a))
      const first = getOptionVotes(sorted[0])
      const second = getOptionVotes(sorted[1])

      return first > 0 && second > 0 && first - second <= 3
    })

    return {
      totalVotes,
      topCategory,
      mostVotedPoll,
      mostCompetitivePoll,
    }
  }, [polls])

  const categories = useMemo(() => {
    const unique = polls.map((poll) => poll.category).filter(Boolean)
    return ['All', ...new Set(unique)]
  }, [polls])

  const filteredPolls =
    activeCategory === 'All'
      ? polls
      : polls.filter((poll) => poll.category === activeCategory)

  const PieChart = ({ options, totalVotes }) => {
    const radius = 42
    const circumference = 2 * Math.PI * radius
    let offset = 0

    if (!totalVotes) {
      return (
        <div className="live-pie-wrap">
          <svg viewBox="0 0 120 120" className="live-pie-chart">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#e5eaf3" strokeWidth="18" />
          </svg>
          <span className="live-pie-center">0</span>
        </div>
      )
    }

    return (
      <div className="live-pie-wrap">
        <svg viewBox="0 0 120 120" className="live-pie-chart">
          {options.map((option, index) => {
            const votes = getOptionVotes(option)
            const segment = (votes / totalVotes) * circumference
            const dashArray = `${segment} ${circumference - segment}`
            const dashOffset = -offset

            offset += segment

            return (
              <circle
                key={option.id}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={PIE_COLORS[index % PIE_COLORS.length]}
                strokeWidth="18"
                strokeDasharray={dashArray}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
                transform="rotate(-90 60 60)"
              />
            )
          })}
        </svg>

        <span className="live-pie-center">{totalVotes}</span>
      </div>
    )
  }

  if (loading) {
    return <AppLoader message="Fetching the latest public opinion..." />
  }

  return (
    <section className="poll-section live-results-page">
      <div className="live-results-hero">
        <div>
          <span>Live Public Intelligence</span>
          <h2>Live Results</h2>
          <p>
            Track voting patterns, leading opinions, category strength and public
            sentiment as results update in real time.
          </p>

          {lastUpdated && (
            <small className="last-updated">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </small>
          )}
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => loadResults(true)}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Results'}
        </button>
      </div>

      <div className="results-summary-grid upgraded-results-grid">
        <div className="poll-card result-summary-card">
          <span>Active Polls</span>
          <strong>{polls.length}</strong>
        </div>

        <div className="poll-card result-summary-card">
          <span>Total Votes</span>
          <strong>{analytics.totalVotes}</strong>
        </div>

        <div className="poll-card result-summary-card">
          <span>Top Category</span>
          <strong>{analytics.topCategory}</strong>
        </div>

        <div className="poll-card result-summary-card">
          <span>Status</span>
          <strong>{refreshing ? 'Updating' : 'Live'}</strong>
        </div>
      </div>

      {polls.length > 0 && (
        <div className="live-insight-strip">
          <div>
            <span>Most Watched Poll</span>
            <strong>{analytics.mostVotedPoll?.question || 'No leading poll yet'}</strong>
          </div>

          <div>
            <span>Competitive Race</span>
            <strong>{analytics.mostCompetitivePoll?.question || 'No close race yet'}</strong>
          </div>
        </div>
      )}

      <div className="news-tabs live-filter-tabs">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={activeCategory === category ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {error && (
        <div className="poll-card">
          <p className="auth-error">{error}</p>
          <button type="button" className="btn btn-primary" onClick={() => loadResults(true)}>
            Try Again
          </button>
        </div>
      )}

      {!error && filteredPolls.length === 0 && (
        <div className="poll-card">
          <h3>No live polls yet</h3>
          <p className="hero-text">
            Publish a poll from the admin panel to start seeing live results.
          </p>
        </div>
      )}

      {!error && filteredPolls.length > 0 && (
        <div className="live-results-list upgraded-live-list">
          {filteredPolls.map((poll) => {
            const options = [...(poll.poll_options || [])].sort(
              (a, b) => (a.position || 0) - (b.position || 0)
            )

            const pollTotalVotes = getPollVotes(poll)

            const leadingOption = [...options].sort(
              (a, b) => getOptionVotes(b) - getOptionVotes(a)
            )[0]

            return (
              <div className="poll-card live-result-card upgraded-live-card" key={poll.id}>
                <div className="live-result-header">
                  <div>
                    <span className="poll-badge">{poll.category || 'General'}</span>
                    <h3>{poll.question}</h3>
                    <p>
                      Leading now:{' '}
                      <strong>{leadingOption?.option_text || 'Waiting for votes'}</strong>
                    </p>
                  </div>

                  <div className="live-total-box">
                    <strong>{pollTotalVotes}</strong>
                    <span>votes</span>
                  </div>
                </div>

                <div className="live-result-body">
                  <div className="live-result-options">
                    {options.map((option) => {
                      const optionVotes = getOptionVotes(option)
                      const percentage = getPercentage(optionVotes, pollTotalVotes)

                      return (
                        <div className="live-result-option" key={option.id}>
                          <div className="live-result-image">
                            {option.image_url ? (
                              <img src={option.image_url} alt={option.option_text} />
                            ) : (
                              <span>{option.option_text?.charAt(0)}</span>
                            )}
                          </div>

                          <div className="live-result-info">
                            <div className="poll-label-row">
                              <span>{option.option_text}</span>
                              <strong>{percentage}%</strong>
                            </div>

                            <div className="progress">
                              <div
                                className="progress-fill fill-purple"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>

                           <small className="poll-sentiment">
  {Number(percentage) >= 60
    ? '📈 Leading'
    : Number(percentage) >= 40
    ? '⚡ Competitive'
    : '🌱 Emerging'}
</small>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="live-pie-card">
                    <PieChart options={options} totalVotes={pollTotalVotes} />

                    <div className="live-pie-legend">
                      {options.map((option, index) => (
                        <span key={option.id}>
                          <i
                            style={{
                              backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                            }}
                          />
                          {option.option_text}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="live-share-row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleNativeShare(poll)}
                    disabled={shareLoading === `${poll.id}-native`}
                  >
                    {shareLoading === `${poll.id}-native` ? 'Sharing...' : 'Share Results'}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openShareLink('whatsapp', poll)}
                    disabled={shareLoading === `${poll.id}-whatsapp`}
                  >
                    WhatsApp
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openShareLink('facebook', poll)}
                    disabled={shareLoading === `${poll.id}-facebook`}
                  >
                    Facebook
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => openShareLink('x', poll)}
                    disabled={shareLoading === `${poll.id}-x`}
                  >
                    X
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => handleCopyLink(poll)}
                    disabled={shareLoading === `${poll.id}-copy_link`}
                  >
                    Copy Link
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default LiveResults