import { useEffect, useState } from 'react'
import { getPolls } from '../../services/pollService'

function StatsCard() {
  const [stats, setStats] = useState({
    activePolls: 0,
    totalVotes: 0,
    topCategory: 'None',
  })

  useEffect(() => {
    async function loadStats() {
      try {
        const polls = await getPolls()

        const activePolls = polls.filter((poll) => poll.status === 'active')

        const totalVotes = polls.reduce((pollSum, poll) => {
          const votesInPoll = poll.poll_options?.reduce(
            (optionSum, option) => optionSum + (option.votes?.length || 0),
            0
          )

          return pollSum + (votesInPoll || 0)
        }, 0)

        const categoryCounts = activePolls.reduce((counts, poll) => {
          counts[poll.category] = (counts[poll.category] || 0) + 1
          return counts
        }, {})

        const topCategory =
          Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
          'None'

        setStats({
          activePolls: activePolls.length,
          totalVotes,
          topCategory,
        })
      } catch (err) {
        console.error('Failed to load stats:', err.message)
      }
    }

    loadStats()
  }, [])

  return (
    <div className="stats-card">
      <h3>Today’s Pulse</h3>

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
    </div>
  )
}

export default StatsCard