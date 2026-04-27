import { useEffect, useState } from 'react'
import { getPolls } from '../../services/pollService'

function AnalyticsPanel() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const data = await getPolls()
        setPolls(data)
      } catch (err) {
        setError(err.message || 'Failed to load analytics.')
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const totalPolls = polls.length
  const activePolls = polls.filter((poll) => poll.status === 'active').length
  const draftPolls = polls.filter((poll) => poll.status === 'draft').length
  const closedPolls = polls.filter((poll) => poll.status === 'closed').length

  const totalVotes = polls.reduce((pollSum, poll) => {
    const votes = poll.poll_options?.reduce(
      (optionSum, option) => optionSum + (option.votes?.length || 0),
      0
    )

    return pollSum + (votes || 0)
  }, 0)

  const categoryStats = polls.reduce((stats, poll) => {
    const pollVotes = poll.poll_options?.reduce(
      (sum, option) => sum + (option.votes?.length || 0),
      0
    )

    if (!stats[poll.category]) {
      stats[poll.category] = {
        polls: 0,
        votes: 0,
      }
    }

    stats[poll.category].polls += 1
    stats[poll.category].votes += pollVotes || 0

    return stats
  }, {})

  const categoryRows = Object.entries(categoryStats)
    .map(([category, stats]) => ({
      category,
      polls: stats.polls,
      votes: stats.votes,
    }))
    .sort((a, b) => b.votes - a.votes)

  const mostVotedPoll = [...polls]
    .map((poll) => {
      const votes = poll.poll_options?.reduce(
        (sum, option) => sum + (option.votes?.length || 0),
        0
      )

      return {
        ...poll,
        votes: votes || 0,
      }
    })
    .sort((a, b) => b.votes - a.votes)[0]

  const maxCategoryVotes = Math.max(
    ...categoryRows.map((row) => row.votes),
    1
  )

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
      <div className="analytics-header">
        <div>
          <h3>Analytics</h3>
          <p className="hero-text">
            Track poll performance, votes, category strength and platform pulse.
          </p>
        </div>
      </div>

      <div className="analytics-grid">
        <div className="analytics-stat">
          <span>Total Polls</span>
          <strong>{totalPolls}</strong>
        </div>

        <div className="analytics-stat">
          <span>Total Votes</span>
          <strong>{totalVotes}</strong>
        </div>

        <div className="analytics-stat">
          <span>Active Polls</span>
          <strong>{activePolls}</strong>
        </div>

        <div className="analytics-stat">
          <span>Drafts</span>
          <strong>{draftPolls}</strong>
        </div>
      </div>

      <div className="analytics-split">
        <div className="analytics-box">
          <h4>Poll Status Breakdown</h4>

          <div className="status-bars">
            <div>
              <span>Active</span>
              <div className="analytics-bar">
                <div
                  style={{
                    width: `${totalPolls ? (activePolls / totalPolls) * 100 : 0}%`,
                  }}
                />
              </div>
              <strong>{activePolls}</strong>
            </div>

            <div>
              <span>Draft</span>
              <div className="analytics-bar">
                <div
                  style={{
                    width: `${totalPolls ? (draftPolls / totalPolls) * 100 : 0}%`,
                  }}
                />
              </div>
              <strong>{draftPolls}</strong>
            </div>

            <div>
              <span>Closed</span>
              <div className="analytics-bar">
                <div
                  style={{
                    width: `${totalPolls ? (closedPolls / totalPolls) * 100 : 0}%`,
                  }}
                />
              </div>
              <strong>{closedPolls}</strong>
            </div>
          </div>
        </div>

        <div className="analytics-box">
          <h4>Most Voted Poll</h4>

          {mostVotedPoll ? (
            <>
              <p className="analytics-question">{mostVotedPoll.question}</p>
              <span className="poll-badge">{mostVotedPoll.category}</span>
              <p className="hero-text">{mostVotedPoll.votes} total votes</p>
            </>
          ) : (
            <p className="hero-text">No poll data yet.</p>
          )}
        </div>
      </div>

      <div className="analytics-box">
        <h4>Votes by Category</h4>

        {categoryRows.length === 0 ? (
          <p className="hero-text">No categories with votes yet.</p>
        ) : (
          <div className="category-analytics-list">
            {categoryRows.map((row) => (
              <div className="category-analytics-row" key={row.category}>
                <div>
                  <strong>{row.category}</strong>
                  <span>{row.polls} polls • {row.votes} votes</span>
                </div>

                <div className="analytics-bar">
                  <div
                    style={{
                      width: `${(row.votes / maxCategoryVotes) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default AnalyticsPanel