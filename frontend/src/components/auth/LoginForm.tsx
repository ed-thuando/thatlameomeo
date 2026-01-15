import { useState, FormEvent } from 'react'
import { GoogleLogin, CredentialResponse } from '@react-oauth/google'
import { googleAuth, storeToken, storeRefreshToken } from '../../services/auth'

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void
  onGoogleAuthSuccess?: () => void
  onGoogleAuthRequiresOnboarding?: (sessionId: string, googleUser: { email: string; name: string; picture: string }) => void
  error: string | null
  isLoading: boolean
}

function LoginForm({ onSubmit, onGoogleAuthSuccess, onGoogleAuthRequiresOnboarding, error, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      return
    }
    onSubmit(username, password)
  }

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    setGoogleLoading(true)
    setGoogleError(null)
    
    if (!credentialResponse.credential) {
      setGoogleError('No credential received from Google')
      setGoogleLoading(false)
      return
    }

    try {
      const response = await googleAuth(credentialResponse.credential)
      
      if (response.requires_onboarding) {
        // Handle onboarding flow
        if (onGoogleAuthRequiresOnboarding && response.onboarding_session && response.google_user) {
          onGoogleAuthRequiresOnboarding(
            response.onboarding_session.session_id,
            response.google_user
          )
        }
      } else {
        // User is logged in
        if (response.access_token) {
          storeToken(response.access_token)
        }
        if (response.refresh_token) {
          storeRefreshToken(response.refresh_token)
        }
        if (onGoogleAuthSuccess) {
          onGoogleAuthSuccess()
        }
      }
    } catch (err: any) {
      console.error('Google authentication error:', err)
      setGoogleError(err?.message || 'Google authentication failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleGoogleError = () => {
    setGoogleError('Google authentication was cancelled or failed')
    setGoogleLoading(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && (
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
          {error}
        </div>
      )}
      {googleError && (
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
          {googleError}
        </div>
      )}
      <div style={{ marginBottom: '16px' }}>
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
          disabled={isLoading}
          required
          placeholder="Enter your username"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--card-bg, #1a1a1a)',
            border: '1px solid var(--border-color, #262626)',
            borderRadius: '8px',
            color: 'var(--text-color, #ffffff)',
            fontSize: '16px',
            outline: 'none',
          }}
        />
      </div>
      <div style={{ marginBottom: '24px' }}>
        <label
          htmlFor="password"
          style={{
            display: 'block',
            marginBottom: '8px',
            color: 'var(--text-color, #ffffff)',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isLoading}
          required
          placeholder="Enter your password"
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--card-bg, #1a1a1a)',
            border: '1px solid var(--border-color, #262626)',
            borderRadius: '8px',
            color: 'var(--text-color, #ffffff)',
            fontSize: '16px',
            outline: 'none',
          }}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading || !username.trim() || !password.trim()}
        style={{
          width: '100%',
          backgroundColor: username.trim() && password.trim() ? 'var(--primary-color, #ffffff)' : 'var(--button-disabled-bg, #333)',
          color: username.trim() && password.trim() ? '#000000' : '#a8a8a8',
          border: 'none',
          padding: '12px',
          borderRadius: '8px',
          cursor: username.trim() && password.trim() && !isLoading ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 600,
          transition: 'opacity 0.2s',
          marginBottom: '16px',
        }}
      >
        {isLoading ? 'Logging in...' : 'Log in'}
      </button>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginTop: '16px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'var(--border-color, #262626)',
          }}
        />
        <span
          style={{
            color: 'var(--text-secondary, #a8a8a8)',
            fontSize: '14px',
          }}
        >
          OR
        </span>
        <div
          style={{
            flex: 1,
            height: '1px',
            backgroundColor: 'var(--border-color, #262626)',
          }}
        />
      </div>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap={false}
          theme="filled_black"
          size="large"
          text="signin_with"
          shape="rectangular"
        />
      </div>
    </form>
  )
}

export default LoginForm
