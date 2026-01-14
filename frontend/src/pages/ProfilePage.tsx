import { useState, useEffect } from 'react'
import { apiGet, apiPut, apiDelete, ApiException } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useDailyScore } from '../hooks/useDailyScore'
import AvatarEditor from '../components/users/AvatarEditor'
import DisplayNameEditor from '../components/users/DisplayNameEditor'
import StoryCard from '../components/stories/StoryCard'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'

interface Story {
  id: number
  user_id: number
  content: string
  visibility: string
  created_at: string
  archived?: number
  like_count?: number
  comment_count?: number
}

interface UserProfile {
  id: number
  username: string
  display_name: string | null
  avatar_url: string | null
}

function ProfilePage() {
  const { user } = useAuth()
  const { dailyScore } = useDailyScore(user?.id)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (user?.id) {
      fetchProfile()
      fetchUserStories()
    }
  }, [user?.id])

  const fetchProfile = async () => {
    try {
      const response = await apiGet<UserProfile>(`/users/${user?.id}`)
      setProfile(response)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to load profile')
      }
    }
  }

  const fetchUserStories = async () => {
    setIsLoading(true)
    try {
      const response = await apiGet<{ stories: Story[] }>('/stories/me')
      setStories(response.stories)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to load stories')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleArchive = async (storyId: number) => {
    try {
      await apiPut(`/stories/${storyId}/archive`, {})
      fetchUserStories()
    } catch (err) {
      if (err instanceof ApiException) {
        console.error('Failed to archive story:', err.message)
      }
    }
  }

  const handleDelete = async (storyId: number) => {
    if (!confirm('Are you sure you want to delete this story? This action cannot be undone.')) {
      return
    }

    try {
      await apiDelete(`/stories/${storyId}`)
      fetchUserStories()
    } catch (err) {
      if (err instanceof ApiException) {
        console.error('Failed to delete story:', err.message)
      }
    }
  }

  const handleAvatarUpdated = () => {
    fetchProfile()
  }

  const handleDisplayNameUpdated = () => {
    fetchProfile()
  }

  if (error && !profile) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000' }}>
        <Sidebar />
        <div style={{ marginLeft: '72px', width: '100%', backgroundColor: '#000000' }}>
          <Header />
          <div style={{ marginTop: '60px', padding: '24px', color: '#ff4444' }}>{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000' }}>
      <Sidebar />
      <div style={{ marginLeft: '72px', width: '100%', backgroundColor: '#000000' }}>
        <Header />
        <div
          style={{
            marginTop: '60px',
            display: 'grid',
            gridTemplateColumns: '1fr 600px 1fr',
            gap: '24px',
            padding: '24px',
            maxWidth: '1200px',
            marginLeft: 'auto',
            marginRight: 'auto',
            backgroundColor: '#000000',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {profile && (
              <div
                style={{
                  backgroundColor: 'var(--card-bg, #1a1a1a)',
                  border: '1px solid var(--border-color, #262626)',
                  borderRadius: '12px',
                  padding: '24px',
                }}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      marginBottom: '12px',
                    }}
                  />
                ) : (
                  <img
                    src="/icon-line-light.png"
                    alt={profile.username || 'User'}
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      marginBottom: '12px',
                      objectFit: 'cover',
                    }}
                  />
                )}
                <h2 style={{ margin: '0 0 8px 0', color: 'var(--text-color, #ffffff)' }}>
                  {profile.display_name || profile.username}
                </h2>
                <p style={{ margin: '0 0 12px 0', color: 'var(--secondary-text, #a8a8a8)' }}>
                  @{profile.username}
                </p>
                {dailyScore !== null && (
                  <p style={{ margin: 0, color: 'var(--text-color, #ffffff)' }}>
                    <strong>Daily MeoMeo Score: 🐱 {dailyScore}</strong>
                  </p>
                )}
              </div>
            )}
            <AvatarEditor
              currentAvatarUrl={profile?.avatar_url}
              onAvatarUpdated={handleAvatarUpdated}
            />
            <DisplayNameEditor
              currentDisplayName={profile?.display_name}
              onDisplayNameUpdated={handleDisplayNameUpdated}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {isLoading ? (
              <div style={{ color: 'var(--text-color, #ffffff)' }}>Loading stories...</div>
            ) : stories.length === 0 ? (
              <div
                style={{
                  backgroundColor: 'var(--card-bg, #1a1a1a)',
                  border: '1px solid var(--border-color, #262626)',
                  borderRadius: '12px',
                  padding: '24px',
                  textAlign: 'center',
                  color: 'var(--secondary-text, #a8a8a8)',
                }}
              >
                No stories yet. Create your first story!
              </div>
            ) : (
              <div>
                {stories.map((story) => (
                  <StoryCard
                    key={story.id}
                    story={{
                      ...story,
                      username: profile?.display_name || profile?.username,
                    }}
                    showActions={false}
                    onArchive={handleArchive}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Right sidebar content */}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
