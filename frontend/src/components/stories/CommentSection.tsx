import { useState, useEffect } from 'react'
import { apiGet, apiPost, ApiException } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

interface Comment {
  id: number
  user_id: number
  username?: string
  content: string
  created_at: string
}

interface CommentSectionProps {
  storyId: number
  commentCount?: number
  compact?: boolean
  onComment?: () => void
}

function CommentSection({
  storyId,
  commentCount: initialCommentCount,
  compact = false,
  onComment,
}: CommentSectionProps) {
  const { isAuthenticated } = useAuth()
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
      await apiPost('/comments', {
        story_id: storyId,
        content: newComment.trim(),
      })

      setNewComment('')
      setCommentCount((prev) => prev + 1)
      if (!compact) {
        fetchComments()
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

  if (compact) {
    return (
      <div onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowComments(!showComments)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>💬</span>
          <span>{commentCount}</span>
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
            gap: '4px',
          }}
        >
          <span>💬</span>
          <span>{commentCount} {commentCount === 1 ? 'comment' : 'comments'}</span>
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
                style={{ width: '100%', marginBottom: '8px' }}
                disabled={isLoading}
              />
              <button type="submit" disabled={isLoading || !newComment.trim()}>
                {isLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </form>
          )}

          <div>
            {comments.map((comment) => (
              <div
                key={comment.id}
                style={{
                  padding: '8px',
                  marginBottom: '8px',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <strong>{comment.username || 'Unknown User'}</strong>
                  <span style={{ color: '#666', fontSize: '0.9em' }}>
                    {formatDate(comment.created_at)}
                  </span>
                </div>
                <div>{comment.content}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default CommentSection
