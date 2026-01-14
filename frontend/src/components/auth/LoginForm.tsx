import { useState, FormEvent } from 'react'

interface LoginFormProps {
  onSubmit: (username: string, password: string) => void
  error: string | null
  isLoading: boolean
}

function LoginForm({ onSubmit, error, isLoading }: LoginFormProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      return
    }
    onSubmit(username, password)
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
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--background-color, #000000)',
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
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: 'var(--background-color, #000000)',
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
          color: username.trim() && password.trim() ? '#000000' : 'var(--secondary-text, #666)',
          border: 'none',
          padding: '12px',
          borderRadius: '8px',
          cursor: username.trim() && password.trim() && !isLoading ? 'pointer' : 'not-allowed',
          fontSize: '16px',
          fontWeight: 600,
          transition: 'opacity 0.2s',
        }}
      >
        {isLoading ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  )
}

export default LoginForm
