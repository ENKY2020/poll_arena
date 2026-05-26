import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  getActiveSponsorAds,
  getPublishedNewsArticles,
} from '../services/contentServices'
import { supabase } from '../services/supabaseClient'
import '../styles/news.css'

function NewsCenter() {
  const navigate = useNavigate()

  const [articles, setArticles] = useState([])
  const [sponsorAds, setSponsorAds] = useState([])
  const [polls, setPolls] = useState([])
  const [votes, setVotes] = useState([])
  const [selectedArticle, setSelectedArticle] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeView, setActiveView] = useState('news')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadNewsCenter()
  }, [])

  const goToLogin = () => {
    const returnTo = encodeURIComponent(window.location.pathname + window.location.search)
    window.location.href = `/login?returnTo=${returnTo}`
  }

  const requireLoginForAction = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      alert('Please login first to share or open Poll Arena actions.')
      goToLogin()
      return false
    }

    return true
  }

  const loadNewsCenter = async () => {
    try {
      setLoading(true)
      setError('')

      const [newsData, adsData, pollsResult, votesResult] = await Promise.all([
        getPublishedNewsArticles(),
        getActiveSponsorAds(),
        supabase.from('polls').select('*').order('created_at', { ascending: false }),
        supabase.from('votes').select('*'),
      ])

      if (pollsResult.error) throw pollsResult.error

      setArticles(newsData || [])
      setSponsorAds(
        (adsData || []).filter((ad) =>
          ['both', 'news_center', 'homepage_banner'].includes(ad.placement)
        )
      )
      setPolls(pollsResult.data || [])
      setVotes(votesResult.error ? [] : votesResult.data || [])
      setSelectedArticle(newsData?.[0] || null)
    } catch (err) {
      setError(err.message || 'Failed to load News Center.')
    } finally {
      setLoading(false)
    }
  }

  const getPollTitle = (poll) =>
    poll.question || poll.title || poll.poll_title || 'Untitled Poll'

  const getPollStatus = (poll) =>
    (poll.status || (poll.is_active ? 'active' : 'draft') || 'draft').toLowerCase()

  const getPollCategory = (poll) =>
    poll.category || poll.category_name || 'uncategorized'

  const getVotesFromOptions = (poll) => {
    const options = poll.options || poll.choices || poll.results || []
    if (!Array.isArray(options)) return 0

    return options.reduce((sum, option) => {
      return sum + Number(option.votes || option.vote_count || option.count || 0)
    }, 0)
  }

  const getPollVotes = (poll) => {
    const directVotes =
      poll.total_votes ??
      poll.vote_count ??
      poll.votes_count ??
      poll.totalVotes

    if (directVotes !== undefined && directVotes !== null) {
      return Number(directVotes) || 0
    }

    const voteRows = votes.filter(
      (vote) =>
        vote.poll_id === poll.id ||
        vote.pollId === poll.id ||
        vote.poll === poll.id
    )

    if (voteRows.length > 0) return voteRows.length

    return getVotesFromOptions(poll)
  }

  const intelligence = useMemo(() => {
    const totalPolls = polls.length
    const totalVotes = polls.reduce((sum, poll) => sum + getPollVotes(poll), 0)
    const activePolls = polls.filter((poll) => getPollStatus(poll) === 'active')

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

    const platformPulse =
      totalVotes >= 100
        ? 'High public activity'
        : totalVotes >= 40
        ? 'Growing public activity'
        : totalVotes > 0
        ? 'Early public activity'
        : 'Waiting for public votes'

    return {
      totalPolls,
      totalVotes,
      activePolls: activePolls.length,
      categories,
      strongestCategory: categories[0],
      mostVotedPoll,
      platformPulse,
    }
  }, [polls, votes])

  const categories = useMemo(() => {
    const unique = articles.map((article) => article.category).filter(Boolean)
    return ['All', 'Sponsored', ...new Set(unique)]
  }, [articles])

  const sponsoredArticles = useMemo(() => {
    return articles.filter((article) => {
      const category = article.category?.toLowerCase() || ''
      return (
        article.is_sponsored === true ||
        article.sponsor_name ||
        category.includes('sponsor') ||
        category.includes('real estate')
      )
    })
  }, [articles])

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'All') return articles
    if (activeCategory === 'Sponsored') return sponsoredArticles
    return articles.filter((article) => article.category === activeCategory)
  }, [articles, activeCategory, sponsoredArticles])

  const featuredSponsor = sponsorAds[0]

  const getCurrentUrl = () => window.location.href

  const handleNativeShare = async () => {
    if (!selectedArticle) return

    const canContinue = await requireLoginForAction()
    if (!canContinue) return

    const shareText = `${selectedArticle.title}\n\n${selectedArticle.summary || ''}`

    try {
      if (navigator.share) {
        await navigator.share({
          title: selectedArticle.title,
          text: shareText,
          url: getCurrentUrl(),
        })
        return
      }

      await navigator.clipboard.writeText(`${shareText}\n${getCurrentUrl()}`)
      alert('Story link copied.')
    } catch (err) {
      console.error('Share failed:', err)
    }
  }

  const handleCopyLink = async () => {
    const canContinue = await requireLoginForAction()
    if (!canContinue) return

    try {
      await navigator.clipboard.writeText(getCurrentUrl())
      alert('Link copied.')
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const openShareLink = async (platform) => {
    if (!selectedArticle) return

    const canContinue = await requireLoginForAction()
    if (!canContinue) return

    const url = encodeURIComponent(getCurrentUrl())
    const title = encodeURIComponent(selectedArticle.title)
    const text = encodeURIComponent(selectedArticle.summary || selectedArticle.title)

    const links = {
      whatsapp: `https://wa.me/?text=${title}%0A${text}%0A${url}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      x: `https://twitter.com/intent/tweet?text=${title}&url=${url}`,
    }

    window.open(links[platform], '_blank', 'noopener,noreferrer')
  }

  const handleSponsorClick = async (ad) => {
    const canContinue = await requireLoginForAction()
    if (!canContinue) return

    const target = ad.cta_url || ad.website_url || '/news'

    if (target.startsWith('http')) {
      window.open(target, '_blank', 'noopener,noreferrer')
      return
    }

    navigate(target)
  }

  const handleLatestIntelligence = () => {
    setActiveView('intelligence')
    setActiveCategory('All')
  }

  const handleSponsorStories = () => {
    setActiveView('news')
    setActiveCategory('Sponsored')
    setSelectedArticle(sponsoredArticles[0] || articles[0] || null)
  }

  if (loading) {
    return (
      <section className="news-page">
        <div className="news-center-empty">Loading News Center...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="news-page">
        <div className="news-center-empty">{error}</div>
      </section>
    )
  }

  return (
    <section className="news-page">
      <div className="news-header news-hero-upgraded">
        <div>
          <span>Poll Arena Intelligence Desk</span>
          <h1>News Center</h1>
          <p>
            Follow poll updates, sponsor stories, public opinion insights,
            market signals, political trends and strategic announcements.
          </p>

          <div className="news-hero-actions">
            <button
              type="button"
              className={activeView === 'intelligence' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={handleLatestIntelligence}
            >
              Latest Intelligence
            </button>

            <button
              type="button"
              className={activeCategory === 'Sponsored' ? 'btn btn-primary' : 'btn btn-secondary'}
              onClick={handleSponsorStories}
            >
              Sponsor Stories
            </button>
          </div>
        </div>

        <div className="news-hero-mini">
          <strong>{articles.length}</strong>
          <span>Published stories</span>
          <strong>{sponsorAds.length}</strong>
          <span>Active sponsor slots</span>
        </div>
      </div>

      {activeView === 'news' && featuredSponsor && (
        <div className="news-sponsored-strip">
          <div className="news-sponsored-copy">
            <span>Sponsored Feature</span>
            <h2>{featuredSponsor.title}</h2>
            <p>{featuredSponsor.description}</p>
          </div>

          {featuredSponsor.image_url && (
            <img src={featuredSponsor.image_url} alt={featuredSponsor.title} />
          )}

          <div className="news-sponsored-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleSponsorClick(featuredSponsor)}
            >
              {featuredSponsor.cta_text || 'Explore Story'}
            </button>

            <button type="button" className="btn btn-secondary" onClick={handleCopyLink}>
              Share
            </button>
          </div>
        </div>
      )}

      <div className="news-layout news-layout-upgraded">
        <aside className="news-list-panel">
          {activeView === 'intelligence' ? (
            <div className="news-tabs">
              <button type="button" className="active">Public Intelligence</button>
              <button type="button" onClick={() => setActiveView('news')}>Back to News</button>
            </div>
          ) : (
            <div className="news-tabs">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  className={activeCategory === category ? 'active' : ''}
                  onClick={() => {
                    setActiveView('news')
                    setActiveCategory(category)

                    const firstMatch =
                      category === 'All'
                        ? articles[0]
                        : category === 'Sponsored'
                        ? sponsoredArticles[0]
                        : articles.find((article) => article.category === category)

                    setSelectedArticle(firstMatch || null)
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {activeView === 'intelligence' ? (
            <div className="news-list">
              <div className="news-center-empty">
                Latest Intelligence is automatically generated from live poll activity,
                vote totals, category strength and platform pulse.
              </div>
            </div>
          ) : (
            <>
              {filteredArticles.length === 0 && (
                <div className="news-center-empty">
                  No published stories in this category yet.
                </div>
              )}

              <div className="news-list">
                {filteredArticles.map((article) => (
                  <button
                    key={article.id}
                    type="button"
                    className={`news-list-item ${
                      selectedArticle?.id === article.id ? 'active' : ''
                    }`}
                    onClick={() => setSelectedArticle(article)}
                  >
                    <div className="news-list-thumb">
                      {article.image_url ? (
                        <img src={article.image_url} alt={article.title} />
                      ) : (
                        <span>{article.title?.charAt(0)}</span>
                      )}
                    </div>

                    <div>
                      <span>
                        {article.is_sponsored || article.sponsor_name
                          ? 'Sponsored'
                          : article.category || 'News'}
                      </span>
                      <h3>{article.title}</h3>
                      <p>{article.summary}</p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </aside>

        <article className="news-detail-panel">
          {activeView === 'intelligence' ? (
            <LatestIntelligenceDashboard
              intelligence={intelligence}
              getPollTitle={getPollTitle}
              getPollVotes={getPollVotes}
            />
          ) : selectedArticle ? (
            <>
              <div className="news-detail-image">
                {selectedArticle.image_url ? (
                  <img src={selectedArticle.image_url} alt={selectedArticle.title} />
                ) : (
                  <div className="news-placeholder">Poll Arena</div>
                )}
              </div>

              <div className="news-detail-content">
                <div className="news-detail-meta">
                  <span>
                    {selectedArticle.is_sponsored || selectedArticle.sponsor_name
                      ? 'Sponsored Story'
                      : selectedArticle.category || 'News'}
                  </span>

                  <small>
                    {selectedArticle.published_at
                      ? new Date(selectedArticle.published_at).toLocaleDateString()
                      : 'Recently published'}
                  </small>
                </div>

                <h2>{selectedArticle.title}</h2>

                {selectedArticle.summary && (
                  <p className="news-summary">{selectedArticle.summary}</p>
                )}

                <div className="news-body">
                  {(selectedArticle.content || '')
                    .split('\n')
                    .map((paragraph, index) =>
                      paragraph.trim() ? <p key={index}>{paragraph}</p> : null
                    )}
                </div>

                <div className="news-action-row">
                  <button type="button" className="btn btn-primary" onClick={handleNativeShare}>
                    Share Story
                  </button>

                  <button type="button" className="btn btn-secondary" onClick={() => openShareLink('whatsapp')}>
                    WhatsApp
                  </button>

                  <button type="button" className="btn btn-secondary" onClick={() => openShareLink('facebook')}>
                    Facebook
                  </button>

                  <button type="button" className="btn btn-secondary" onClick={() => openShareLink('x')}>
                    X
                  </button>

                  <button type="button" className="btn btn-secondary" onClick={handleCopyLink}>
                    Copy Link
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="news-center-empty">Select a story to read.</div>
          )}
        </article>

        <aside className="news-sponsor-panel">
          <h3>Sponsored Opportunities</h3>
          <p>Partner features, business stories and promoted updates.</p>

          {sponsorAds.length === 0 && (
            <div className="news-center-empty">No active sponsor ads yet.</div>
          )}

          {sponsorAds.slice(0, 3).map((ad) => (
            <div className="news-sponsor-card" key={ad.id}>
              {ad.image_url && <img src={ad.image_url} alt={ad.title} />}
              <span>Sponsored</span>
              <h4>{ad.title}</h4>
              <p>{ad.description}</p>

              <button
                type="button"
                className="btn btn-primary"
                onClick={() => handleSponsorClick(ad)}
              >
                {ad.cta_text || 'Explore Story'}
              </button>
            </div>
          ))}
        </aside>
      </div>
    </section>
  )
}

function LatestIntelligenceDashboard({ intelligence, getPollTitle, getPollVotes }) {
  const topPoll = intelligence.mostVotedPoll

  return (
    <div className="latest-intelligence-dashboard">
      <div className="news-detail-meta">
        <span>Latest Intelligence</span>
        <small>Auto-generated from live platform activity</small>
      </div>

      <h2>Public Opinion Pulse</h2>
      <p className="news-summary">
        A live snapshot of what Poll Arena users are voting on, which categories
        are gaining attention, and where public interest is moving.
      </p>

      <div className="intelligence-public-grid">
        <div className="intelligence-public-card">
          <span>Platform Pulse</span>
          <strong>{intelligence.platformPulse}</strong>
          <p>
            {intelligence.totalVotes} votes recorded across {intelligence.totalPolls} polls.
          </p>
        </div>

        <div className="intelligence-public-card">
          <span>Trending Category</span>
          <strong>{intelligence.strongestCategory?.category || 'Not enough data'}</strong>
          <p>
            {intelligence.strongestCategory
              ? `${intelligence.strongestCategory.votes} votes are currently concentrated here.`
              : 'More voting activity is needed to identify a trend.'}
          </p>
        </div>

        <div className="intelligence-public-card">
          <span>Most Voted Poll</span>
          <strong>{topPoll ? getPollTitle(topPoll) : 'No leading poll yet'}</strong>
          <p>
            {topPoll
              ? `${getPollVotes(topPoll)} people have voted on this poll.`
              : 'Published polls will appear here once votes come in.'}
          </p>
        </div>

        <div className="intelligence-public-card">
          <span>Active Polls</span>
          <strong>{intelligence.activePolls}</strong>
          <p>These are the polls currently open for public participation.</p>
        </div>
      </div>

      <div className="intelligence-category-panel">
        <h3>Category Strength</h3>

        {intelligence.categories.length === 0 && (
          <p className="news-summary">No category activity has been recorded yet.</p>
        )}

        {intelligence.categories.map((item) => (
          <div className="intelligence-category-row" key={item.category}>
            <div>
              <strong>{item.category}</strong>
              <small>{item.polls} polls • {item.votes} votes</small>
            </div>

            <div className="intelligence-track">
              <div
                style={{
                  width: `${
                    intelligence.totalVotes > 0
                      ? Math.min((item.votes / intelligence.totalVotes) * 100, 100)
                      : 0
                  }%`,
                }}
              />
            </div>

            <strong>{item.votes}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewsCenter