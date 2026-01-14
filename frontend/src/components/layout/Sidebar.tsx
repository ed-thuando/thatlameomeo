import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function Sidebar() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return null
  }

  // Only show implemented features - others will be added later
  const navItems = [
    {
      path: '/',
      label: 'Home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      path: '/profile',
      label: 'Profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    // Temporarily hidden - will be implemented later:
    // - Search (/search)
    // - Create (/create)
    // - Activity (/activity)
    // - Saved (/saved)
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
          src="/icon.jpg"
          alt="Logo"
          style={{ width: '32px', height: '32px', borderRadius: '50%' }}
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
          <span style={{ color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {item.icon}
          </span>
        </Link>
      ))}
    </aside>
  )
}

export default Sidebar
