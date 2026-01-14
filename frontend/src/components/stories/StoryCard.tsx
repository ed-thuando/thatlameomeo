import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import ShareButton from './ShareButton'
import { useNavigate } from 'react-router-dom'

interface StoryCardProps {
  story: {
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
  showActions?: boolean
  onArchive?: (storyId: number) => void
  onDelete?: (storyId: number) => void
  onRefresh?: () => void
}

function StoryCard({
  story,
  showActions = true,
  onArchive,
  onDelete,
  onRefresh,
}: StoryCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const isOwner = user?.id === story.user_id

  const handleStoryClick = () => {
    navigate(`/post/${story.id}`)
  }

  const handleArchive = () => {
    if (onArchive && isOwner) {
      onArchive(story.id)
    }
  }

  const handleDelete = () => {
    if (onDelete && isOwner) {
      onDelete(story.id)
      setShowDeleteConfirm(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
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
        padding: '16px',
        marginBottom: '16px',
        cursor: 'pointer',
      }}
      onClick={handleStoryClick}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <div>
          <strong>{story.username || 'Unknown User'}</strong>
          {story.daily_meomeo_score !== undefined && (
            <span style={{ marginLeft: '8px', color: '#666' }}>
              🐱 {story.daily_meomeo_score} MeoMeo
            </span>
          )}
        </div>
        <span style={{ color: '#666', fontSize: '0.9em' }}>
          {formatDate(story.created_at)}
        </span>
      </div>

      <div style={{ marginBottom: '12px', whiteSpace: 'pre-wrap' }}>{story.content}</div>

      {showActions && (
        <div
          style={{ display: 'flex', gap: '16px', alignItems: 'center' }}
          onClick={(e) => e.stopPropagation()}
        >
          <LikeButton storyId={story.id} likeCount={story.like_count || 0} onLike={onRefresh} />
          <CommentSection
            storyId={story.id}
            commentCount={story.comment_count || 0}
            compact={true}
            onComment={onRefresh}
          />
          <ShareButton storyId={story.id} />
        </div>
      )}

      {isOwner && (onArchive || onDelete) && (
        <div
          style={{ marginTop: '12px', display: 'flex', gap: '8px' }}
          onClick={(e) => e.stopPropagation()}
        >
          {onArchive && (
            <button onClick={handleArchive} style={{ fontSize: '0.9em' }}>
              Archive
            </button>
          )}
          {onDelete && (
            <>
              {showDeleteConfirm ? (
                <>
                  <button onClick={handleDelete} style={{ color: 'red' }}>
                    Confirm Delete
                  </button>
                  <button onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                </>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} style={{ color: 'red' }}>
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default StoryCard
