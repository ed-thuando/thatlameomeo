import { useNavigate } from 'react-router-dom'
import LikeButton from './LikeButton'
import ShareButton from './ShareButton'

interface StoryDetailProps {
  story: {
    id: number
    user_id: number
    username?: string
    display_name?: string
    avatar_url?: string | null
    avatar_bg_color?: string | null
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
        backgroundColor: '#000000',
        border: '0.5px solid #1a1a1a',
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
            backgroundColor: story.avatar_bg_color || '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            border: '1px solid #1a1a1a',
          }}
        >
          {story.avatar_url ? (
            <img
              src={story.avatar_url}
              alt={story.display_name || story.username || 'User'}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <img
              src="/icon-line-light.png"
              alt={story.display_name || story.username || 'User'}
              style={{
                width: '80%',
                height: '80%',
                objectFit: 'contain',
              }}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <strong style={{ color: '#ffffff', fontSize: '14px' }}>
            {story.display_name || story.username || 'Unknown User'}
            </strong>
            <span style={{ color: '#737373', fontSize: '12px' }}>
              @{story.username}
            </span>
            <span style={{ color: '#737373', fontSize: '12px' }}>
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
            color: '#737373',
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
          color: '#ffffff',
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
          borderTop: '0.5px solid #1a1a1a',
        }}
      >
        <LikeButton storyId={story.id} storyAuthorId={story.user_id} likeCount={story.like_count || 0} onLike={onRefresh} />
        <ShareButton storyId={story.id} />
        <span style={{ color: 'var(--secondary-text, #a8a8a8)', fontSize: '14px' }}>
          💬 {story.comment_count || 0} {story.comment_count === 1 ? 'comment' : 'comments'}
        </span>
      </div>
    </div>
  )
}

export default StoryDetail
