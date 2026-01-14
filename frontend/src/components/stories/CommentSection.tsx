import { useState, useEffect } from 'react'
import { apiGet, apiPost, ApiException } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { updateUserScore } from '../../hooks/useUserScoreUpdate'

interface Comment {
  id: number
  user_id: number
  username?: string
  content: string
  created_at: string
}

interface CommentSectionProps {
  storyId: number
  storyAuthorId?: number
  commentCount?: number
  compact?: boolean
  onComment?: () => void
}

function CommentSection({
  storyId,
  storyAuthorId,
  commentCount: initialCommentCount,
  compact = false,
  onComment,
}: CommentSectionProps) {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [comments, setComments] = useState<Comment[]>([])
  const [commentCount, setCommentCount] = useState(initialCommentCount || 0)
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showComments, setShowComments] = useState(!compact)

  useEffect(() => {
    if (showComments && !compact) {
      fetchComments()
    }
  }, [storyId, showComments, compact])

  const fetchComments = async () => {
    try {
      const response = await apiGet<{ comments: Comment[]; total: number }>(
        `/comments?story_id=${storyId}`
      )
      setComments(response.comments)
      setCommentCount(response.total)
    } catch (err) {
      if (err instanceof ApiException) {
        console.error('Failed to fetch comments:', err.message)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated || !newComment.trim()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await apiPost<{ id: number; user_id: number; story_id: number; content: string; created_at: string; commentCount?: number; daily_meomeo_score?: number; updated_user_id?: number }>('/comments', {
        story_id: storyId,
        content: newComment.trim(),
      })

      setNewComment('')
      setCommentCount((prev) => prev + 1)
      if (!compact) {
        fetchComments()
      }

      // Update user score immediately if available
      if (response?.updated_user_id && response?.daily_meomeo_score !== undefined) {
        updateUserScore(response.updated_user_id, response.daily_meomeo_score)
      } else if (storyAuthorId && response?.daily_meomeo_score !== undefined) {
        updateUserScore(storyAuthorId, response.daily_meomeo_score)
      }

      if (onComment) {
        onComment()
      }
    } catch (err) {
      if (err instanceof ApiException) {
        console.error('Failed to post comment:', err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
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

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/post/${storyId}`)
  }

  if (compact) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <button
          onClick={handleCommentClick}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '8px',
            color: '#a8a8a8',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#1f1f1f'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {commentCount > 0 && (
            <span style={{ fontSize: '14px', color: '#737373' }}>
              {commentCount}
            </span>
          )}
        </button>
      </div>
    )
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <div style={{ marginBottom: '8px' }}>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '8px',
            color: '#737373',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--button-hover-bg, #1f1f1f)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span style={{ fontSize: '14px', color: '#a8a8a8' }}>
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </span>
        </button>
      </div>

      {showComments && (
        <>
          {isAuthenticated && (
            <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                rows={3}
                style={{
                  width: '100%',
                  marginBottom: '8px',
                  backgroundColor: 'var(--card-bg, #1a1a1a)',
                  border: '0.5px solid #1a1a1a',
                  borderRadius: '8px',
                  color: '#ffffff',
                  padding: '12px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'none',
                  outline: 'none',
                }}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                style={{
                  backgroundColor: newComment.trim() ? 'var(--primary-color, #ffffff)' : 'var(--button-disabled-bg, #333)',
                  color: newComment.trim() ? '#000000' : '#a8a8a8',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: newComment.trim() && !isLoading ? 'pointer' : 'not-allowed',
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {isLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          <div>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '12px',
                  marginBottom: '8px',
                  backgroundColor: '#000000',
                  border: '0.5px solid #1a1a1a',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <strong style={{ color: '#ffffff', fontSize: '14px' }}>
                    {comment.username || 'Unknown User'}
                  </strong>
                  <span style={{ color: '#737373', fontSize: '12px' }}>
                    {formatTimeAgo(comment.created_at)}
                  </span>
                </div>
                <div style={{ color: '#ffffff', fontSize: '14px', lineHeight: '1.5' }}>
                  {comment.content}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CommentSection
