import { useState } from 'react'
import { apiPost, ApiException } from '../../services/api'
import { generateShareUrl } from '../../utils/share'

interface ShareButtonProps {
  storyId: number
  onShare?: () => void
}

function ShareButton({ storyId, onShare }: ShareButtonProps) {
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

      // Trigger interaction callback
      if (onShare) {
        onShare()
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
          color: '#737373',
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
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#737373" strokeWidth="1.5">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        {copied && (
          <span style={{ fontSize: '12px', color: '#4caf50' }}>Copied!</span>
        )}
      </button>
      {shareUrl && (
        <div style={{ marginTop: '4px', fontSize: '12px', color: '#737373' }}>
          {shareUrl}
        </div>
      )}
    </div>
  )
}

export default ShareButton
