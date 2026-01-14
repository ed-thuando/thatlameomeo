import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function Header() {
  const { isAuthenticated, logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Home'
    if (location.pathname.startsWith('/profile')) return 'Profile'
    if (location.pathname.startsWith('/post/')) return 'Thread'
    if (location.pathname === '/search') return 'Search'
    if (location.pathname === '/create') return 'Create'
    if (location.pathname === '/activity') return 'Activity'
    if (location.pathname === '/saved') return 'Saved'
    return 'Home'
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: '72px',
        right: 0,
        height: '60px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 24px',
        backgroundColor: 'var(--header-bg, #000000)',
        borderBottom: '1px solid var(--border-color, #262626)',
        zIndex: 999,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: 600,
          color: '#ffffff',
        }}
      >
        {getPageTitle()}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={logout}
          style={{
            background: 'none',
            border: '1px solid #262626',
            color: '#ffffff',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default Header
