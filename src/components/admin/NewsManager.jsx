import { useEffect, useMemo, useState } from 'react'
import {
  createNewsArticle,
  deleteNewsArticle,
  getNewsArticles,
  updateNewsArticle,
} from '../../services/contentServices'
import { uploadNewsImage } from '../../services/pollImageService'

const initialForm = {
  title: '',
  summary: '',
  content: '',
  category: '',
  image_url: '',
  status: 'draft',
}

function NewsManager() {
  const [form, setForm] = useState(initialForm)
  const [articles, setArticles] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadArticles = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getNewsArticles()
      setArticles(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load news articles.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles()
  }, [])

  const counts = useMemo(() => {
    return {
      all: articles.length,
      published: articles.filter((item) => item.status === 'published').length,
      draft: articles.filter((item) => item.status === 'draft').length,
      inactive: articles.filter((item) => item.status === 'inactive').length,
    }
  }, [articles])

  const visibleArticles = useMemo(() => {
    if (activeTab === 'all') return articles
    return articles.filter((item) => item.status === activeTab)
  }, [activeTab, articles])

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    setImageFile(null)
    setImagePreview('')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleEdit = (article) => {
    setEditingId(article.id)
    setForm({
      title: article.title || '',
      summary: article.summary || '',
      content: article.content || '',
      category: article.category || '',
      image_url: article.image_url || '',
      status: article.status || 'draft',
    })
    setImagePreview(article.image_url || '')
    setImageFile(null)

    document
      .getElementById('news-form-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      let finalImageUrl = form.image_url

      if (imageFile) {
        finalImageUrl = await uploadNewsImage(imageFile)
      }

      const payload = {
        ...form,
        image_url: finalImageUrl,
        published_at:
          form.status === 'published' ? new Date().toISOString() : null,
      }

      if (editingId) {
        await updateNewsArticle(editingId, payload)
        setMessage('News article updated successfully.')
      } else {
        await createNewsArticle(payload)
        setMessage(
          form.status === 'published'
            ? 'News article published successfully.'
            : 'News article saved as draft.'
        )
      }

      resetForm()
      await loadArticles()
    } catch (err) {
      setError(err.message || 'Failed to save news article.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (article, status) => {
    try {
      setWorkingId(article.id)
      setMessage('')
      setError('')

      await updateNewsArticle(article.id, {
        status,
        published_at:
          status === 'published'
            ? article.published_at || new Date().toISOString()
            : article.published_at,
      })

      setMessage(`Article moved to ${status}.`)
      await loadArticles()
    } catch (err) {
      setError(err.message || 'Failed to update article.')
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (article) => {
    const confirmed = window.confirm(
      `Delete this news article permanently?\n\n"${article.title}"`
    )

    if (!confirmed) return

    try {
      setWorkingId(article.id)
      setMessage('')
      setError('')

      await deleteNewsArticle(article.id)
      setMessage('News article deleted successfully.')
      await loadArticles()
    } catch (err) {
      setError(err.message || 'Failed to delete article.')
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <section className="admin-card news-manager-card" id="news-section">
      <div className="poll-manager-header">
        <div>
          <h2>News Articles</h2>
          <p>Create, draft, publish and manage homepage news stories.</p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={resetForm}>
          + New Article
        </button>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <form
        className="admin-form-grid polished-admin-form"
        id="news-form-section"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label>News Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(event) => updateField('title', event.target.value)}
            placeholder="Machakos County Planning Minister recognizes Maono Lands"
            required
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={form.category}
            onChange={(event) => updateField('category', event.target.value)}
          >
            <option value="">Select category</option>
            <option value="Politics">Politics</option>
            <option value="Economy">Economy</option>
            <option value="Sports">Sports</option>
            <option value="Business">Business</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Technology">Technology</option>
            <option value="Education">Education</option>
          </select>
        </div>

        <div className="form-group full-span">
          <label>Summary</label>
          <textarea
            value={form.summary}
            onChange={(event) => updateField('summary', event.target.value)}
            placeholder="Short summary shown on homepage..."
            rows="3"
          />
        </div>

        <div className="form-group full-span">
          <label>Featured Image</label>

          <div className="news-upload-box">
            <input type="file" accept="image/*" onChange={handleImageChange} />

            <small>
              Upload a clean image or flyer. This image will appear in the news card.
            </small>
          </div>
        </div>

        {(imagePreview || form.image_url) && (
          <div className="news-image-preview full-span">
            <img src={imagePreview || form.image_url} alt="News preview" />
            <div>
              <strong>Image Preview</strong>
              <p>This is how the article image will appear in the news card.</p>
            </div>
          </div>
        )}

        <div className="form-group full-span">
          <label>Full Content</label>
          <textarea
            value={form.content}
            onChange={(event) => updateField('content', event.target.value)}
            placeholder="Write the full article here..."
            rows="7"
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={form.status}
            onChange={(event) => updateField('status', event.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="news-live-preview">
          <span>{form.category || 'Category'}</span>
          <h4>{form.title || 'News title preview'}</h4>
          <p>{form.summary || 'Short article summary will appear here.'}</p>
        </div>

        <div className="form-actions full-span">
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Clear
          </button>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? 'Saving News...'
              : editingId
              ? 'Update Article'
              : form.status === 'published'
              ? 'Publish News'
              : 'Save Draft'}
          </button>
        </div>
      </form>

      <div className="news-management-list">
        <div className="poll-manager-header">
          <div>
            <h3>News Management</h3>
            <p className="hero-text">Manage published stories, drafts and inactive articles.</p>
          </div>
        </div>

        <div className="poll-tabs admin-filter-tabs">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'published', label: 'Published', count: counts.published },
            { key: 'draft', label: 'Drafts', count: counts.draft },
            { key: 'inactive', label: 'Inactive', count: counts.inactive },
          ].map((tab) => (
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

        {loading && <p className="hero-text">Loading news articles...</p>}

        {!loading && visibleArticles.length === 0 && (
          <div className="empty-admin-state">
            <h4>No news articles found</h4>
            <p>Create your first article or switch tabs to view other statuses.</p>
          </div>
        )}

        {!loading && visibleArticles.length > 0 && (
          <div className="news-admin-list">
            {visibleArticles.map((article) => {
              const isWorking = workingId === article.id

              return (
                <div className="news-admin-row" key={article.id}>
                  <div className="news-admin-thumb">
                    {article.image_url ? (
                      <img src={article.image_url} alt={article.title} />
                    ) : (
                      <span>{article.title?.charAt(0)}</span>
                    )}
                  </div>

                  <div className="news-admin-info">
                    <strong>{article.title}</strong>
                    <p>{article.summary || 'No summary provided.'}</p>

                    <div className="news-admin-meta">
                      <span>{article.category || 'Uncategorized'}</span>
                      <span className={`status-pill ${article.status}`}>
                        {article.status}
                      </span>
                      <span>
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="poll-actions refined-actions">
                    <button
                      type="button"
                      className="action-btn reopen"
                      onClick={() => handleEdit(article)}
                      disabled={isWorking}
                    >
                      Edit
                    </button>

                    {article.status !== 'published' && (
                      <button
                        type="button"
                        className="action-btn publish"
                        onClick={() => handleStatusChange(article, 'published')}
                        disabled={isWorking}
                      >
                        Publish
                      </button>
                    )}

                    {article.status === 'published' && (
                      <button
                        type="button"
                        className="action-btn close"
                        onClick={() => handleStatusChange(article, 'inactive')}
                        disabled={isWorking}
                      >
                        Unpublish
                      </button>
                    )}

                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => handleDelete(article)}
                      disabled={isWorking}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}

export default NewsManager