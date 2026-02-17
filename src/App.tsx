import { useState } from 'react'
import Hero from './components/Hero'
import ApiKeyInput from './components/ApiKeyInput'
import ContentInput from './components/ContentInput'
import ContentGenerator from './components/ContentGenerator'
import ThemeToggle from './components/ThemeToggle'
import ToastContainer from './components/Toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { ApiKeyProvider } from './contexts/ApiKeyContext'
import { ToastProvider } from './contexts/ToastContext'
import { GeneratedContent } from './types'

function App() {
  const [currentStep, setCurrentStep] = useState<'hero' | 'input' | 'result'>('hero')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)

  return (
    <ThemeProvider>
      <ApiKeyProvider>
        <ToastProvider>
          <div className="min-h-screen bg-gradient-to-br from-cream via-sage/5 to-cream dark:from-dark-earth dark:via-[#1a2518] dark:to-dark-earth text-earth-dark dark:text-light-cream transition-colors duration-300 relative">
            {/* Background decoration */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-forest/5 dark:bg-forest-light/5 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sage/8 dark:bg-sage/3 rounded-full blur-3xl" />
            </div>

            {/* Theme Toggle */}
            <header className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </header>

            {/* Main */}
            <main className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
              {currentStep === 'hero' && <Hero onStart={() => setCurrentStep('input')} />}

              {currentStep === 'input' && (
                <>
                  <Hero onStart={() => { }} compact />
                  <ApiKeyInput />
                  <ContentInput onContentGenerated={(c) => { setGeneratedContent(c); setCurrentStep('result') }} />
                </>
              )}

              {currentStep === 'result' && generatedContent && (
                <>
                  <Hero onStart={() => { }} compact />
                  <ContentGenerator
                    content={generatedContent}
                    onBack={() => setCurrentStep('input')}
                    onContentUpdate={setGeneratedContent}
                  />
                </>
              )}
            </main>

            <ToastContainer />
          </div>
        </ToastProvider>
      </ApiKeyProvider>
    </ThemeProvider>
  )
}

export default App
