import { useCallback, useEffect } from 'react'

type ScoreUpdateCallback = (userId: number, newScore: number) => void

// Global registry for score update callbacks
const scoreUpdateCallbacks = new Set<ScoreUpdateCallback>()

/**
 * Hook to register a callback for user score updates
 * This allows components to update specific user scores without refetching all data
 */
export function useUserScoreUpdate(callback: ScoreUpdateCallback) {
  useEffect(() => {
    scoreUpdateCallbacks.add(callback)
    return () => {
      scoreUpdateCallbacks.delete(callback)
    }
  }, [callback])
}

/**
 * Function to trigger score updates across all registered callbacks
 */
export function updateUserScore(userId: number, newScore: number) {
  scoreUpdateCallbacks.forEach((callback) => {
    try {
      callback(userId, newScore)
    } catch (error) {
      console.error('Error in score update callback:', error)
    }
  })
}
