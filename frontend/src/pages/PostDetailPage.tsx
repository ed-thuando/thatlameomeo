import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiGet, ApiException } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import StoryDetail from '../components/stories/StoryDetail'
import CommentSection from '../components/stories/CommentSection'
import Header from '../components/layout/Header'

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
      <div>
        <Header />
        <div>Loading story...</div>
      </div>
    )
  }

  if (error || !story) {
    return (
      <div>
        <Header />
        <div style={{ color: 'red' }}>{error || 'Story not found'}</div>
        <button onClick={() => navigate('/')}>Go Home</button>
      </div>
    )
  }

  return (
    <div>
      <Header />
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <StoryDetail story={story} />
        <div style={{ marginTop: '24px' }}>
          <CommentSection
            storyId={story.id}
            commentCount={story.comment_count}
            compact={false}
            onComment={handleRefresh}
          />
        </div>
        {!isAuthenticated && (
          <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f0f0f0' }}>
            <p>You must be logged in to like or comment on posts.</p>
            <button onClick={() => navigate('/login')}>Login</button>
          </div>
        )}
      </div>
    </div>
  )
}

export default PostDetailPage
