import { useState, useEffect } from 'react'
import { apiGet, ApiException } from '../../services/api'

interface User {
  id: number
  username: string
  daily_meomeo_score: number
}

interface UsersResponse {
  users: User[]
}

function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiGet<UsersResponse>(
        `/users?sort=meomeo_score&order=desc`
      )
      setUsers(response.users)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to load users. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg, #1a1a1a)',
          border: '1px solid var(--border-color, #262626)',
          borderRadius: '12px',
          padding: '16px',
        }}
      >
        <div style={{ color: '#ff4444', marginBottom: '12px' }}>{error}</div>
        <button
          onClick={fetchUsers}
          style={{
            backgroundColor: 'var(--primary-color, #ffffff)',
            color: '#000000',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg, #1a1a1a)',
          border: '1px solid var(--border-color, #262626)',
          borderRadius: '12px',
          padding: '16px',
          color: 'var(--text-color, #ffffff)',
        }}
      >
        Loading users...
      </div>
    )
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg, #1a1a1a)',
        border: '1px solid var(--border-color, #262626)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 20px 0', color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>
        Users - Daily MeoMeo Scores
      </h3>
      <div>
        {users.map((user, index) => (
          <div
            key={user.id}
            style={{
              padding: '12px 0',
              borderBottom: index < users.length - 1 ? '1px solid #262626' : 'none',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <img
                src="/icon-line-light.png"
                alt={user.username}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 500 }}>
                  {user.username}
                </span>
                <span style={{ color: '#a8a8a8', fontSize: '12px' }}>
                  🐱 {user.daily_meomeo_score} MeoMeo
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserList
