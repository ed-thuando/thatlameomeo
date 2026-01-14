import { useState, useEffect } from 'react'
import { apiGet, ApiException } from '../services/api'

interface DailyScoreResponse {
  daily_meomeo_score: number
}

/**
 * Hook to fetch and manage daily MeoMeo score for a user
 */
export function useDailyScore(userId?: number) {
  const [dailyScore, setDailyScore] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDailyScore = async (targetUserId?: number) => {
    const id = targetUserId || userId
    if (!id) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await apiGet<DailyScoreResponse>(`/users/${id}/daily-score`)
      setDailyScore(response.daily_meomeo_score)
    } catch (err) {
      if (err instanceof ApiException) {
        setError(err.message)
      } else {
        setError('Failed to fetch daily score')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchDailyScore()
    }
  }, [userId])

  return {
    dailyScore,
    isLoading,
    error,
    refetch: () => fetchDailyScore(),
  }
}
