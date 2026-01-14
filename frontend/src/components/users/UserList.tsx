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

interface UserListProps {
  sortBy?: 'meomeo_score' | 'username'
  order?: 'asc' | 'desc'
}

function UserList({ sortBy = 'meomeo_score', order = 'desc' }: UserListProps) {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [sortBy, order])

  const fetchUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiGet<UsersResponse>(
        `/users?sort=${sortBy}&order=${order}`
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
      <h3 style={{ margin: '0 0 16px 0', color: 'var(--text-color, #ffffff)', fontSize: '18px' }}>
        Users - Daily MeoMeo Scores
      </h3>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button
          onClick={() => fetchUsers()}
          style={{
            backgroundColor: 'var(--card-bg, #1a1a1a)',
            border: '1px solid var(--border-color, #262626)',
            color: 'var(--text-color, #ffffff)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Sort by Score
        </button>
        <button
          onClick={() => fetchUsers()}
          style={{
            backgroundColor: 'var(--card-bg, #1a1a1a)',
            border: '1px solid var(--border-color, #262626)',
            color: 'var(--text-color, #ffffff)',
            padding: '6px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '12px',
          }}
        >
          Sort by Name
        </button>
      </div>
      <div>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              padding: '12px',
              marginBottom: '8px',
              border: '1px solid var(--border-color, #262626)',
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--background-color, #000000)',
            }}
          >
            <span style={{ color: 'var(--text-color, #ffffff)', fontSize: '14px' }}>
              {user.username}
            </span>
            <span style={{ color: 'var(--secondary-text, #a8a8a8)', fontSize: '14px' }}>
              🐱 {user.daily_meomeo_score} MeoMeo
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserList
