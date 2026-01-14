import { useState } from 'react'
import { apiPut, ApiException } from '../../services/api'

interface AvatarEditorProps {
  currentAvatarUrl?: string | null
  onAvatarUpdated?: (avatarUrl: string) => void
}

function AvatarEditor({ currentAvatarUrl, onAvatarUpdated }: AvatarEditorProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    setIsLoading(true)

    try {
      await apiPut('/users/me', {
        avatar_url: avatarUrl.trim() || null,
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      if (onAvatarUpdated) {
        onAvatarUpdated(avatarUrl)
      }
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to update avatar. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg, #1a1a1a)',
        border: '1px solid var(--border-color, #262626)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-color, #ffffff)', fontSize: '18px' }}>
        Edit Avatar
      </h3>
      {currentAvatarUrl && (
        <div style={{ marginBottom: '12px' }}>
          <img
            src={currentAvatarUrl}
            alt="Current avatar"
            style={{ width: '64px', height: '64px', borderRadius: '50%' }}
          />
        </div>
      )}
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
            Avatar updated successfully!
          </div>
        )}
        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="avatar_url"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-color, #ffffff)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Avatar URL:
          </label>
          <input
            id="avatar_url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            disabled={isLoading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: 'var(--background-color, #000000)',
              border: '1px solid var(--border-color, #262626)',
              borderRadius: '8px',
              color: 'var(--text-color, #ffffff)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: avatarUrl.trim() ? 'var(--primary-color, #ffffff)' : 'var(--button-disabled-bg, #333)',
            color: avatarUrl.trim() ? '#000000' : '#a8a8a8',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: avatarUrl.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {isLoading ? 'Updating...' : 'Update Avatar'}
        </button>
      </form>
    </div>
  )
}

export default AvatarEditor
