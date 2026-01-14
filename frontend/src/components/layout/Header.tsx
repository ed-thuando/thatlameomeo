import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ThemeSelector from '../theme/ThemeSelector'

function Header() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleHomeClick = () => {
    navigate('/')
  }

  return (
    <header
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid #ddd',
        marginBottom: '16px',
      }}
    >
      <div
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
        onClick={handleHomeClick}
      >
        <img
          src="/sad-cat-logo.svg"
          alt="Sad Cat Logo"
          style={{ width: '32px', height: '32px' }}
        />
        <h1 style={{ margin: 0 }}>Thatlameomeo</h1>
      </div>

      {isAuthenticated && (
        <nav style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <ThemeSelector />
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          <button onClick={logout}>Logout</button>
        </nav>
      )}
    </header>
  )
}

export default Header
