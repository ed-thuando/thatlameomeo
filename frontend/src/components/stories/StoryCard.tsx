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
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onClick={handleStoryClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-hover-bg, #1f1f1f)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'var(--card-bg, #1a1a1a)'
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
          {story.username?.[0]?.toUpperCase() || '?'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <strong style={{ color: '#ffffff', fontSize: '14px' }}>
              {story.username || 'Unknown User'}
            </strong>
            {story.daily_meomeo_score !== undefined && (
              <span style={{ color: 'var(--secondary-text, #a8a8a8)', fontSize: '12px' }}>
                🐱 {story.daily_meomeo_score}
              </span>
            )}
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
          color: '#ffffff',
          fontSize: '14px',
          lineHeight: '1.5',
        }}
      >
        {story.content}
      </div>

      {showActions && (
        <div
          style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-color, #262626)',
          }}
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
          style={{
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '1px solid var(--border-color, #262626)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onArchive && (
            <button
              onClick={handleArchive}
              style={{
                fontSize: '12px',
                background: 'none',
                border: '1px solid var(--border-color, #262626)',
                color: '#ffffff',
                padding: '4px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              Archive
            </button>
          )}
          {onDelete && (
            <>
              {showDeleteConfirm ? (
                <>
                  <button
                    onClick={handleDelete}
                    style={{
                      fontSize: '12px',
                      background: 'none',
                      border: '1px solid #ff4444',
                      color: '#ff4444',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    style={{
                      fontSize: '12px',
                      background: 'none',
                      border: '1px solid var(--border-color, #262626)',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    fontSize: '12px',
                    background: 'none',
                    border: '1px solid #ff4444',
                    color: '#ff4444',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                >
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
