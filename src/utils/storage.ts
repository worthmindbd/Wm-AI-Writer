// LocalStorage utility functions with type safety

const STORAGE_KEYS = {
  API_KEY: 'mantle_gemini_api_key',
  THEME: 'theme',
} as const

export const storage = {
  // API Key
  getApiKey: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.API_KEY)
  },

  setApiKey: (key: string): void => {
    if (key) {
      localStorage.setItem(STORAGE_KEYS.API_KEY, key)
    } else {
      localStorage.removeItem(STORAGE_KEYS.API_KEY)
    }
  },

  // Theme
  getTheme: (): 'light' | 'dark' | null => {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME)
    return theme === 'light' || theme === 'dark' ? theme : null
  },

  setTheme: (theme: 'light' | 'dark'): void => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme)
  },
}
