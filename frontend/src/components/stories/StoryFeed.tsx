import { useState, useEffect } from 'react'
import { apiGet, ApiException } from '../../services/api'
import StoryCard from './StoryCard'

interface Story {
  id: number
  user_id: number
  username?: string
  content: string
  visibility: string
  created_at: string
  like_count?: number
  comment_count?: number
  daily_meomeo_score?: number
}

interface StoriesResponse {
  stories: Story[]
  total: number
  limit: number
  offset: number
}

interface StoryFeedProps {
  refreshKey?: number
  onArchive?: (storyId: number) => void
  onDelete?: (storyId: number) => void
}

function StoryFeed({ refreshKey, onArchive, onDelete }: StoryFeedProps) {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [offset, setOffset] = useState(0)
  const limit = 20

  const fetchStories = async (reset = false) => {
    setIsLoading(true)
    setError(null)

    try {
      const currentOffset = reset ? 0 : offset
      const response = await apiGet<StoriesResponse>(
        `/stories?limit=${limit}&offset=${currentOffset}`
      )

      if (reset) {
        setStories(response.stories)
        setOffset(limit)
      } else {
        setStories((prev) => [...prev, ...response.stories])
        setOffset((prev) => prev + limit)
      }

      setHasMore(response.stories.length === limit)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to load stories. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStories(true)
  }, [refreshKey])

  const handleRefresh = () => {
    fetchStories(true)
  }

  if (error) {
    return (
      <div>
        <div style={{ color: 'red' }}>{error}</div>
        <button onClick={handleRefresh}>Retry</button>
      </div>
    )
  }

  if (isLoading && stories.length === 0) {
    return <div>Loading stories...</div>
  }

  if (stories.length === 0) {
    return <div>No stories yet. Be the first to share!</div>
  }

  return (
    <div>
      <h2>Public Stories</h2>
      {stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          onArchive={onArchive}
          onDelete={onDelete}
          onRefresh={handleRefresh}
        />
      ))}
      {hasMore && (
        <button onClick={() => fetchStories(false)} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  )
}

export default StoryFeed
