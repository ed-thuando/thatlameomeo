import { BrowserRouter, Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from './hooks/useAuth'
import { useTheme } from './hooks/useTheme'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import PostDetailPage from './pages/PostDetailPage'
import { apiGet, ApiException } from './services/api'

/**
 * Protected route component that redirects to login if not authenticated
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background-color, #000000)',
          color: 'var(--text-color, #ffffff)',
        }}
      >
        Loading...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

/**
 * Share route handler - resolves share token to story ID and redirects
 */
function ShareRoute() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (token) {
      resolveShareToken(token)
    }
  }, [token])

  const resolveShareToken = async (shareToken: string) => {
    try {
      const response = await apiGet<{ story_id: number }>(`/shares/${shareToken}`)
      navigate(`/post/${response.story_id}`, { replace: true })
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to resolve share link')
      }
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background-color, #000000)',
          color: 'var(--text-color, #ffffff)',
        }}
      >
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background-color, #000000)',
          color: 'var(--text-color, #ffffff)',
          padding: '24px',
          gap: '16px',
        }}
      >
        <div style={{ color: '#ff4444', fontSize: '16px' }}>{error}</div>
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: 'var(--card-bg, #1a1a1a)',
            border: '1px solid var(--border-color, #262626)',
            color: 'var(--text-color, #ffffff)',
            padding: '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Go Home
        </button>
      </div>
    )
  }

  return null
}

function App() {
  const { isLoading: themeLoading } = useTheme()

  if (themeLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: 'var(--background-color, #000000)',
          color: 'var(--text-color, #ffffff)',
        }}
      >
        Loading...
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/post/:id"
          element={
            <ProtectedRoute>
              <PostDetailPage />
            </ProtectedRoute>
          }
        />
        <Route path="/share/:token" element={<ShareRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
