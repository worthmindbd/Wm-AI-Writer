import { useContext, useState } from 'react'
import { ApiKeyContext } from '../contexts/ApiKeyContext'
import { useToast } from '../contexts/ToastContext'
import { GEMINI_MODELS } from '../services/gemini'

export default function ApiKeyInput() {
  const context = useContext(ApiKeyContext)
  if (!context) throw new Error('ApiKeyInput must be used within ApiKeyProvider')
  const { apiKey, setApiKey, isConfigured, showKey, toggleShowKey, testApiKey, selectedModel, setSelectedModel } = context
  const { showToast } = useToast()
  const [isTesting, setIsTesting] = useState(false)

  const handleTest = async () => {
    setIsTesting(true)
    try { await testApiKey(); showToast('API key validated successfully!', 'success') }
    catch (err) { showToast(err instanceof Error ? err.message : 'Invalid API key', 'error') }
    finally { setIsTesting(false) }
  }

  return (
    <div className="card max-w-2xl mx-auto mb-6">
      <h2 className="text-xl font-semibold text-forest dark:text-forest-light mb-1">Google Gemini API Key</h2>
      <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-4">
        Stored only in your browser.{' '}
        <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-forest dark:text-forest-light hover:underline">Get your key →</a>
      </p>
      <div className="space-y-3">
        <div className="relative">
          <input type={showKey ? 'text' : 'password'} value={apiKey} onChange={e => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key" className="input-field pr-20 text-base" />
          <button onClick={toggleShowKey}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-medium text-forest dark:text-forest-light hover:bg-forest/5 dark:hover:bg-forest-light/10 rounded-lg transition-colors">
            {showKey ? 'Hide' : 'Show'}
          </button>
        </div>
        <div>
          <label htmlFor="model-select" className="block text-xs font-medium mb-1.5 text-earth-dark/60 dark:text-light-cream/60">AI Model</label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="input-field text-sm"
          >
            {GEMINI_MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.label} - {m.tier === 'free' ? 'Free' : 'Paid'}{m.recommended ? ' (Recommended)' : ''}
              </option>
            ))}
          </select>
        </div>
        <div className="flex gap-2">
          <button onClick={handleTest} disabled={!apiKey || isTesting} className="btn-secondary flex-1 text-sm">
            {isTesting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-forest/20 border-t-forest dark:border-t-forest-light rounded-full animate-spin" />Testing…
              </span>
            ) : 'Test API Key'}
          </button>
          {apiKey && (
            <button onClick={() => { setApiKey(''); showToast('API key cleared', 'info') }}
              className="px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-sm min-h-[44px]">Clear</button>
          )}
        </div>
        <div className={`flex items-center gap-2 text-sm font-medium ${isConfigured ? 'text-green-600 dark:text-green-400' : 'text-earth-dark/40 dark:text-light-cream/40'}`}>
          <span className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-gray-400'}`} />
          {isConfigured ? 'API Key Configured' : 'API Key Not Configured'}
        </div>
      </div>
    </div>
  )
}
