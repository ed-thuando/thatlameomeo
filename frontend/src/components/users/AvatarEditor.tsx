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
    <div>
      <h3>Edit Avatar</h3>
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
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && <div style={{ color: 'green' }}>Avatar updated successfully!</div>}
        <div>
          <label htmlFor="avatar_url">Avatar URL:</label>
          <input
            id="avatar_url"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://example.com/avatar.jpg"
            disabled={isLoading}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Updating...' : 'Update Avatar'}
        </button>
      </form>
    </div>
  )
}

export default AvatarEditor
