import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../services/supabaseClient'
import { getBasicAnalytics } from '../../services/analyticService'

function AnalyticsPanel() {
  const [polls, setPolls] = useState([])
  const [votes, setVotes] = useState([])
  const [shares, setShares] = useState([])
  const [sources, setSources] = useState([])
  const [subscribers, setSubscribers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      setError('')

      const { data: pollsData, error: pollsError } = await supabase
        .from('polls')
        .select('*')
        .order('created_at', { ascending: false })

      if (pollsError) throw pollsError

      const { data: votesData, error: votesError } = await supabase
        .from('votes')
        .select('*')

      if (votesError) throw votesError

      const intelligence = await getBasicAnalytics()

      setPolls(pollsData || [])
      setVotes(votesData || [])
      setShares(intelligence.shares || [])
      setSources(intelligence.sources || [])
      setSubscribers(intelligence.subscribers || [])
    } catch (err) {
      console.error('Analytics load failed:', err)
      setError(err.message || 'Failed to load analytics.')
    } finally {
      setLoading(false)
    }
  }

  const getPollTitle = (poll) =>
    poll?.question || poll?.title || poll?.poll_title || 'Untitled Poll'

  const getPollStatus = (poll) =>
    (poll.status || (poll.is_active ? 'active' : 'draft') || 'draft').toLowerCase()

  const getPollCategory = (poll) =>
    poll.category || poll.category_name || 'uncategorized'

  const getPollVotes = (poll) => {
    const voteRows = votes.filter((vote) => vote.poll_id === poll.id)
    return voteRows.length
  }

  const countByKey = (items, key, fallback = 'unknown') => {
    return items.reduce((acc, item) => {
      const value = item[key] || fallback
      acc[value] = (acc[value] || 0) + 1
      return acc
    }, {})
  }

  const topFromMap = (map) => {
    return Object.entries(map).sort((a, b) => b[1] - a[1])[0]
  }

  const analytics = useMemo(() => {
    const totalPolls = polls.length
    const totalVotes = votes.length

    const activePolls = polls.filter((poll) => getPollStatus(poll) === 'active')
    const draftPolls = polls.filter((poll) => getPollStatus(poll) === 'draft')
    const closedPolls = polls.filter((poll) => getPollStatus(poll) === 'closed')

    const categoryMap = {}

    polls.forEach((poll) => {
      const category = getPollCategory(poll)
      const pollVotes = getPollVotes(poll)

      if (!categoryMap[category]) {
        categoryMap[category] = { category, polls: 0, votes: 0 }
      }

      categoryMap[category].polls += 1
      categoryMap[category].votes += pollVotes
    })

    const categories = Object.values(categoryMap).sort((a, b) => b.votes - a.votes)

    const mostVotedPoll = [...polls].sort(
      (a, b) => getPollVotes(b) - getPollVotes(a)
    )[0]

    const sharePlatformMap = countByKey(shares, 'platform')
    const trafficSourceMap = countByKey(sources, 'source', 'direct')

    const topSharePlatform = topFromMap(sharePlatformMap)
    const topTrafficSource = topFromMap(trafficSourceMap)

    const mostSharedPollId = topFromMap(countByKey(shares, 'poll_id'))?.[0]
    const mostSharedPoll = polls.find((poll) => poll.id === mostSharedPollId)

    const latestSubscribers = [...subscribers]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)

    return {
      totalPolls,
      totalVotes,
      activePolls: activePolls.length,
      draftPolls: draftPolls.length,
      closedPolls: closedPolls.length,
      categories,
      mostVotedPoll,
      totalShares: shares.length,
      totalTrafficSources: sources.length,
      totalSubscribers: subscribers.length,
      sharePlatformMap,
      trafficSourceMap,
      topSharePlatform,
      topTrafficSource,
      mostSharedPoll,
      latestSubscribers,
    }
  }, [polls, votes, shares, sources, subscribers])

  if (loading) {
    return (
      <section className="poll-card">
        <h3>Analytics</h3>
        <p className="hero-text">Loading analytics...</p>
      </section>
    )
  }

  if (error) {
    return (
      <section className="poll-card">
        <h3>Analytics</h3>
        <p className="auth-error">{error}</p>
      </section>
    )
  }

  return (
    <section className="poll-card analytics-panel">
      <div className="poll-manager-header">
        <div>
          <h3>Analytics & Growth Intelligence</h3>
          <p className="hero-text">
            Track votes, shares, traffic sources, and newsletter interest.
          </p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={loadAnalytics}>
          Refresh
        </button>
      </div>

      <div className="analytics-grid">
        <StatCard label="Total Polls" value={analytics.totalPolls} />
        <StatCard label="Total Votes" value={analytics.totalVotes} />
        <StatCard label="Total Shares" value={analytics.totalShares} />
        <StatCard label="Newsletter Subscribers" value={analytics.totalSubscribers} />
      </div>

      <div className="analytics-grid">
        <StatCard label="Traffic Records" value={analytics.totalTrafficSources} />
        <StatCard label="Active Polls" value={analytics.activePolls} />
        <StatCard label="Drafts" value={analytics.draftPolls} />
        <StatCard label="Closed Polls" value={analytics.closedPolls} />
      </div>

      <div className="analytics-two-column">
        <div className="analytics-box">
          <h4>Top Share Platforms</h4>

          {Object.keys(analytics.sharePlatformMap).length === 0 ? (
            <p className="hero-text">No shares tracked yet.</p>
          ) : (
            Object.entries(analytics.sharePlatformMap)
              .sort((a, b) => b[1] - a[1])
              .map(([platform, count]) => (
                <AnalyticsBar
                  key={platform}
                  label={platform}
                  value={count}
                  max={analytics.totalShares}
                />
              ))
          )}
        </div>

        <div className="analytics-box">
          <h4>Top Traffic Sources</h4>

          {Object.keys(analytics.trafficSourceMap).length === 0 ? (
            <p className="hero-text">No traffic source records yet.</p>
          ) : (
            Object.entries(analytics.trafficSourceMap)
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => (
                <AnalyticsBar
                  key={source}
                  label={source}
                  value={count}
                  max={analytics.totalTrafficSources}
                />
              ))
          )}
        </div>
      </div>

      <div className="analytics-two-column">
        <div className="analytics-box">
          <h4>Most Voted Poll</h4>

          {analytics.mostVotedPoll ? (
            <>
              <h3>{getPollTitle(analytics.mostVotedPoll)}</h3>
              <span className="mini-pill">{getPollCategory(analytics.mostVotedPoll)}</span>
              <p className="hero-text">
                {getPollVotes(analytics.mostVotedPoll)} total votes
              </p>
            </>
          ) : (
            <p className="hero-text">No poll data yet.</p>
          )}
        </div>

        <div className="analytics-box">
          <h4>Most Shared Poll</h4>

          {analytics.mostSharedPoll ? (
            <>
              <h3>{getPollTitle(analytics.mostSharedPoll)}</h3>
              <span className="mini-pill">{getPollCategory(analytics.mostSharedPoll)}</span>
              <p className="hero-text">
                This poll is getting the most distribution activity.
              </p>
            </>
          ) : (
            <p className="hero-text">No shared poll data yet.</p>
          )}
        </div>
      </div>

      <div className="analytics-box">
        <h4>Votes by Category</h4>

        {analytics.categories.length === 0 ? (
          <p className="hero-text">No categories have votes yet.</p>
        ) : (
          analytics.categories.map((item) => (
            <AnalyticsBar
              key={item.category}
              label={item.category}
              value={item.votes}
              max={analytics.totalVotes}
              sublabel={`${item.polls} polls • ${item.votes} votes`}
            />
          ))
        )}
      </div>

      <div className="analytics-box">
        <h4>Recent Newsletter Subscribers</h4>

        {analytics.latestSubscribers.length === 0 ? (
          <p className="hero-text">No newsletter subscribers yet.</p>
        ) : (
          <div className="subscriber-list">
            {analytics.latestSubscribers.map((subscriber) => (
              <div className="subscriber-row" key={subscriber.id}>
                <strong>{subscriber.email}</strong>
                <span>{subscriber.source || 'unknown source'}</span>
                <small>
                  {subscriber.created_at
                    ? new Date(subscriber.created_at).toLocaleString()
                    : 'No date'}
                </small>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="analytics-box intelligence-preview">
        <h4>Growth Intelligence Preview</h4>

        <div className="intelligence-list">
          <div>
            <span>Best Share Channel</span>
            <strong>
              {analytics.topSharePlatform
                ? `${analytics.topSharePlatform[0]} (${analytics.topSharePlatform[1]})`
                : 'Not enough data'}
            </strong>
            <p>Shows where users prefer sharing Poll Arena content.</p>
          </div>

          <div>
            <span>Best Traffic Source</span>
            <strong>
              {analytics.topTrafficSource
                ? `${analytics.topTrafficSource[0]} (${analytics.topTrafficSource[1]})`
                : 'Not enough data'}
            </strong>
            <p>Shows which platform is bringing visitors back.</p>
          </div>

          <div>
            <span>Email Audience</span>
            <strong>{analytics.totalSubscribers} subscribers</strong>
            <p>These users have asked to receive Poll Arena updates.</p>
          </div>
        </div>
      </div>
    </section>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="analytics-stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function AnalyticsBar({ label, value, max, sublabel }) {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0

  return (
    <div className="analytics-bar-row">
      <div className="analytics-bar-label">
        <strong>{label}</strong>
        {sublabel && <small>{sublabel}</small>}
      </div>

      <div className="analytics-bar-track">
        <div
          className="analytics-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <strong>{value}</strong>
    </div>
  )
}

export default AnalyticsPanel