import { useNavigate } from 'react-router-dom'
import LikeButton from './LikeButton'
import ShareButton from './ShareButton'

interface StoryDetailProps {
  story: {
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
  onRefresh?: () => void
}

function StoryDetail({ story, onRefresh }: StoryDetailProps) {
  const navigate = useNavigate()

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h2 style={{ margin: 0 }}>
            {story.display_name || story.username || 'Unknown User'}
          </h2>
          <p style={{ margin: '4px 0', color: '#666' }}>@{story.username}</p>
        </div>
        <div style={{ color: '#666', fontSize: '0.9em' }}>
          {formatDate(story.created_at)}
        </div>
      </div>

      <div style={{ marginBottom: '16px', whiteSpace: 'pre-wrap', fontSize: '1.1em' }}>
        {story.content}
      </div>

      <div
        style={{ display: 'flex', gap: '16px', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid #eee' }}
      >
        <LikeButton storyId={story.id} likeCount={story.like_count || 0} onLike={onRefresh} />
        <ShareButton storyId={story.id} />
        <span style={{ color: '#666' }}>
          💬 {story.comment_count || 0} {story.comment_count === 1 ? 'comment' : 'comments'}
        </span>
      </div>
    </div>
  )
}

export default StoryDetail
