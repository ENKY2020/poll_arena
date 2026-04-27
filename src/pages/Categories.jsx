import { useEffect, useState } from 'react'
import { getActivePolls } from '../services/pollService'

const categories = [
  {
    key: 'politics',
    label: 'Politics',
    description: 'Election sentiment, leadership, parties and public trust.',
  },
  {
    key: 'governance',
    label: 'Governance',
    description: 'Service delivery, accountability, corruption and reforms.',
  },
  {
    key: 'economics',
    label: 'Economics',
    description: 'Cost of living, jobs, taxes, business and market outlook.',
  },
  {
    key: 'sports',
    label: 'Sports',
    description: 'Teams, players, tournaments and fan opinion.',
  },
  {
    key: 'education-innovation',
    label: 'Education & Innovation',
    description: 'Learning, technology, phones, schools and future skills.',
  },
  {
    key: 'entertainment',
    label: 'Entertainment',
    description: 'Artists, music, shows, creators and pop culture.',
  },
]

function Categories() {
  const [polls, setPolls] = useState([])
  const [activeCategory, setActiveCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadCategories() {
      try {
        setError('')
        const data = await getActivePolls()
        setPolls(data)
      } catch (err) {
        setError(err.message || 'Failed to load categories.')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

  const filteredPolls =
    activeCategory === 'all'
      ? polls
      : polls.filter((poll) => poll.category === activeCategory)

  const getCategoryCount = (categoryKey) =>
    polls.filter((poll) => poll.category === categoryKey).length

  return (
    <section className="poll-section">
      <div className="section-header">
        <h2>Categories</h2>
        <span>Browse live polls by topic</span>
      </div>

      {error && (
        <div className="poll-card">
          <p className="auth-error">{error}</p>
        </div>
      )}

      <div className="category-filter-row">
        <button
          type="button"
          className={activeCategory === 'all' ? 'active' : ''}
          onClick={() => setActiveCategory('all')}
        >
          All Polls
          <span>{polls.length}</span>
        </button>

        {categories.map((category) => (
          <button
            type="button"
            key={category.key}
            className={activeCategory === category.key ? 'active' : ''}
            onClick={() => setActiveCategory(category.key)}
          >
            {category.label}
            <span>{getCategoryCount(category.key)}</span>
          </button>
        ))}
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <button
            type="button"
            key={category.key}
            className="poll-card category-card"
            onClick={() => setActiveCategory(category.key)}
          >
            <div>
              <span className="poll-badge">{getCategoryCount(category.key)} live</span>
              <h3>{category.label}</h3>
              <p className="hero-text">{category.description}</p>
            </div>
          </button>
        ))}
      </div>

      <div className="section-header category-results-header">
        <h2>
          {activeCategory === 'all'
            ? 'All Live Polls'
            : categories.find((category) => category.key === activeCategory)?.label}
        </h2>
        <span>{filteredPolls.length} polls found</span>
      </div>

      {loading && (
        <div className="poll-card">
          <p className="hero-text">Loading category polls...</p>
        </div>
      )}

      {!loading && !error && filteredPolls.length === 0 && (
        <div className="poll-card">
          <h3>No polls in this category yet</h3>
          <p className="hero-text">
            Publish a poll in this category from the admin panel.
          </p>
        </div>
      )}

      {!loading && !error && filteredPolls.length > 0 && (
        <div className="category-poll-list">
          {filteredPolls.map((poll) => {
            const options = [...(poll.poll_options || [])].sort(
              (a, b) => a.position - b.position
            )

            const pollTotalVotes = options.reduce(
              (sum, option) => sum + (option.votes?.length || 0),
              0
            )

            return (
              <div className="poll-card category-poll-card" key={poll.id}>
                <div>
                  <span className="poll-badge">{poll.category}</span>
                  <h3>{poll.question}</h3>
                  <p className="hero-text">{pollTotalVotes} total votes</p>
                </div>

                <div className="category-option-faces">
                  {options.slice(0, 5).map((option) => (
                    <div className="category-face" key={option.id}>
                      {option.image_url ? (
                        <img src={option.image_url} alt={option.option_text} />
                      ) : (
                        <span>{option.option_text?.charAt(0)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

export default Categories