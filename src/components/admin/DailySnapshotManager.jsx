import { useEffect, useMemo, useState } from 'react'
import {
  createDailySnapshot,
  getDailySnapshots,
  updateDailySnapshot,
  deleteDailySnapshot,
} from '../../services/contentServices'

const emptyForm = {
  title: '',
  subtitle: '',
  quote: '',
  day_name: '',
  event_date: '',
  status: 'draft',
}

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function DailySnapshotManager() {
  const [form, setForm] = useState(emptyForm)
  const [snapshots, setSnapshots] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const activeSnapshot = useMemo(
    () => snapshots.find((item) => item.status === 'active'),
    [snapshots]
  )

  const loadSnapshots = async () => {
    try {
      setLoading(true)
      const data = await getDailySnapshots()
      setSnapshots(data || [])
    } catch (err) {
      setError(err.message || 'Failed to load daily snapshots.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSnapshots()
  }, [])

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setMessage('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    const payload = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      quote: form.quote.trim(),
      day_name: form.day_name || null,
      event_date: form.event_date || null,
      status: form.status,
    }

    try {
      if (editingId) {
        await updateDailySnapshot(editingId, payload)
        setMessage('Daily snapshot updated successfully.')
      } else {
        await createDailySnapshot(payload)
        setMessage('Daily snapshot created successfully.')
      }

      resetForm()
      await loadSnapshots()
    } catch (err) {
      setError(err.message || 'Failed to save daily snapshot.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (snapshot) => {
    setEditingId(snapshot.id)
    setForm({
      title: snapshot.title || '',
      subtitle: snapshot.subtitle || '',
      quote: snapshot.quote || '',
      day_name: snapshot.day_name || '',
      event_date: snapshot.event_date || '',
      status: snapshot.status || 'draft',
    })

    document.getElementById('daily-snapshot-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  }

  const handlePublish = async (snapshot) => {
    const confirmPublish = window.confirm(
      `Publish "${snapshot.title}" as the active homepage snapshot?`
    )

    if (!confirmPublish) return

    try {
      setSaving(true)

      if (activeSnapshot && activeSnapshot.id !== snapshot.id) {
        await updateDailySnapshot(activeSnapshot.id, { status: 'inactive' })
      }

      await updateDailySnapshot(snapshot.id, { status: 'active' })
      setMessage('Snapshot published successfully.')
      await loadSnapshots()
    } catch (err) {
      setError(err.message || 'Failed to publish snapshot.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeactivate = async (snapshot) => {
    try {
      setSaving(true)
      await updateDailySnapshot(snapshot.id, { status: 'inactive' })
      setMessage('Snapshot deactivated.')
      await loadSnapshots()
    } catch (err) {
      setError(err.message || 'Failed to deactivate snapshot.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (snapshot) => {
    const confirmDelete = window.confirm(
      `Delete "${snapshot.title}" permanently? This cannot be undone.`
    )

    if (!confirmDelete) return

    try {
      setSaving(true)
      await deleteDailySnapshot(snapshot.id)
      setMessage('Snapshot deleted successfully.')
      await loadSnapshots()

      if (editingId === snapshot.id) resetForm()
    } catch (err) {
      setError(err.message || 'Failed to delete snapshot.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="admin-card" id="daily-snapshot-section">
      <div className="poll-manager-header">
        <div>
          <h2>Daily Snapshot</h2>
          <p>Create, preview, publish, unpublish, edit, or delete homepage “today” cards.</p>
        </div>

        <button type="button" className="btn btn-secondary" onClick={resetForm}>
          New Snapshot
        </button>
      </div>

      {message && <p className="success-message">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      {activeSnapshot && (
        <div className="snapshot-active-alert">
          <strong>Currently Live:</strong> {activeSnapshot.title}
          {activeSnapshot.subtitle ? ` — ${activeSnapshot.subtitle}` : ''}
        </div>
      )}

      <form className="admin-form-grid" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="Today is Sunday"
            required
          />
        </div>

        <div className="form-group">
          <label>Day Name</label>
          <select value={form.day_name} onChange={(e) => updateField('day_name', e.target.value)}>
            <option value="">Any day / use exact date</option>
            {days.map((day) => (
              <option value={day} key={day}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Exact Date</label>
          <input
            type="date"
            value={form.event_date}
            onChange={(e) => updateField('event_date', e.target.value)}
          />
          <small>Use this for holidays, campaigns, awareness days, or special messages.</small>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={(e) => updateField('status', e.target.value)}>
            <option value="draft">Draft</option>
            <option value="active">Active / Publish</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="form-group full-span">
          <label>Subtitle</label>
          <textarea
            value={form.subtitle}
            onChange={(e) => updateField('subtitle', e.target.value)}
            placeholder="International Firefighters’ Day"
            rows="2"
          />
        </div>

        <div className="form-group full-span">
          <label>Quote / Message</label>
          <textarea
            value={form.quote}
            onChange={(e) => updateField('quote', e.target.value)}
            placeholder="It is not just a matter of doing, it is a matter of being alive."
            rows="3"
          />
        </div>

        <div className="snapshot-preview full-span">
          <span>Preview</span>
          <h3>{form.title || 'Today is Sunday'}</h3>
          <p>{form.subtitle || 'International Firefighters’ Day'}</p>
          <blockquote>
            {form.quote || 'It is not just a matter of doing, it is a matter of being alive.'}
          </blockquote>
        </div>

        <div className="form-actions full-span">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : editingId ? 'Update Snapshot' : 'Save Snapshot'}
          </button>

          {editingId && (
            <button type="button" className="btn btn-secondary" onClick={resetForm}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="snapshot-library">
        <h3>Snapshot Library</h3>

        {loading ? (
          <p>Loading snapshots...</p>
        ) : snapshots.length === 0 ? (
          <p>No snapshots created yet.</p>
        ) : (
          <div className="snapshot-list">
            {snapshots.map((snapshot) => (
              <article className="snapshot-row" key={snapshot.id}>
                <div>
                  <span className={`status-pill ${snapshot.status}`}>{snapshot.status}</span>
                  <h4>{snapshot.title}</h4>
                  <p>{snapshot.subtitle}</p>
                  {snapshot.event_date && <small>Date: {snapshot.event_date}</small>}
                  {snapshot.day_name && <small> Day: {snapshot.day_name}</small>}
                </div>

                <div className="snapshot-actions">
                  <button type="button" className="btn btn-secondary" onClick={() => handleEdit(snapshot)}>
                    Edit
                  </button>

                  {snapshot.status === 'active' ? (
                    <button type="button" className="btn btn-ghost" onClick={() => handleDeactivate(snapshot)}>
                      Unpublish
                    </button>
                  ) : (
                    <button type="button" className="btn btn-primary" onClick={() => handlePublish(snapshot)}>
                      Publish
                    </button>
                  )}

                  <button type="button" className="btn btn-danger" onClick={() => handleDelete(snapshot)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default DailySnapshotManager