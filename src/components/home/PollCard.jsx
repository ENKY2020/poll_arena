import { useState } from 'react'
import { castVote } from '../../services/voteService'
import { trackShare } from '../../services/analyticService'
import { supabase } from '../../services/supabaseClient'

function getVotes(option) {
  return option.votes?.length || option.vote_count || option.votes_count || 0
}

function PollCard({ poll, onVoteSuccess }) {
  const [selectedOptionId, setSelectedOptionId] = useState('')
  const [loading, setLoading] = useState(false)
  const [shareLoading, setShareLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const options = [...(poll.poll_options || [])].sort((a, b) => {
    const votesA = getVotes(a)
    const votesB = getVotes(b)

    if (votesB !== votesA) return votesB - votesA
    return (a.position || 0) - (b.position || 0)
  })

  const totalVotes = options.reduce((sum, option) => sum + getVotes(option), 0)

  const getPercentage = (optionVotes) => {
    if (!totalVotes) return '0.0'
    return ((optionVotes / totalVotes) * 100).toFixed(1)
  }

  const goToLogin = () => {
    const returnTo = encodeURIComponent(
      window.location.pathname + window.location.search
    )

    window.location.href = `/login?returnTo=${returnTo}`
  }

const buildShareUrl = () => {
  if (!poll.slug) {
    return `${window.location.origin}/live-results`
  }

  return `${window.location.origin}/poll/${poll.slug}`
}

  const buildShareText = () => {
    return `Vote and view live results on Poll Arena:\n"${poll.question}"`
  }

  const saveShareAnalytics = async (platform, shareUrl) => {
    await trackShare({
      pollId: poll.id,
      platform,
      shareUrl,
    })
  }

  const handleVote = async () => {
    if (!selectedOptionId) {
      setError('Please select one option first.')
      return
    }

    try {
      setLoading(true)
      setError('')
      setMessage('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setError('Login required to vote. Redirecting you...')
        setTimeout(goToLogin, 800)
        return
      }

      await castVote({
        pollId: poll.id,
        optionId: selectedOptionId,
      })

      setMessage('Vote recorded successfully.')

      if (navigator.vibrate) {
        navigator.vibrate(50)
      }

      if (onVoteSuccess) {
        await onVoteSuccess()
      }
    } catch (err) {
      const msg = err.message || 'Failed to submit vote.'

      if (
        msg.toLowerCase().includes('logged in') ||
        msg.toLowerCase().includes('auth session') ||
        msg.toLowerCase().includes('jwt')
      ) {
        setError('Login required to vote. Redirecting you...')
        setTimeout(goToLogin, 800)
        return
      }

      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleNativeShare = async () => {
    try {
      setShareLoading(true)

      const shareUrl = buildShareUrl('native')
      const shareText = buildShareText()

      await saveShareAnalytics('native', shareUrl)

      if (navigator.share) {
        await navigator.share({
          title: poll.question,
          text: shareText,
          url: shareUrl,
        })
      } else {
        await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`)
        alert('Share link copied.')
      }
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setShareLoading(false)
    }
  }

  const handlePlatformShare = async (platform) => {
    try {
      setShareLoading(true)

      const shareUrl = buildShareUrl(platform)
      const encodedText = encodeURIComponent(buildShareText())
      const encodedUrl = encodeURIComponent(shareUrl)

      await saveShareAnalytics(platform, shareUrl)

      const links = {
        whatsapp: `https://wa.me/?text=${encodedText}%0A${encodedUrl}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
        x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      }

      window.open(links[platform], '_blank', 'noopener,noreferrer')
    } catch (err) {
      console.error('Share failed:', err)
    } finally {
      setShareLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      const shareUrl = buildShareUrl('copy_link')

      await navigator.clipboard.writeText(shareUrl)
      await saveShareAnalytics('copy_link', shareUrl)

      alert('Link copied successfully.')
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  return (
    <div className="poll-card visual-poll-card">
      <span className="poll-badge">{poll.category || 'General'}</span>

      <h3>{poll.question}</h3>

      <div className="visual-poll-options">
        {options.map((option) => {
          const optionVotes = getVotes(option)
          const percentage = getPercentage(optionVotes)
          const isSelected = selectedOptionId === option.id

          return (
            <button
              key={option.id}
              type="button"
              className={`visual-vote-option ${isSelected ? 'selected' : ''}`}
              onClick={() => {
                setSelectedOptionId(option.id)
                setError('')
                setMessage('')
              }}
              disabled={loading}
            >
              <div className="visual-vote-image">
                {option.image_url ? (
                  <img
                    src={option.image_url.trim()}
                    alt={option.option_text}
                    loading="lazy"
                  />
                ) : (
                  <span className="visual-vote-fallback">
                    {option.option_text?.charAt(0)}
                  </span>
                )}
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
        {loading ? 'Checking access...' : 'Vote Now'}
      </button>

      {message && <p className="auth-success">{message}</p>}
      {error && <p className="auth-error">{error}</p>}

      <div className="poll-share-compact">
        <button type="button" onClick={handleNativeShare} disabled={shareLoading}>
          Share
        </button>

        <button
          type="button"
          onClick={() => handlePlatformShare('whatsapp')}
          disabled={shareLoading}
        >
          WhatsApp
        </button>

        <button
          type="button"
          onClick={() => handlePlatformShare('facebook')}
          disabled={shareLoading}
        >
          Facebook
        </button>

        <button
          type="button"
          onClick={() => handlePlatformShare('x')}
          disabled={shareLoading}
        >
          X
        </button>

        <button type="button" onClick={handleCopyLink} disabled={shareLoading}>
          Copy
        </button>
      </div>
    </div>
  )
}

export default PollCard