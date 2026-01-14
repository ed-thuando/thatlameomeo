import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiDelete, ApiException } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import { updateUserScore } from '../../hooks/useUserScoreUpdate'

interface LikeButtonProps {
  storyId: number
  storyAuthorId?: number
  likeCount?: number
  onLike?: () => void
}

function LikeButton({ storyId, storyAuthorId, likeCount: initialLikeCount, onLike }: LikeButtonProps) {
  const { isAuthenticated } = useAuth()
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount || 0)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      checkLikeStatus()
    }
  }, [storyId, isAuthenticated])

  const checkLikeStatus = async () => {
    try {
      const response = await apiGet<{ isLiked: boolean; likeCount: number }>(
        `/likes?story_id=${storyId}`
      )
      setIsLiked(response.isLiked)
      setLikeCount(response.likeCount)
    } catch (err) {
      // Silently fail - user might not be authenticated
      console.error('Failed to check like status:', err)
    }
  }

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation()

    if (!isAuthenticated) {
      return
    }

    setIsLoading(true)

    try {
      let response
      if (isLiked) {
        response = await apiDelete<{ isLiked: boolean; likeCount: number; daily_meomeo_score?: number; updated_user_id?: number }>(`/likes?story_id=${storyId}`)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        response = await apiPost<{ isLiked: boolean; likeCount: number; daily_meomeo_score?: number; updated_user_id?: number }>(`/likes`, { story_id: storyId })
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }

      // Update user score immediately if available
      if (response?.updated_user_id && response?.daily_meomeo_score !== undefined) {
        updateUserScore(response.updated_user_id, response.daily_meomeo_score)
      } else if (storyAuthorId && response?.daily_meomeo_score !== undefined) {
        updateUserScore(storyAuthorId, response.daily_meomeo_score)
      }

      // Refresh daily score after like/unlike
      if (onLike) {
        onLike()
      }
    } catch (err) {
      if (err instanceof ApiException) {
        console.error('Failed to toggle like:', err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={!isAuthenticated || isLoading}
      style={{
        background: 'none',
        border: 'none',
        cursor: isAuthenticated ? 'pointer' : 'not-allowed',
        color: isLiked ? '#ff3040' : '#737373',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        borderRadius: '8px',
        transition: 'background-color 0.2s',
      }}
      onMouseEnter={(e) => {
        if (isAuthenticated) {
          e.currentTarget.style.backgroundColor = 'var(--button-hover-bg, #1f1f1f)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = 'transparent'
      }}
    >
      {isLiked ? (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#ff3040" stroke="#ff3040" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ) : (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      )}
      {likeCount > 0 && (
        <span style={{ fontSize: '14px', color: '#737373' }}>
          {likeCount}
        </span>
      )}
    </button>
  )
}

export default LikeButton
