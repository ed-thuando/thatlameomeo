import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiGet, ApiException } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import StoryDetail from '../components/stories/StoryDetail'
import CommentSection from '../components/stories/CommentSection'
import Header from '../components/layout/Header'
import Sidebar from '../components/layout/Sidebar'

interface Story {
  id: number
  user_id: number
  username?: string
  display_name?: string
  content: string
  visibility: string
  created_at: string
  like_count?: number
  comment_count?: number
}

function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [story, setStory] = useState<Story | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      fetchStory()
    }
  }, [id])

  const fetchStory = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await apiGet<Story>(`/stories/${id}`)
      setStory(response)
    } catch (err) {
      if (err instanceof ApiException) {
        if (err.statusCode === 404) {
          setError('Story not found')
        } else if (err.statusCode === 403) {
          setError('You do not have permission to view this story')
        } else {
          setError(err.message)
        }
      } else {
        setError('Failed to load story')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchStory()
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000' }}>
        <Sidebar />
        <div style={{ marginLeft: '72px', width: '100%', backgroundColor: '#000000' }}>
        <Header />
          <div style={{ marginTop: '60px', padding: '24px', color: '#ffffff' }}>
            Loading story...
          </div>
        </div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#000000' }}>
        <Sidebar />
        <div style={{ marginLeft: '72px', width: '100%' }}>
        <Header />
          <div
            style={{
              marginTop: '60px',
              padding: '24px',
              color: '#ff4444',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div>{error || 'Story not found'}</div>
            <button
              onClick={() => navigate('/')}
              style={{
                backgroundColor: 'var(--card-bg, #1a1a1a)',
                border: '1px solid var(--border-color, #262626)',
                color: 'var(--text-color, #ffffff)',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                maxWidth: '200px',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background-color, #000000)' }}>
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
            {/* Left sidebar content */}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0px' }}>
        <StoryDetail story={story} />
            <div style={{ marginTop: '0px', paddingTop: '16px' }}>
          <CommentSection
            storyId={story.id}
            storyAuthorId={story.user_id}
            commentCount={story.comment_count}
            compact={false}
            onComment={handleRefresh}
          />
        </div>
        {!isAuthenticated && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '16px',
                  backgroundColor: 'var(--card-bg, #1a1a1a)',
                  border: '1px solid var(--border-color, #262626)',
                  borderRadius: '12px',
                  color: 'var(--text-color, #ffffff)',
                }}
              >
                <p style={{ margin: '0 0 12px 0' }}>You must be logged in to like or comment on posts.</p>
                <button
                  onClick={() => navigate('/login')}
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
                  Login
                </button>
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

export default PostDetailPage
