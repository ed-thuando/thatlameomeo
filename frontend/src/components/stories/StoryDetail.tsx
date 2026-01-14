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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`
    return formatDate(dateString)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--card-bg, #1a1a1a)',
        border: '1px solid var(--border-color, #262626)',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--avatar-bg, #333)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            fontSize: '20px',
          }}
        >
          {(story.display_name || story.username)?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <strong style={{ color: 'var(--text-color, #ffffff)', fontSize: '14px' }}>
              {story.display_name || story.username || 'Unknown User'}
            </strong>
            <span style={{ color: 'var(--secondary-text, #a8a8a8)', fontSize: '12px' }}>
              @{story.username}
            </span>
            <span style={{ color: 'var(--secondary-text, #a8a8a8)', fontSize: '12px' }}>
              · {formatTimeAgo(story.created_at)}
            </span>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            // Handle menu
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--secondary-text, #a8a8a8)',
            cursor: 'pointer',
            padding: '4px',
            fontSize: '18px',
          }}
        >
          ⋯
        </button>
      </div>

      <div
        style={{
          marginBottom: '12px',
          whiteSpace: 'pre-wrap',
          color: 'var(--text-color, #ffffff)',
          fontSize: '16px',
          lineHeight: '1.5',
        }}
      >
        {story.content}
      </div>

      <div
        style={{
          display: 'flex',
          gap: '24px',
          alignItems: 'center',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-color, #262626)',
        }}
      >
        <LikeButton storyId={story.id} likeCount={story.like_count || 0} onLike={onRefresh} />
        <ShareButton storyId={story.id} />
        <span style={{ color: 'var(--secondary-text, #a8a8a8)', fontSize: '14px' }}>
          💬 {story.comment_count || 0} {story.comment_count === 1 ? 'comment' : 'comments'}
        </span>
      </div>
    </div>
  )
}

export default StoryDetail
