import { useEffect, useState } from 'react'
import { getPolls, updatePollStatus } from '../../services/pollService'

function PollManager() {
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)
  const [error, setError] = useState('')

  const loadPolls = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPolls()
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

  const handleStatusChange = async (pollId, status) => {
    try {
      setUpdatingId(pollId)
      setError('')

      await updatePollStatus(pollId, status)
      await loadPolls()
    } catch (err) {
      setError(err.message || 'Failed to update poll status.')
    } finally {
      setUpdatingId(null)
    }
  }

  const activeCount = polls.filter((poll) => poll.status === 'active').length
  const draftCount = polls.filter((poll) => poll.status === 'draft').length
  const closedCount = polls.filter((poll) => poll.status === 'closed').length

  return (
    <div className="poll-card poll-manager-card">
      <div className="poll-manager-header">
        <div>
          <h3>Poll Management</h3>
          <p className="hero-text">
            Manage drafts, publish polls, close polls, and preview poll images.
          </p>
        </div>

       <button
  type="button"
  className="btn btn-secondary"
  onClick={() => {
    document
      .getElementById('create-poll-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }}
>
  + Create New Poll
</button>
      </div>

      <div className="poll-tabs">
        <span className="active">All Polls {polls.length}</span>
        <span>● Active {activeCount}</span>
        <span>● Drafts {draftCount}</span>
        <span>● Closed {closedCount}</span>
      </div>

      {loading && <p className="hero-text">Loading polls...</p>}
      {error && <p className="auth-error">{error}</p>}

      {!loading && !error && polls.length === 0 && (
        <p className="hero-text">No polls created yet.</p>
      )}

      {!loading && polls.length > 0 && (
        <div className="poll-table-wrap">
          <table className="poll-table">
            <thead>
              <tr>
                <th>Poll</th>
                <th>Category</th>
                <th>Status</th>
                <th>Options</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {polls.map((poll) => {
                const options = [...(poll.poll_options || [])].sort(
                  (a, b) => a.position - b.position
                )

                const isUpdating = updatingId === poll.id

                return (
                  <tr key={poll.id}>
                    <td>
                      <strong>{poll.question}</strong>

                      <div className="admin-option-preview-row">
                        {options.map((option) => (
                          <div className="admin-option-preview" key={option.id}>
                            <div className="admin-option-thumb">
                              {option.image_url ? (
                             <img
  src={option.image_url?.trim()}
  alt={option.option_text}
  onError={() => {
    console.error('FAILED ADMIN IMAGE URL:', option.image_url)
  }}
/>
                              ) : (
                                <span>{option.option_text?.charAt(0)}</span>
                              )}
                            </div>

                            <span>{option.option_text}</span>
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>{poll.category}</td>

                    <td>
                      <span className={`status-pill ${poll.status}`}>
                        {poll.status}
                      </span>
                    </td>

                    <td>{options.length}</td>

                    <td>{new Date(poll.created_at).toLocaleDateString()}</td>

                    <td>
                      <div className="poll-actions">
                        {poll.status === 'draft' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(poll.id, 'active')
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Publishing...' : 'Publish'}
                          </button>
                        )}

                        {poll.status === 'active' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(poll.id, 'closed')
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Closing...' : 'Close'}
                          </button>
                        )}

                        {poll.status === 'closed' && (
                          <button
                            type="button"
                            onClick={() =>
                              handleStatusChange(poll.id, 'active')
                            }
                            disabled={isUpdating}
                          >
                            {isUpdating ? 'Reopening...' : 'Reopen'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PollManager