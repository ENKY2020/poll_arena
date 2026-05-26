import { useEffect, useMemo, useState } from 'react'
import {
  createSponsorAd,
  deleteSponsorAd,
  getSponsorAds,
  updateSponsorAd,
} from '../../services/contentServices'
import { uploadAdImage } from '../../services/pollImageService'

const initialForm = {
  sponsor_name: '',
  title: '',
  description: '',
  image_url: '',
  cta_text: 'Explore Story',
  cta_url: '/news',
  cta_phone: '',
  placement: 'both',
  status: 'draft',
  start_date: '',
  end_date: '',
}

function AdManager() {
  const [form, setForm] = useState(initialForm)
  const [ads, setAds] = useState([])
  const [activeTab, setActiveTab] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAds = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getSponsorAds()
      setAds(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load sponsor ads.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAds()
  }, [])

  const counts = useMemo(() => ({
    all: ads.length,
    active: ads.filter((ad) => ad.status === 'active').length,
    draft: ads.filter((ad) => ad.status === 'draft').length,
    inactive: ads.filter((ad) => ad.status === 'inactive').length,
  }), [ads])

  const visibleAds = useMemo(() => {
    if (activeTab === 'all') return ads
    return ads.filter((ad) => ad.status === activeTab)
  }, [ads, activeTab])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(initialForm)
    setEditingId(null)
    setImageFile(null)
    setImagePreview('')
    setMessage('')
    setError('')
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleEdit = (ad) => {
    setEditingId(ad.id)
    setForm({
      sponsor_name: ad.sponsor_name || '',
      title: ad.title || '',
      description: ad.description || '',
      image_url: ad.image_url || '',
      cta_text: ad.cta_text || 'Explore Story',
      cta_url: ad.cta_url || '/news',
      cta_phone: ad.cta_phone || '',
      placement: ad.placement || 'both',
      status: ad.status || 'draft',
      start_date: ad.start_date || '',
      end_date: ad.end_date || '',
    })
    setImagePreview(ad.image_url || '')
    setImageFile(null)

    document
      .getElementById('ads-form-section')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const buildPayload = async () => {
    let finalImageUrl = form.image_url

    if (imageFile) {
      finalImageUrl = await uploadAdImage(imageFile)
    }

    return {
      sponsor_name: form.sponsor_name.trim(),
      title: form.title.trim(),
      description: form.description.trim(),
      image_url: finalImageUrl || null,
      cta_text: form.cta_text.trim() || 'Explore Story',
      cta_url: form.cta_url.trim() || '/news',
      cta_phone: form.cta_phone.trim() || null,
      placement: form.placement || 'both',
      status: form.status || 'draft',
      start_date: form.start_date || null,
      end_date: form.end_date || null,
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const payload = await buildPayload()

      if (editingId) {
        await updateSponsorAd(editingId, payload)
        setMessage('Sponsor ad updated successfully.')
      } else {
        await createSponsorAd(payload)
        setMessage('Sponsor ad saved successfully.')
      }

      resetForm()
      await loadAds()
    } catch (err) {
      setError(err.message || 'Failed to save sponsor ad.')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (ad, status) => {
    try {
      setWorkingId(ad.id)
      setMessage('')
      setError('')

      await updateSponsorAd(ad.id, { status })
      setMessage(
        status === 'active'
          ? 'Sponsor ad published successfully.'
          : status === 'inactive'
          ? 'Sponsor ad paused successfully.'
          : 'Sponsor ad moved to draft.'
      )

      await loadAds()
    } catch (err) {
      setError(err.message || 'Failed to update sponsor ad.')
    } finally {
      setWorkingId(null)
    }
  }

  const handleDelete = async (ad) => {
    const confirmed = window.confirm(
      `Delete this sponsor ad permanently?\n\n"${ad.title}"`
    )

    if (!confirmed) return

    try {
      setWorkingId(ad.id)
      setMessage('')
      setError('')

      await deleteSponsorAd(ad.id)
      setMessage('Sponsor ad deleted successfully.')
      await loadAds()
    } catch (err) {
      setError(err.message || 'Failed to delete sponsor ad.')
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <section className="admin-card ad-manager-card" id="ads-section">
      <div className="poll-manager-header">
        <div>
          <h2>Ads & Sponsors</h2>
          <p>Create, schedule, publish and manage sponsor placements.</p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={resetForm}>
          + New Ad
        </button>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <form
        className="admin-form-grid polished-admin-form"
        id="ads-form-section"
        onSubmit={handleSubmit}
      >
        <div className="form-group">
          <label>Sponsor Name</label>
          <input
            type="text"
            value={form.sponsor_name}
            onChange={(e) => updateField('sponsor_name', e.target.value)}
            placeholder="Maono Lands Limited"
            required
          />
        </div>

        <div className="form-group">
          <label>Ad Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Maono Village Joska"
            required
          />
        </div>

        <div className="form-group full-span">
          <label>Description</label>
          <textarea
            value={form.description}
            onChange={(e) => updateField('description', e.target.value)}
            placeholder="Short sponsor message shown on Home..."
            rows="4"
          />
        </div>

        <div className="form-group full-span">
          <label>Ad Image</label>
          <div className="news-upload-box">
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <small>Upload a sponsor flyer/banner for the Home ad card.</small>
          </div>
        </div>

        {(imagePreview || form.image_url) && (
          <div className="news-image-preview full-span">
            <img src={imagePreview || form.image_url} alt="Ad preview" />
            <div>
              <strong>Ad Image Preview</strong>
              <p>This is how the sponsor image will appear in the ad card.</p>
            </div>
          </div>
        )}

        <div className="form-group">
          <label>CTA Text</label>
          <input
            type="text"
            value={form.cta_text}
            onChange={(e) => updateField('cta_text', e.target.value)}
            placeholder="Explore Story"
          />
        </div>

        <div className="form-group">
          <label>CTA Link</label>
          <input
            type="text"
            value={form.cta_url}
            onChange={(e) => updateField('cta_url', e.target.value)}
            placeholder="/news or https://www.maonolands.com"
          />
          <small>Leave as /news to send users to News Center.</small>
        </div>

        <div className="form-group">
          <label>CTA Phone</label>
          <input
            type="text"
            value={form.cta_phone}
            onChange={(e) => updateField('cta_phone', e.target.value)}
            placeholder="0701828282"
          />
        </div>

        <div className="form-group">
          <label>Placement</label>
          <select value={form.placement} onChange={(e) => updateField('placement', e.target.value)}>
            <option value="both">Both Home Banner & Sidebar</option>
            <option value="homepage_banner">Homepage Banner</option>
            <option value="homepage_sidebar">Homepage Sidebar</option>
            <option value="news_center">News Center</option>
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Published / Active</option>
            <option value="inactive">Paused / Inactive</option>
          </select>
        </div>

        <div className="form-group">
          <label>Start Date</label>
          <input
            type="date"
            value={form.start_date}
            onChange={(e) => updateField('start_date', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={form.end_date}
            onChange={(e) => updateField('end_date', e.target.value)}
          />
        </div>

        <div className="news-live-preview full-span">
          <span>Sponsored</span>
          <h4>{form.title || 'Ad preview title'}</h4>
          <p>{form.description || 'Sponsor ad preview will appear here.'}</p>
          <small>{form.cta_text || 'Explore Story'} → {form.cta_url || '/news'}</small>
        </div>

        <div className="form-actions full-span">
          <button type="button" className="btn btn-secondary" onClick={resetForm}>
            Clear
          </button>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving
              ? 'Saving Ad...'
              : editingId
              ? 'Update Sponsor Ad'
              : 'Save Sponsor Ad'}
          </button>
        </div>
      </form>

      <div className="news-management-list">
        <div className="poll-manager-header">
          <div>
            <h3>Ads Management</h3>
            <p className="hero-text">Manage published ads, drafts, paused ads and sponsor schedules.</p>
          </div>
        </div>

        <div className="poll-tabs admin-filter-tabs">
          {[
            { key: 'all', label: 'All', count: counts.all },
            { key: 'active', label: 'Published', count: counts.active },
            { key: 'draft', label: 'Drafts', count: counts.draft },
            { key: 'inactive', label: 'Paused', count: counts.inactive },
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

        {loading && <p className="hero-text">Loading sponsor ads...</p>}

        {!loading && visibleAds.length === 0 && (
          <div className="empty-admin-state">
            <h4>No sponsor ads found</h4>
            <p>Create your first sponsor ad or switch tabs to view other statuses.</p>
          </div>
        )}

        {!loading && visibleAds.length > 0 && (
          <div className="news-admin-list">
            {visibleAds.map((ad) => {
              const isWorking = workingId === ad.id

              return (
                <div className="news-admin-row" key={ad.id}>
                  <div className="news-admin-thumb">
                    {ad.image_url ? (
                      <img src={ad.image_url} alt={ad.title} />
                    ) : (
                      <span>{ad.title?.charAt(0) || 'A'}</span>
                    )}
                  </div>

                  <div className="news-admin-info">
                    <strong>{ad.title}</strong>
                    <p>{ad.description || 'No description provided.'}</p>

                    <div className="news-admin-meta">
                      <span>{ad.sponsor_name || 'Sponsor'}</span>
                      <span>{ad.placement || 'both'}</span>
                      <span className={`status-pill ${ad.status || 'draft'}`}>
                        {ad.status || 'draft'}
                      </span>
                      <span>{ad.start_date || 'No start'} → {ad.end_date || 'No end'}</span>
                    </div>
                  </div>

                  <div className="poll-actions refined-actions">
                    <button
                      type="button"
                      className="action-btn reopen"
                      onClick={() => handleEdit(ad)}
                      disabled={isWorking}
                    >
                      Edit
                    </button>

                    {ad.status !== 'active' && (
                      <button
                        type="button"
                        className="action-btn publish"
                        onClick={() => handleStatusChange(ad, 'active')}
                        disabled={isWorking}
                      >
                        Publish
                      </button>
                    )}

                    {ad.status === 'active' && (
                      <button
                        type="button"
                        className="action-btn close"
                        onClick={() => handleStatusChange(ad, 'inactive')}
                        disabled={isWorking}
                      >
                        Pause
                      </button>
                    )}

                    {ad.status !== 'draft' && (
                      <button
                        type="button"
                        className="action-btn draft"
                        onClick={() => handleStatusChange(ad, 'draft')}
                        disabled={isWorking}
                      >
                        Draft
                      </button>
                    )}

                    <button
                      type="button"
                      className="action-btn delete"
                      onClick={() => handleDelete(ad)}
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

export default AdManager