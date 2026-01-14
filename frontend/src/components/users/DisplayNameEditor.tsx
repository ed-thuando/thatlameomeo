import { useState } from 'react'
import { apiPut, ApiException } from '../../services/api'

interface DisplayNameEditorProps {
  currentDisplayName?: string | null
  onDisplayNameUpdated?: (displayName: string) => void
}

function DisplayNameEditor({
  currentDisplayName,
  onDisplayNameUpdated,
}: DisplayNameEditorProps) {
  const [displayName, setDisplayName] = useState(currentDisplayName || '')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!displayName.trim()) {
      setError('Display name cannot be empty')
      return
    }

    if (displayName.length > 50) {
      setError('Display name must be 50 characters or less')
      return
    }

    setIsLoading(true)

    try {
      await apiPut('/users/me', {
        display_name: displayName.trim(),
      })

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)

      if (onDisplayNameUpdated) {
        onDisplayNameUpdated(displayName)
      }
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to update display name. Please try again.')
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
        Edit Display Name
      </h3>
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
            Display name updated successfully!
          </div>
        )}
        <div style={{ marginBottom: '12px' }}>
          <label
            htmlFor="display_name"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: 'var(--text-color, #ffffff)',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Display Name:
          </label>
          <input
            id="display_name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            maxLength={50}
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
            required
          />
          <div style={{ fontSize: '12px', color: 'var(--secondary-text, #a8a8a8)', marginTop: '4px' }}>
            {displayName.length} / 50 characters
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading || !displayName.trim()}
          style={{
            backgroundColor: displayName.trim() ? 'var(--primary-color, #ffffff)' : 'var(--button-disabled-bg, #333)',
            color: displayName.trim() ? '#000000' : '#a8a8a8',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: displayName.trim() && !isLoading ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {isLoading ? 'Updating...' : 'Update Display Name'}
        </button>
      </form>
    </div>
  )
}

export default DisplayNameEditor
