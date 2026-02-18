import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { validateApiKey, DEFAULT_MODEL } from '../services/gemini'

interface ApiKeyContextType {
  apiKey: string
  setApiKey: (key: string) => void
  isConfigured: boolean
  showKey: boolean
  toggleShowKey: () => void
  testApiKey: () => Promise<void>
  selectedModel: string
  setSelectedModel: (model: string) => void
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined)

const API_KEY_STORAGE = 'mantle_gemini_api_key'
const MODEL_STORAGE = 'wm_selected_model'

export function ApiKeyProvider({ children }: { children: ReactNode }) {
  const [apiKey, setApiKeyState] = useState('')
  const [showKey, setShowKey] = useState(false)
  const [selectedModel, setSelectedModelState] = useState(DEFAULT_MODEL)

  // Load API key and model from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(API_KEY_STORAGE)
    if (saved) {
      setApiKeyState(saved)
    }
    const savedModel = localStorage.getItem(MODEL_STORAGE)
    if (savedModel) {
      setSelectedModelState(savedModel)
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

  const setSelectedModel = (model: string) => {
    setSelectedModelState(model)
    localStorage.setItem(MODEL_STORAGE, model)
  }

  const isConfigured = apiKey.trim().length > 0

  const toggleShowKey = () => {
    setShowKey(prev => !prev)
  }

  const testApiKey = async () => {
    const valid = await validateApiKey(apiKey, selectedModel)
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
      testApiKey,
      selectedModel,
      setSelectedModel
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

