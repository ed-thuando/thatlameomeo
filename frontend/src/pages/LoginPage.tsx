import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, storeToken } from '../services/auth'
import LoginForm from '../components/auth/LoginForm'

function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await login({ username, password })
      storeToken(response.token)
      navigate('/')
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        setError(err.message as string)
      } else {
        setError('Login failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px' }}>
      <img
        src="/sad-cat-logo.svg"
        alt="Sad Cat Logo"
        style={{ width: '64px', height: '64px', marginBottom: '16px' }}
      />
      <h1>Thatlameomeo</h1>
      <LoginForm onSubmit={handleLogin} error={error} isLoading={isLoading} />
    </div>
  )
}

export default LoginPage
