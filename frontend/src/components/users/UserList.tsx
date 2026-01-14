import { useState, useEffect, useCallback, useMemo, memo } from 'react'
import { apiGet, ApiException } from '../../services/api'
import { useUserScoreUpdate } from '../../hooks/useUserScoreUpdate'

interface User {
  id: number
  username: string
  daily_meomeo_score: number
}

interface UsersResponse {
  users: User[]
}

// Memoized user item component to prevent unnecessary re-renders
const UserItem = memo(({ user }: { user: User }) => {
  return (
    <div
      style={{
        padding: '12px 0',
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
          <span style={{ color: '#737373', fontSize: '12px' }}>
            🐱 {user.daily_meomeo_score} MeoMeo
          </span>
        </div>
      </div>
    </div>
  )
})

UserItem.displayName = 'UserItem'

function UserList() {
  const [users, setUsers] = useState<Map<number, User>>(new Map())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiGet<UsersResponse>(
        `/users?sort=meomeo_score&order=desc`
      )
      // Convert array to Map for O(1) lookups
      const usersMap = new Map<number, User>()
      response.users.forEach((user) => {
        usersMap.set(user.id, user)
      })
      setUsers(usersMap)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to load users. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Update a specific user's score without refetching all users
  const handleScoreUpdate = useCallback((userId: number, newScore: number) => {
    setUsers((prevUsers) => {
      const updatedUsers = new Map(prevUsers)
      const user = updatedUsers.get(userId)
      if (user && user.daily_meomeo_score !== newScore) {
        updatedUsers.set(userId, { ...user, daily_meomeo_score: newScore })
        // Note: Sorting happens in useMemo below, so we just update the Map
        return updatedUsers
      }
      return prevUsers
    })
  }, [])

  // Register for score updates
  useUserScoreUpdate(handleScoreUpdate)

  // Convert Map to sorted array for rendering
  const sortedUsers = useMemo(() => {
    return Array.from(users.values()).sort(
      (a, b) => b.daily_meomeo_score - a.daily_meomeo_score
    )
  }, [users])

  if (error) {
    return (
      <div
        style={{
          backgroundColor: 'var(--card-bg, #1a1a1a)',
          border: '0.5px solid #1a1a1a',
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
          border: '0.5px solid #1a1a1a',
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
        backgroundColor: '#000000',
        border: '0.5px solid #1a1a1a',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <h3 style={{ margin: '0 0 20px 0', color: '#ffffff', fontSize: '18px', fontWeight: 600 }}>
        Users - Daily MeoMeo Scores
      </h3>
      <div>
        {sortedUsers.map((user, index) => (
          <div
            key={user.id}
            style={{
              borderBottom: index < sortedUsers.length - 1 ? '0.5px solid #1a1a1a' : 'none',
            }}
          >
            <UserItem user={user} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default UserList
