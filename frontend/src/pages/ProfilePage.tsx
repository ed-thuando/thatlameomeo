import { useState, useEffect } from 'react'
import { apiGet, apiPut, apiDelete, ApiException } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import { useDailyScore } from '../hooks/useDailyScore'
import AvatarEditor from '../components/users/AvatarEditor'
import DisplayNameEditor from '../components/users/DisplayNameEditor'
import StoryCard from '../components/stories/StoryCard'
import Header from '../components/layout/Header'

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
      <div>
        <Header />
        <div style={{ color: 'red' }}>{error}</div>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <h1>Profile</h1>

      {profile && (
        <div style={{ marginBottom: '24px' }}>
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Avatar"
              style={{ width: '96px', height: '96px', borderRadius: '50%', marginBottom: '12px' }}
            />
          )}
          <h2>{profile.display_name || profile.username}</h2>
          <p>@{profile.username}</p>
          {dailyScore !== null && (
            <p>
              <strong>Daily MeoMeo Score: 🐱 {dailyScore}</strong>
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px' }}>
        <div>
          <AvatarEditor
            currentAvatarUrl={profile?.avatar_url}
            onAvatarUpdated={handleAvatarUpdated}
          />
          <div style={{ marginTop: '24px' }}>
            <DisplayNameEditor
              currentDisplayName={profile?.display_name}
              onDisplayNameUpdated={handleDisplayNameUpdated}
            />
          </div>
        </div>

        <div>
          <h3>My Stories</h3>
          {isLoading ? (
            <div>Loading stories...</div>
          ) : stories.length === 0 ? (
            <div>No stories yet. Create your first story!</div>
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
      </div>
    </div>
  )
}

export default ProfilePage
