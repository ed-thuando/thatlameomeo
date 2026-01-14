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
      <div>
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={fetchUsers}>Retry</button>
      </div>
    )
  }

  if (isLoading) {
    return <div>Loading users...</div>
  }

  return (
    <div>
      <h3>Users - Daily MeoMeo Scores</h3>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
        <button onClick={() => fetchUsers()}>Sort by Score</button>
        <button onClick={() => fetchUsers()}>Sort by Name</button>
      </div>
      <div>
        {users.map((user) => (
          <div
            key={user.id}
            style={{
              padding: '8px',
              marginBottom: '8px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between',
            }}
          >
            <span>{user.username}</span>
            <span>🐱 {user.daily_meomeo_score} MeoMeo</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserList
