import { useState } from 'react'
import { castVote } from '../../services/voteService'

function PollCard({ poll, onVoteSuccess }) {
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const options = [...(poll.poll_options || [])].sort(
    (a, b) => a.position - b.position
  )

  const totalVotes = options.reduce(
    (sum, option) => sum + (option.votes?.length || 0),
    0
  )

  const handleVote = async () => {
    if (!selectedOptionId) {
      setError('Please select one option first.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      await castVote({
        pollId: poll.id,
        optionId: selectedOptionId,
      })

      setMessage('Vote recorded successfully.')
      setSelectedOptionId('')

      if (onVoteSuccess) {
        await onVoteSuccess()
      }
    } catch (err) {
      setError(err.message || 'Failed to submit vote.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="poll-card visual-poll-card">
      <span className="poll-badge">{poll.category}</span>
      <h3>{poll.question}</h3>

      <div className="visual-poll-options">
        {options.map((option) => {
          const optionVotes = option.votes?.length || 0
          const percentage =
            totalVotes === 0 ? 0 : Math.round((optionVotes / totalVotes) * 100)

          return (
            <button
              key={option.id}
              type="button"
              className={`visual-vote-option ${
                selectedOptionId === option.id ? 'selected' : ''
              }`}
              onClick={() => setSelectedOptionId(option.id)}
              disabled={loading}
            >
              <div className="visual-vote-image">
                {option.image_url ? (
<img
  src={option.image_url?.trim()}
  alt={option.option_text}
  loading="lazy"
  onError={() => {
    console.error('FAILED IMAGE URL:', option.image_url)
  }}
/>
                ) : null}

                <span
                  className="visual-vote-fallback"
                  style={{ display: option.image_url ? 'none' : 'grid' }}
                >
                  {option.option_text?.charAt(0)}
                </span>
              </div>

              <div className="visual-vote-info">
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
            </button>
          )
        })}
      </div>

      <p className="hero-text">Total votes: {totalVotes}</p>

      <button
        type="button"
        className="btn btn-primary full"
        onClick={handleVote}
        disabled={loading}
      >
        {loading ? 'Submitting...' : 'Vote Now'}
      </button>

      {message && <p className="auth-success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}
    </div>
  )
}

export default PollCard