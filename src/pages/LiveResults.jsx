import { useEffect, useState } from 'react'
import { getActivePolls } from '../services/pollService'

function LiveResults() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadResults = async () => {
    try {
      setError('')
      const data = await getActivePolls()
      setPolls(data)
    } catch (err) {
      setError(err.message || 'Failed to load live results.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResults()
  }, [])

  const totalVotes = polls.reduce((sum, poll) => {
    const pollVotes = poll.poll_options?.reduce(
      (optionSum, option) => optionSum + (option.votes?.length || 0),
      0
    )

    return sum + (pollVotes || 0)
  }, 0)

  return (
    <section className="poll-section">
      <div className="section-header">
        <h2>Live Results</h2>
        <span>Track public opinion in real time</span>
      </div>

      <div className="results-summary-grid">
        <div className="poll-card result-summary-card">
          <span>Active Polls</span>
          <strong>{polls.length}</strong>
        </div>

        <div className="poll-card result-summary-card">
          <span>Total Votes</span>
          <strong>{totalVotes}</strong>
        </div>

        <div className="poll-card result-summary-card">
          <span>Status</span>
          <strong>Live</strong>
        </div>
      </div>

      {loading && (
        <div className="poll-card">
          <p className="hero-text">Loading live results...</p>
        </div>
      )}

      {error && (
        <div className="poll-card">
          <p className="auth-error">{error}</p>
        </div>
      )}

      {!loading && !error && polls.length === 0 && (
        <div className="poll-card">
          <h3>No live polls yet</h3>
          <p className="hero-text">
            Publish a poll from the admin panel to start seeing live results.
          </p>
        </div>
      )}

      {!loading && !error && polls.length > 0 && (
        <div className="live-results-list">
          {polls.map((poll) => {
            const options = [...(poll.poll_options || [])].sort(
              (a, b) => a.position - b.position
            )

            const pollTotalVotes = options.reduce(
              (sum, option) => sum + (option.votes?.length || 0),
              0
            )

            return (
              <div className="poll-card live-result-card" key={poll.id}>
                <div className="live-result-header">
                  <div>
                    <span className="poll-badge">{poll.category}</span>
                    <h3>{poll.question}</h3>
                  </div>

                  <div className="live-total-box">
                    <strong>{pollTotalVotes}</strong>
                    <span>votes</span>
                  </div>
                </div>

                <div className="live-result-options">
                  {options.map((option) => {
                    const optionVotes = option.votes?.length || 0
                    const percentage =
                      pollTotalVotes === 0
                        ? 0
                        : Math.round((optionVotes / pollTotalVotes) * 100)

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

                          <small>{optionVotes} votes</small>
                        </div>
                      </div>
                    )
                  })}
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