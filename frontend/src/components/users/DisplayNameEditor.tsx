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
    <div>
      <h3>Edit Display Name</h3>
      <form onSubmit={handleSubmit}>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {success && (
          <div style={{ color: 'green' }}>Display name updated successfully!</div>
        )}
        <div>
          <label htmlFor="display_name">Display Name:</label>
          <input
            id="display_name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            maxLength={50}
            disabled={isLoading}
            style={{ width: '100%', padding: '8px' }}
            required
          />
          <div style={{ fontSize: '0.9em', color: '#666' }}>
            {displayName.length} / 50 characters
          </div>
        </div>
        <button type="submit" disabled={isLoading || !displayName.trim()}>
          {isLoading ? 'Updating...' : 'Update Display Name'}
        </button>
      </form>
    </div>
  )
}

export default DisplayNameEditor
