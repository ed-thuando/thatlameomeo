import { useState, FormEvent } from 'react'
import { apiPost, ApiException } from '../../services/api'

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

      const response = await apiPost<CreateStoryResponse>('/stories', request)

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
    <div>
      <h2>Create Story</h2>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && (
          <div style={{ color: 'green' }}>Story created successfully!</div>
        )}
        <div>
          <label htmlFor="content">What's on your mind?</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isLoading}
            rows={5}
            maxLength={MAX_CONTENT_LENGTH}
            required
            style={{ width: '100%' }}
          />
          <div>
            {content.length} / {MAX_CONTENT_LENGTH} characters
          </div>
        </div>
        <div>
          <label>
            <input
              type="radio"
              value="public"
              checked={visibility === 'public'}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              disabled={isLoading}
            />
            Public
          </label>
          <label>
            <input
              type="radio"
              value="private"
              checked={visibility === 'private'}
              onChange={(e) => setVisibility(e.target.value as 'public' | 'private')}
              disabled={isLoading}
            />
            Private
          </label>
        </div>
        <button type="submit" disabled={isLoading || !content.trim()}>
          {isLoading ? 'Creating...' : 'Share Story'}
        </button>
      </form>
    </div>
  )
}

export default StoryCreateBox
