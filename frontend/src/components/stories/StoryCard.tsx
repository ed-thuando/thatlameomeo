import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LikeButton from './LikeButton'
import CommentSection from './CommentSection'
import ShareButton from './ShareButton'
import { useNavigate } from 'react-router-dom'
import { apiPut, ApiException } from '../../services/api'

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
  onInteraction?: () => void
}

function StoryCard({
  story,
  showActions = true,
  onArchive,
  onDelete,
  onRefresh,
  onInteraction,
}: StoryCardProps) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false)
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false)
  const [currentVisibility, setCurrentVisibility] = useState<'public' | 'private'>(story.visibility as 'public' | 'private')
  const isOwner = user?.id === story.user_id

  // Sync local visibility state with prop changes
  useEffect(() => {
    setCurrentVisibility(story.visibility as 'public' | 'private')
  }, [story.visibility])

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

  const handleVisibilityChange = async (newVisibility: 'public' | 'private') => {
    if (!isOwner || isUpdatingVisibility || currentVisibility === newVisibility) {
      return
    }

    setIsUpdatingVisibility(true)
    setShowVisibilityMenu(false)
    
    // Optimistically update UI immediately
    setCurrentVisibility(newVisibility)
    
    try {
      await apiPut(`/stories/${story.id}`, { visibility: newVisibility })
      // UI already updated, just refresh parent if needed
      if (onRefresh) {
        onRefresh()
      }
    } catch (err) {
      // Revert on error
      setCurrentVisibility(story.visibility as 'public' | 'private')
      if (err instanceof ApiException) {
        console.error('Failed to update visibility:', err.message)
      }
    } finally {
      setIsUpdatingVisibility(false)
    }
  }

  // Close visibility menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (showVisibilityMenu && !target.closest('[data-visibility-menu]')) {
        setShowVisibilityMenu(false)
      }
    }

    if (showVisibilityMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showVisibilityMenu])

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
        backgroundColor: '#000000',
        border: '0.5px solid #1a1a1a',
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '12px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
      }}
      onClick={handleStoryClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#0a0a0a'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#000000'
      }}
    >
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
        <img
          src="/icon-line-light.png"
          alt={story.username || 'User'}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            flexShrink: 0,
            objectFit: 'cover',
          }}
        />
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
            <span style={{ color: '#737373', fontSize: '12px' }}>
              · {formatTimeAgo(story.created_at)}
            </span>
            {isOwner && (
              <div
                data-visibility-menu
                style={{
                  position: 'relative',
                  marginLeft: '4px',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowVisibilityMenu(!showVisibilityMenu)
                  }}
                  disabled={isUpdatingVisibility}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: isUpdatingVisibility ? 'not-allowed' : 'pointer',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  title="Change visibility"
                >
                  {currentVisibility === 'public' ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--visibility-icon-public, #737373)" strokeWidth="var(--icon-stroke-width, 1.5)">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 2a15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0-4-10 15.3 15.3 0 0 0 4-10z" />
                      <path d="M2 12h20" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--visibility-icon-private, #525252)" strokeWidth="var(--icon-stroke-width, 1.5)">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  )}
                </button>
                {showVisibilityMenu && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: '4px',
                      backgroundColor: 'var(--card-bg, #000000)',
                      border: 'var(--border-width, 0.5px) solid var(--border-color, #1a1a1a)',
                      borderRadius: '8px',
                      padding: '4px',
                      minWidth: '120px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
                      zIndex: 1000,
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVisibilityChange('public')
                      }}
                      disabled={isUpdatingVisibility || currentVisibility === 'public'}
                      style={{
                        width: '100%',
                        background: currentVisibility === 'public' ? 'var(--sidebar-active-bg, #1a1a1a)' : 'transparent',
                        border: 'none',
                        color: 'var(--text-color, #ffffff)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: isUpdatingVisibility || currentVisibility === 'public' ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (currentVisibility !== 'public' && !isUpdatingVisibility) {
                          e.currentTarget.style.backgroundColor = 'var(--button-hover-bg, #1a1a1a)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = currentVisibility === 'public' ? 'var(--sidebar-active-bg, #1a1a1a)' : 'transparent'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={currentVisibility === 'public' ? 'var(--text-color, #ffffff)' : 'var(--visibility-icon-public, #737373)'} strokeWidth="var(--icon-stroke-width, 1.5)">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 2a15.3 15.3 0 0 0 4 10 15.3 15.3 0 0 0-4 10 15.3 15.3 0 0 0-4-10 15.3 15.3 0 0 0 4-10z" />
                        <path d="M2 12h20" />
                      </svg>
                      <span>Public</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVisibilityChange('private')
                      }}
                      disabled={isUpdatingVisibility || currentVisibility === 'private'}
                      style={{
                        width: '100%',
                        background: currentVisibility === 'private' ? 'var(--sidebar-active-bg, #1a1a1a)' : 'transparent',
                        border: 'none',
                        color: 'var(--text-color, #ffffff)',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: isUpdatingVisibility || currentVisibility === 'private' ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        if (currentVisibility !== 'private' && !isUpdatingVisibility) {
                          e.currentTarget.style.backgroundColor = 'var(--button-hover-bg, #1a1a1a)'
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = currentVisibility === 'private' ? 'var(--sidebar-active-bg, #1a1a1a)' : 'transparent'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={currentVisibility === 'private' ? 'var(--text-color, #ffffff)' : 'var(--visibility-icon-private, #525252)'} strokeWidth="var(--icon-stroke-width, 1.5)">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <span>Private</span>
                    </button>
                  </div>
                )}
              </div>
            )}
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
            borderTop: '0.5px solid #1a1a1a',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <LikeButton 
            storyId={story.id} 
            storyAuthorId={story.user_id}
            likeCount={story.like_count || 0} 
            onLike={() => {
              if (onRefresh) onRefresh()
              if (onInteraction) onInteraction()
            }} 
          />
          <CommentSection
            storyId={story.id}
            storyAuthorId={story.user_id}
            commentCount={story.comment_count || 0}
            compact={true}
            onComment={() => {
              if (onRefresh) onRefresh()
              if (onInteraction) onInteraction()
            }}
          />
          <ShareButton storyId={story.id} onShare={onInteraction} />
        </div>
      )}

      {isOwner && (onArchive || onDelete) && (
        <div
          style={{
            marginTop: '12px',
            display: 'flex',
            gap: '8px',
            paddingTop: '8px',
            borderTop: '0.5px solid #1a1a1a',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {onArchive && (
            <button
              onClick={handleArchive}
              style={{
                fontSize: '12px',
                background: 'none',
                border: '0.5px solid #1a1a1a',
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
                    border: '0.5px solid #ff4444',
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
                    border: '0.5px solid #1a1a1a',
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
                    border: '0.5px solid #ff4444',
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
