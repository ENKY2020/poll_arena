import { useEffect, useState } from 'react'
import PollCard from './PollCard'
import { getActivePolls } from '../../services/pollService'

function PollSection() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadPolls = async () => {
    try {
      setError('')
      const data = await getActivePolls()
      setPolls(data)
    } catch (err) {
      setError(err.message || 'Failed to load polls.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolls()
  }, [])

  return (
    <section className="poll-section" id="live-polls">
      <div className="section-header">
        <h2>Trending Live Polls</h2>
        <span>Updated in real time</span>
      </div>

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
        <div className="poll-grid">
          {polls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onVoteSuccess={loadPolls}
            />
          ))}
        </div>
      )}
    </section>
  )
}

export default PollSection