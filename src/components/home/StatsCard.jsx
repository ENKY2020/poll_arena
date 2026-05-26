import { useEffect, useMemo, useState } from 'react'
import { getPolls } from '../../services/pollService'

function StatsCard() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await getPolls()
        setPolls(data || [])
      } catch (err) {
        console.error('Failed to load stats:', err.message)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  const stats = useMemo(() => {
    const activePolls = polls.filter((poll) => poll.status === 'active')

    const totalVotes = polls.reduce((pollSum, poll) => {
      const votesFromOptions = poll.poll_options?.reduce((optionSum, option) => {
        return optionSum + (option.votes?.length || option.vote_count || option.votes_count || 0)
      }, 0)

      return pollSum + (votesFromOptions || poll.total_votes || poll.vote_count || 0)
    }, 0)

    const categoryVotes = {}

    polls.forEach((poll) => {
      const category = poll.category || 'General'

      const votes = poll.poll_options?.reduce((sum, option) => {
        return sum + (option.votes?.length || option.vote_count || option.votes_count || 0)
      }, 0) || poll.total_votes || poll.vote_count || 0

      categoryVotes[category] = (categoryVotes[category] || 0) + votes
    })

    const topCategory =
      Object.entries(categoryVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'None'

    const topPoll = [...polls].sort((a, b) => {
      const getVotes = (poll) =>
        poll.poll_options?.reduce((sum, option) => {
          return sum + (option.votes?.length || option.vote_count || option.votes_count || 0)
        }, 0) || poll.total_votes || poll.vote_count || 0

      return getVotes(b) - getVotes(a)
    })[0]

    return {
      activePolls: activePolls.length,
      totalVotes,
      topCategory,
      topPollTitle: topPoll?.question || topPoll?.title || 'No trending poll yet',
    }
  }, [polls])

  return (
    <div className="stats-card hero-intelligence-card">
      <span className="hero-live-badge">Live Public Pulse</span>

      <h3>{loading ? 'Loading pulse...' : 'Today’s Intelligence'}</h3>

      <p className="hero-pulse-text">
        {stats.totalVotes > 0
          ? `${stats.totalVotes} votes recorded across active public issues.`
          : 'Public activity will appear here as people vote.'}
      </p>

      <div className="stat-row">
        <span>Active Polls</span>
        <strong>{stats.activePolls}</strong>
      </div>

      <div className="stat-row">
        <span>Total Votes</span>
        <strong>{stats.totalVotes}</strong>
      </div>

      <div className="stat-row">
        <span>Top Category</span>
        <strong>{stats.topCategory}</strong>
      </div>

      <div className="hero-trending-mini">
        <small>Trending Poll</small>
        <strong>{stats.topPollTitle}</strong>
      </div>
    </div>
  )
}

export default StatsCard