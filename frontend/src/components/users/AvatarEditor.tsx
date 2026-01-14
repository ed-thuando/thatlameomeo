import { useState, useEffect } from 'react'
import { apiPut, ApiException } from '../../services/api'

interface AvatarEditorProps {
  currentAvatarUrl?: string | null
  currentAvatarBgColor?: string | null
  onAvatarUpdated?: (avatarUrl: string) => void
}

// 20 carefully selected color options for avatar backgrounds
const AVATAR_BG_COLORS = [
  '#1a1a1a', // Dark gray (default)
  '#FF5733', // Red
  '#33FF57', // Green
  '#3357FF', // Blue
  '#FF33F5', // Magenta
  '#F5FF33', // Yellow
  '#33FFF5', // Cyan
  '#FF8C33', // Orange
  '#8C33FF', // Purple
  '#FF3366', // Pink
  '#33FF8C', // Light green
  '#338CFF', // Light blue
  '#FFD700', // Gold
  '#FF6347', // Tomato
  '#00CED1', // Dark turquoise
  '#9370DB', // Medium purple
  '#FF1493', // Deep pink
  '#00FF7F', // Spring green
  '#FF4500', // Orange red
  '#4169E1', // Royal blue
]

function AvatarEditor({ currentAvatarUrl, currentAvatarBgColor, onAvatarUpdated }: AvatarEditorProps) {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl || '')
  const [avatarBgColor, setAvatarBgColor] = useState(currentAvatarBgColor || AVATAR_BG_COLORS[0])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Sync state when props change (e.g., after profile refresh)
  useEffect(() => {
    if (currentAvatarUrl !== undefined) {
      setAvatarUrl(currentAvatarUrl || '')
    }
    if (currentAvatarBgColor !== undefined) {
      setAvatarBgColor(currentAvatarBgColor || AVATAR_BG_COLORS[0])
    }
  }, [currentAvatarUrl, currentAvatarBgColor])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    setIsLoading(true)

    try {
      const response = await apiPut<{ avatar_url: string | null; avatar_bg_color: string }>('/users/me', {
        avatar_url: avatarUrl.trim() || null,
        avatar_bg_color: avatarBgColor,
      })

      // Update local state with response data
      if (response?.avatar_bg_color) {
        setAvatarBgColor(response.avatar_bg_color)
      }
      if (response?.avatar_url !== undefined) {
        setAvatarUrl(response.avatar_url || '')
      }

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
        backgroundColor: '#000000',
        border: '0.5px solid #1a1a1a',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 16px 0', color: '#ffffff', fontSize: '18px' }}>
        Edit Avatar
      </h3>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: avatarBgColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid var(--border-color, #1a1a1a)',
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar preview"
              style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <img
              src="/icon-line-light.png"
              alt="Avatar preview"
              style={{ width: '80%', height: '80%', objectFit: 'contain' }}
            />
          )}
        </div>
        <div>
          <div style={{ color: '#ffffff', fontSize: '12px', marginBottom: '4px' }}>Preview</div>
          <div style={{ color: '#737373', fontSize: '11px' }}>Background color</div>
        </div>
      </div>
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
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="avatar_url"
            style={{
              display: 'block',
              marginBottom: '8px',
              color: '#ffffff',
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
              backgroundColor: '#000000',
              border: '0.5px solid #1a1a1a',
              borderRadius: '8px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '12px',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Background Color:
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '8px',
            }}
          >
            {AVATAR_BG_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setAvatarBgColor(color)}
                disabled={isLoading}
                style={{
                  width: '100%',
                  aspectRatio: '1',
                  backgroundColor: color,
                  border: avatarBgColor === color ? '2px solid #ffffff' : '2px solid #1a1a1a',
                  borderRadius: '8px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'transform 0.2s, border-color 0.2s',
                  position: 'relative',
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.transform = 'scale(1.1)'
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                }}
                title={color}
              >
                {avatarBgColor === color && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      color: '#ffffff',
                      fontSize: '16px',
                    }}
                  >
                    ✓
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: '#ffffff',
            color: '#000000',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
            width: '100%',
          }}
        >
          {isLoading ? 'Updating...' : 'Update Avatar'}
        </button>
      </form>
    </div>
  )
}

export default AvatarEditor
