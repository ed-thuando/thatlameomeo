import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function Sidebar() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return null
  }

  const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/search', icon: '🔍', label: 'Search' },
    { path: '/create', icon: '➕', label: 'Create' },
    { path: '/activity', icon: '❤️', label: 'Activity' },
    { path: '/profile', icon: '👤', label: 'Profile' },
    { path: '/saved', icon: '📌', label: 'Saved' },
  ]

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        width: '72px',
        backgroundColor: 'var(--sidebar-bg, #000000)',
        borderRight: '1px solid var(--border-color, #262626)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: '12px',
        zIndex: 1000,
      }}
    >
      <Link
        to="/"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '48px',
          height: '48px',
          marginBottom: '8px',
          textDecoration: 'none',
        }}
      >
        <img
          src="/sad-cat-logo.svg"
          alt="Logo"
          style={{ width: '32px', height: '32px' }}
        />
      </Link>

      {navItems.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '48px',
            height: '48px',
            marginBottom: '4px',
            borderRadius: '12px',
            textDecoration: 'none',
            backgroundColor: isActive(item.path)
              ? 'var(--sidebar-active-bg, #1a1a1a)'
              : 'transparent',
            transition: 'background-color 0.2s',
          }}
          title={item.label}
        >
          <span style={{ fontSize: '24px' }}>{item.icon}</span>
        </Link>
      ))}
    </aside>
  )
}

export default Sidebar
