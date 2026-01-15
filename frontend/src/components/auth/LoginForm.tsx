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

function LoginForm({ onGoogleAuthSuccess, onGoogleAuthRequiresOnboarding, error, isLoading }: Omit<LoginFormProps, 'onSubmit'>) {
  const [googleLoading, setGoogleLoading] = useState(false)
  const [googleError, setGoogleError] = useState<string | null>(null)

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
    <div style={{ width: '100%' }}>
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
    </div>
  )
}

export default LoginForm
