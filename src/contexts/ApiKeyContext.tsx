import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { validateApiKey } from '../services/gemini'

interface ApiKeyContextType {
  apiKey: string
  setApiKey: (key: string) => void
  isConfigured: boolean
  showKey: boolean
  toggleShowKey: () => void
  testApiKey: () => Promise<void>
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined)

const API_KEY_STORAGE = 'mantle_gemini_api_key'

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState('')
  const [showKey, setShowKey] = useState(false)

  // Load API key from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE)
    if (saved) {
      setApiKeyState(saved)
    }
  }, [])

  const setApiKey = (key: string) => {
    setApiKeyState(key)
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key)
    } else {
      localStorage.removeItem(API_KEY_STORAGE)
    }
  }

  const isConfigured = apiKey.trim().length > 0

  const toggleShowKey = () => {
    setShowKey(prev => !prev)
  }

  const testApiKey = async () => {
    const valid = await validateApiKey(apiKey)
    if (!valid) {
      throw new Error('Invalid API key. Please check your key and try again.')
    }
  }

  return (
    <ApiKeyContext.Provider value={{
      apiKey,
      setApiKey,
      isConfigured,
      showKey,
      toggleShowKey,
      testApiKey
    }}>
      {children}
    </ApiKeyContext.Provider>
  )
}

export function useApiKey() {
  const context = useContext(ApiKeyContext)
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider')
  }
  return context
}

export { ApiKeyContext }
