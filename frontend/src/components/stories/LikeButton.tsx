import { useState, useEffect } from 'react'
import { apiGet, apiPost, apiDelete, ApiException } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

interface LikeButtonProps {
  storyId: number
  likeCount?: number
  onLike?: () => void
}

function LikeButton({ storyId, likeCount: initialLikeCount, onLike }: LikeButtonProps) {
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
      if (isLiked) {
        await apiDelete(`/likes?story_id=${storyId}`)
        setIsLiked(false)
        setLikeCount((prev) => Math.max(0, prev - 1))
      } else {
        await apiPost(`/likes`, { story_id: storyId })
        setIsLiked(true)
        setLikeCount((prev) => prev + 1)
      }

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
        color: isLiked ? '#ff3040' : 'var(--secondary-text, #a8a8a8)',
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
      <span style={{ fontSize: '20px' }}>{isLiked ? '❤️' : '🤍'}</span>
      <span style={{ fontSize: '14px', color: 'var(--secondary-text, #a8a8a8)' }}>
        {likeCount > 0 ? likeCount : ''}
      </span>
    </button>
  )
}

export default LikeButton
