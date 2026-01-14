import { useState } from 'react'
import { apiPost, ApiException } from '../../services/api'
import { generateShareUrl } from '../../utils/share'

interface ShareButtonProps {
  storyId: number
}

function ShareButton({ storyId }: ShareButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation()

    setIsLoading(true)

    try {
      // Generate share token
      const response = await apiPost<{ token: string }>('/shares', {
        story_id: storyId,
      })

      const url = generateShareUrl(response.token)
      setShareUrl(url)

      // Copy to clipboard
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      if (err instanceof ApiException) {
        console.error('Failed to generate share link:', err.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <button
        onClick={handleShare}
        disabled={isLoading}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          borderRadius: '8px',
          color: 'var(--secondary-text, #a8a8a8)',
          transition: 'background-color 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'var(--button-hover-bg, #1f1f1f)'
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        <span style={{ fontSize: '20px' }}>🔗</span>
        <span style={{ fontSize: '14px' }}>{copied ? 'Copied!' : ''}</span>
      </button>
      {shareUrl && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: 'var(--secondary-text, #a8a8a8)' }}>
          {shareUrl}
        </div>
      )}
    </div>
  )
}

export default ShareButton
