import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { completeOnboarding, checkUsernameAvailability, storeToken, storeRefreshToken } from '../../services/auth'
import { useAuth } from '../../hooks/useAuth'

// Predefined color palette (same as AvatarEditor)
const AVATAR_BG_COLORS = [
  '#1a1a1a', // Dark gray (default)
  '#FF5733', '#33FF57', '#3357FF', '#FF33F5', '#F5FF33',
  '#33FFF5', '#FF8C33', '#8C33FF', '#FF3366', '#33FF8C',
  '#338CFF', '#FFD700', '#FF6347', '#00CED1', '#9370DB',
  '#FF1493', '#00FF7F', '#FF4500', '#4169E1',
]

interface OnboardingScreenProps {
  sessionId: string
  googleUser?: {
    email: string
    name: string
    picture: string
  }
}

function OnboardingScreen({ sessionId, googleUser }: OnboardingScreenProps) {
  const navigate = useNavigate()
  const { setUser } = useAuth()
  const [username, setUsername] = useState('')
  const [selectedColor, setSelectedColor] = useState(AVATAR_BG_COLORS[0])
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [isCheckingUsername, setIsCheckingUsername] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Debounce username validation
  useEffect(() => {
    if (!username.trim()) {
      setUsernameError(null)
      return
    }

    // Validate format first
    const usernameRegex = /^[a-zA-Z0-9_]{1,50}$/
    if (!usernameRegex.test(username)) {
      setUsernameError('Username must be 1-50 characters and contain only letters, numbers, and underscores')
      return
    }

    // Debounce API call
    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true)
      setUsernameError(null)

      try {
        const result = await checkUsernameAvailability(username)
        if (!result.available) {
          setUsernameError('Username is already taken')
        }
      } catch (err: any) {
        console.error('Username check error:', err)
        // Don't show error for validation failures, just log
      } finally {
        setIsCheckingUsername(false)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timeoutId)
  }, [username])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitError(null)

    if (!username.trim()) {
      setSubmitError('Username is required')
      return
    }

    // Validate format
    const usernameRegex = /^[a-zA-Z0-9_]{1,50}$/
    if (!usernameRegex.test(username)) {
      setSubmitError('Username must be 1-50 characters and contain only letters, numbers, and underscores')
      return
    }

    // Check availability one more time before submitting
    try {
      const result = await checkUsernameAvailability(username)
      if (!result.available) {
        setSubmitError('Username is already taken. Please choose another.')
        return
      }
    } catch (err: any) {
      setSubmitError(err?.message || 'Failed to validate username. Please try again.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await completeOnboarding(sessionId, username, selectedColor)
      
      // Store tokens
      storeToken(response.access_token)
      storeRefreshToken(response.refresh_token)
      
      // Update user state
      setUser({
        id: response.user.id,
        username: response.user.username,
      })
      
      // Navigate to home
      navigate('/')
    } catch (err: any) {
      console.error('Onboarding error:', err)
      if (err?.statusCode === 409) {
        setSubmitError('Username is already taken. Please choose another.')
      } else if (err?.statusCode === 401) {
        setSubmitError('Onboarding session expired. Please sign in again.')
        // Redirect to login after a delay
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setSubmitError(err?.message || 'Failed to complete onboarding. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#000000',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg, #1a1a1a)',
          border: '1px solid var(--border-color, #262626)',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#ffffff', fontSize: '28px', fontWeight: 600 }}>
            Complete Your Profile
          </h1>
          <p style={{ margin: 0, color: '#a8a8a8', fontSize: '14px', textAlign: 'center' }}>
            Choose a username and avatar background color to get started
          </p>
        </div>

        {googleUser && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '24px',
              padding: '12px',
              backgroundColor: 'var(--card-bg, #1a1a1a)',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #262626)',
            }}
          >
            {googleUser.picture && (
              <img
                src={googleUser.picture}
                alt={googleUser.name}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                }}
              />
            )}
            <div>
              <div style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                {googleUser.name}
              </div>
              <div style={{ color: '#a8a8a8', fontSize: '12px' }}>
                {googleUser.email}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {submitError && (
            <div
              style={{
                color: '#ff4444',
                fontSize: '14px',
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: 'rgba(255, 68, 68, 0.1)',
                borderRadius: '8px',
              }}
            >
              {submitError}
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label
              htmlFor="username"
              style={{
                display: 'block',
                marginBottom: '8px',
                color: 'var(--text-color, #ffffff)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
              required
              placeholder="Choose a username"
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: 'var(--card-bg, #1a1a1a)',
                border: usernameError
                  ? '1px solid #ff4444'
                  : '1px solid var(--border-color, #262626)',
                borderRadius: '8px',
                color: 'var(--text-color, #ffffff)',
                fontSize: '16px',
                outline: 'none',
              }}
              onBlur={() => {
                // Validation happens in useEffect
              }}
            />
            {isCheckingUsername && (
              <div style={{ color: '#a8a8a8', fontSize: '12px', marginTop: '4px' }}>
                Checking availability...
              </div>
            )}
            {usernameError && (
              <div style={{ color: '#ff4444', fontSize: '12px', marginTop: '4px' }}>
                {usernameError}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '12px',
                color: 'var(--text-color, #ffffff)',
                fontSize: '14px',
                fontWeight: 500,
              }}
            >
              Avatar Background Color
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
                  onClick={() => setSelectedColor(color)}
                  disabled={isSubmitting}
                  style={{
                    width: '100%',
                    aspectRatio: '1',
                    backgroundColor: color,
                    border: selectedColor === color ? '2px solid #ffffff' : '2px solid #1a1a1a',
                    borderRadius: '8px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'transform 0.2s, border-color 0.2s',
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.transform = 'scale(1.1)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                  title={color}
                >
                  {selectedColor === color && (
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
            disabled={isSubmitting || !username.trim() || !!usernameError || isCheckingUsername}
            style={{
              width: '100%',
              backgroundColor:
                username.trim() && !usernameError && !isCheckingUsername
                  ? 'var(--primary-color, #ffffff)'
                  : 'var(--button-disabled-bg, #333)',
              color:
                username.trim() && !usernameError && !isCheckingUsername
                  ? '#000000'
                  : '#a8a8a8',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              cursor:
                username.trim() && !usernameError && !isCheckingUsername && !isSubmitting
                  ? 'pointer'
                  : 'not-allowed',
              fontSize: '16px',
              fontWeight: 600,
              transition: 'opacity 0.2s',
            }}
          >
            {isSubmitting ? 'Creating account...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default OnboardingScreen
