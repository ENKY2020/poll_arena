import { useState } from 'react'
import { createPoll } from '../../services/pollService'
import { uploadPollOptionImage } from '../../services/pollImageService'

function CreatePollForm() {
  const [question, setQuestion] = useState('')
  const [options, setOptions] = useState([
    { text: '', imageFile: null, preview: '', image_url: '' },
    { text: '', imageFile: null, preview: '', image_url: '' },
  ])
  const [category, setCategory] = useState('politics')
  const [status, setStatus] = useState('draft')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const addOption = () => {
    setOptions([
      ...options,
      { text: '', imageFile: null, preview: '', image_url: '' },
    ])
  }

  const removeOption = (indexToRemove) => {
    if (options.length <= 2) return
    setOptions(options.filter((_, index) => index !== indexToRemove))
  }

  const updateOptionText = (indexToUpdate, value) => {
    setOptions(
      options.map((option, index) =>
        index === indexToUpdate ? { ...option, text: value } : option
      )
    )
  }

  const updateOptionImage = (indexToUpdate, file) => {
    setOptions(
      options.map((option, index) =>
        index === indexToUpdate
          ? {
              ...option,
              imageFile: file,
              preview: file ? URL.createObjectURL(file) : '',
            }
          : option
      )
    )
  }

  const resetForm = () => {
    setQuestion('')
    setOptions([
      { text: '', imageFile: null, preview: '', image_url: '' },
      { text: '', imageFile: null, preview: '', image_url: '' },
    ])
    setCategory('politics')
    setStatus('draft')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setMessage('')
    setError('')

    try {
      const optionsWithImages = await Promise.all(
        options.map(async (option) => {
          let imageUrl = option.image_url || ''

          if (option.imageFile) {
            imageUrl = await uploadPollOptionImage(option.imageFile)
          }

          return {
            text: option.text,
            image_url: imageUrl,
          }
        })
      )

      await createPoll({
        question,
        options: optionsWithImages,
        category,
        status,
      })

      setMessage('Poll created successfully.')
      resetForm()
    } catch (err) {
      setError(err.message || 'Failed to create poll.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="poll-card">
      <h3>Create New Poll</h3>
      <p className="hero-text">
        Create a poll question, add options, upload images, choose a category,
        then save or publish.
      </p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Poll Question</label>
          <input
            type="text"
            placeholder="Who do you prefer as president in 2027?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Poll Options</label>

          {options.map((option, index) => (
            <div className="poll-option-editor" key={index}>
              <div className="poll-option-image-box">
                {option.preview ? (
                  <img src={option.preview} alt={`Option ${index + 1}`} />
                ) : (
                  <span>No Image</span>
                )}
              </div>

              <div className="poll-option-fields">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option.text}
                  onChange={(e) => updateOptionText(index, e.target.value)}
                  required={index < 2}
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateOptionImage(index, e.target.files?.[0] || null)
                  }
                  disabled={loading}
                />
              </div>

              {options.length > 2 && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => removeOption(index)}
                  disabled={loading}
                >
                  Remove
                </button>
              )}
            </div>
          ))}

          <button
            type="button"
            className="btn btn-secondary full"
            onClick={addOption}
            disabled={loading}
          >
            + Add Option
          </button>
        </div>

        <div className="form-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            <option value="governance">Governance</option>
            <option value="economics">Economics</option>
            <option value="sports">Sports</option>
            <option value="politics">Politics</option>
            <option value="education-innovation">Education & Innovation</option>
            <option value="entertainment">Entertainment</option>
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
          >
            <option value="draft">Save as Draft</option>
            <option value="active">Publish Now</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary full" disabled={loading}>
          {loading ? 'Creating Poll...' : 'Create Poll'}
        </button>
      </form>

      {message && <p className="auth-success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}
    </div>
  )
}

export default CreatePollForm