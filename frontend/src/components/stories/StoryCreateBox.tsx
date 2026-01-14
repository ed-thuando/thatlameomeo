import { useState, FormEvent } from 'react'
import { apiPost, ApiException } from '../../services/api'
import { updateUserScore } from '../../hooks/useUserScoreUpdate'
import { useAuth } from '../../hooks/useAuth'

interface StoryCreateBoxProps {
  onStoryCreated?: () => void
}

interface CreateStoryRequest {
  content: string
  visibility: 'public' | 'private'
}

interface CreateStoryResponse {
  id: number
  user_id: number
  content: string
  visibility: string
  created_at: string
  meomeo_score: number
}

const MAX_CONTENT_LENGTH = 5000

function StoryCreateBox({ onStoryCreated }: StoryCreateBoxProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    // Validation
    if (!content.trim()) {
      setError('Content is required and cannot be empty')
      return
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      setError(`Content must be ${MAX_CONTENT_LENGTH} characters or less`)
      return
    }

    setIsLoading(true)

    try {
      const request: CreateStoryRequest = {
        content: content.trim(),
        visibility,
      }

      const response = await apiPost<CreateStoryResponse & { daily_meomeo_score?: number; updated_user_id?: number }>('/stories', request)

      // Update user score immediately if available
      if (response?.updated_user_id && response?.daily_meomeo_score !== undefined) {
        updateUserScore(response.updated_user_id, response.daily_meomeo_score)
      } else if (user?.id && response?.daily_meomeo_score !== undefined) {
        updateUserScore(user.id, response.daily_meomeo_score)
      }

      // Success
      setContent('')
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      if (onStoryCreated) {
        onStoryCreated()
      }
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to create story. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: '#000000',
        border: '0.5px solid #1a1a1a',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <form onSubmit={handleSubmit}>
        {error && (
          <div
            style={{
              color: '#ff4444',
              fontSize: '14px',
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: 'rgba(255, 68, 68, 0.1)',
              borderRadius: '8px',
            }}
          >
            {error}
          </div>
        )}
        {success && (
          <div
            style={{
              color: '#4caf50',
              fontSize: '14px',
              marginBottom: '12px',
              padding: '8px',
              backgroundColor: 'rgba(76, 175, 80, 0.1)',
              borderRadius: '8px',
            }}
          >
            Story created successfully!
          </div>
        )}
        <div style={{ marginBottom: '12px' }}>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            rows={4}
            maxLength={MAX_CONTENT_LENGTH}
            required
            placeholder="Start a meomeo..."
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#ffffff',
              fontSize: '16px',
              fontFamily: 'inherit',
              resize: 'none',
              outline: 'none',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '12px',
            borderTop: '0.5px solid #1a1a1a',
          }}
        >
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#ffffff',
              }}
            >
              <input
                type="radio"
                value="public"
                checked={visibility === 'public'}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                disabled={isLoading}
                style={{ cursor: 'pointer' }}
              />
              Public
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#ffffff',
              }}
            >
              <input
                type="radio"
                value="private"
                checked={visibility === 'private'}
                onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
                disabled={isLoading}
                style={{ cursor: 'pointer' }}
              />
              Private
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                fontSize: '12px',
                color: '#737373',
              }}
            >
              {content.length} / {MAX_CONTENT_LENGTH}
            </span>
            <button
              type="submit"
              disabled={isLoading || !content.trim()}
              style={{
                backgroundColor: content.trim() ? 'var(--primary-color, #ffffff)' : 'var(--button-disabled-bg, #333)',
                color: content.trim() ? '#000000' : '#a8a8a8',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: content.trim() && !isLoading ? 'pointer' : 'not-allowed',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'opacity 0.2s',
              }}
            >
              {isLoading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default StoryCreateBox
