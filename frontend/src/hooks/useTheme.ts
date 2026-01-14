import { useState, useEffect } from 'react'
import { apiGet, apiPut, ApiException } from '../services/api'
import { useAuth } from './useAuth'

const THEME_STORAGE_KEY = 'theme_preference'

const themes = {
  default: {
    '--primary-color': '#007bff',
    '--secondary-color': '#6c757d',
    '--background-color': '#ffffff',
    '--text-color': '#212529',
    '--border-color': '#dee2e6',
  },
  'orange-cat': {
    '--primary-color': '#ff8c00',
    '--secondary-color': '#ffa500',
    '--background-color': '#fff8dc',
    '--text-color': '#8b4513',
    '--border-color': '#ffa500',
  },
  'gray-cat': {
    '--primary-color': '#708090',
    '--secondary-color': '#778899',
    '--background-color': '#f5f5f5',
    '--text-color': '#2f4f4f',
    '--border-color': '#a9a9a9',
  },
  'calico-cat': {
    '--primary-color': '#daa520',
    '--secondary-color': '#cd853f',
    '--background-color': '#fffacd',
    '--text-color': '#654321',
    '--border-color': '#daa520',
  },
}

export function useTheme() {
  const { isAuthenticated, user } = useAuth()
  const [theme, setThemeState] = useState<string>('default')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadTheme()
  }, [isAuthenticated, user?.id])

  const loadTheme = async () => {
    setIsLoading(true)

    try {
      // Try to load from server if authenticated
      if (isAuthenticated && user?.id) {
        try {
          const response = await apiGet<{ theme_preference: string }>(`/users/${user.id}`)
          if (response.theme_preference) {
            setThemeState(response.theme_preference)
            applyTheme(response.theme_preference)
            setIsLoading(false)
            return
          }
        } catch (err) {
          // Fall back to localStorage if server fetch fails
        }
      }

      // Fall back to localStorage
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme && themes[savedTheme as keyof typeof themes]) {
        setThemeState(savedTheme)
        applyTheme(savedTheme)
      } else {
        applyTheme('default')
      }
    } catch (error) {
      console.error('Error loading theme:', error)
      applyTheme('default')
    } finally {
      setIsLoading(false)
    }
  }

  const applyTheme = (themeName: string) => {
    const themeVars = themes[themeName as keyof typeof themes] || themes.default
    const root = document.documentElement

    Object.entries(themeVars).forEach(([key, value]) => {
      root.style.setProperty(key, value)
    })
  }

  const setTheme = async (themeName: string) => {
    if (!themes[themeName as keyof typeof themes]) {
      console.error('Invalid theme:', themeName)
      return
    }

    setThemeState(themeName)
    applyTheme(themeName)
    localStorage.setItem(THEME_STORAGE_KEY, themeName)

    // Save to server if authenticated
    if (isAuthenticated) {
      try {
        await apiPut('/users/me/theme', { theme: themeName })
      } catch (err) {
        if (err instanceof ApiException) {
          console.error('Failed to save theme to server:', err.message)
        }
      }
    }
  }

  return {
    theme,
    setTheme,
    isLoading,
  }
}
