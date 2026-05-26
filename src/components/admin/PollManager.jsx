import { useEffect, useMemo, useState } from 'react'
import { deletePoll, getPolls, updatePollStatus } from '../../services/pollService'

function PollManager() {
  const [polls, setPolls] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(true)
  const [workingId, setWorkingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const loadPolls = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getPolls()
      setPolls(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load polls.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPolls()
  }, [])

  const counts = useMemo(() => {
    return {
      all: polls.length,
      active: polls.filter((poll) => poll.status === 'active').length,
      draft: polls.filter((poll) => poll.status === 'draft').length,
      closed: polls.filter((poll) => poll.status === 'closed').length,
    }
  }, [polls])

  const visiblePolls = useMemo(() => {
    if (activeTab === 'all') return polls
    return polls.filter((poll) => poll.status === activeTab)
  }, [activeTab, polls])

  const getPollVoteCount = (poll) => {
    return (poll.poll_options || []).reduce(
      (total, option) => total + (option.votes?.length || 0),
      0
    )
  }

  const handleStatusChange = async (pollId, status) => {
    try {
      setWorkingId(pollId)
      setError('')
      setMessage('')

      await updatePollStatus(pollId, status)
      await loadPolls()

      setMessage(`Poll moved to ${status}.`)
    } catch (err) {
      setError(err.message || 'Failed to update poll status.')
    } finally {
      setWorkingId(null)
    }
  }

  const handleDeletePoll = async (poll) => {
    const confirmed = window.confirm(
      `Delete this poll permanently?\n\n"${poll.question}"\n\nThis cannot be undone.`
    )

    if (!confirmed) return

    try {
      setWorkingId(poll.id)
      setError('')
      setMessage('')

      await deletePoll(poll.id)
      await loadPolls()

      setMessage('Poll deleted successfully.')
    } catch (err) {
      setError(err.message || 'Failed to delete poll.')
    } finally {
      setWorkingId(null)
    }
  }

  const tabs = [
    { key: 'all', label: 'All Polls', count: counts.all },
    { key: 'active', label: 'Active', count: counts.active },
    { key: 'draft', label: 'Drafts', count: counts.draft },
    { key: 'closed', label: 'Closed', count: counts.closed },
  ]

  return (
    <section className="poll-card poll-manager-card">
      <div className="poll-manager-header">
        <div>
          <h3>Poll Management</h3>
          <p className="hero-text">
            Manage drafts, publish polls, close polls, reopen polls, and delete old closed polls.
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

      <div className="poll-tabs admin-filter-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={activeTab === tab.key ? 'active' : ''}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label} <span>{tab.count}</span>
          </button>
        ))}
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="auth-error">{error}</p>}
      {loading && <p className="hero-text">Loading polls...</p>}

      {!loading && !error && visiblePolls.length === 0 && (
        <div className="empty-admin-state">
          <h4>No polls found</h4>
          <p>
            {activeTab === 'all'
              ? 'Create your first poll to begin collecting opinions.'
              : `No ${activeTab} polls available right now.`}
          </p>
        </div>
      )}

      {!loading && visiblePolls.length > 0 && (
        <div className="poll-table-wrap">
          <table className="poll-table">
            <thead>
              <tr>
                <th>Poll</th>
                <th>Category</th>
                <th>Status</th>
                <th>Votes</th>
                <th>Options</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {visiblePolls.map((poll) => {
                const options = [...(poll.poll_options || [])].sort(
                  (a, b) => (a.position || 0) - (b.position || 0)
                )

                const isWorking = workingId === poll.id
                const totalVotes = getPollVoteCount(poll)

                return (
                  <tr key={poll.id}>
                    <td className="poll-title-cell">
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
                                    console.error(
                                      'FAILED ADMIN IMAGE URL:',
                                      option.image_url
                                    )
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

                    <td>
                      <strong>{totalVotes}</strong>
                    </td>

                    <td>{options.length}</td>

                    <td>{new Date(poll.created_at).toLocaleDateString()}</td>

                    <td>
                      <div className="poll-actions refined-actions">
                        {poll.status === 'draft' && (
                          <button
                            type="button"
                            className="action-btn publish"
                            onClick={() => handleStatusChange(poll.id, 'active')}
                            disabled={isWorking}
                          >
                            {isWorking ? 'Publishing...' : 'Publish'}
                          </button>
                        )}

                        {poll.status === 'active' && (
                          <button
                            type="button"
                            className="action-btn close"
                            onClick={() => handleStatusChange(poll.id, 'closed')}
                            disabled={isWorking}
                          >
                            {isWorking ? 'Closing...' : 'Close'}
                          </button>
                        )}

                        {poll.status === 'closed' && (
                          <>
                            <button
                              type="button"
                              className="action-btn reopen"
                              onClick={() =>
                                handleStatusChange(poll.id, 'active')
                              }
                              disabled={isWorking}
                            >
                              {isWorking ? 'Reopening...' : 'Reopen'}
                            </button>

                            <button
                              type="button"
                              className="action-btn delete"
                              onClick={() => handleDeletePoll(poll)}
                              disabled={isWorking}
                            >
                              {isWorking ? 'Deleting...' : 'Delete'}
                            </button>
                          </>
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
    </section>
  )
}

export default PollManager