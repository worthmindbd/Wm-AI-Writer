import { useState } from 'react'
import Hero from './components/Hero'
import ApiKeyInput from './components/ApiKeyInput'
import ContentInput from './components/ContentInput'
import RewriteInput from './components/RewriteInput'
import ContentGenerator from './components/ContentGenerator'
import Header from './components/Header'
import HomeSections from './components/HomeSections'
import ToastContainer from './components/Toast'
import { ThemeProvider } from './contexts/ThemeContext'
import { ApiKeyProvider } from './contexts/ApiKeyContext'
import { ToastProvider } from './contexts/ToastContext'
import { GeneratedContent } from './types'

function App() {
  const [currentStep, setCurrentStep] = useState<'hero' | 'input' | 'rewrite' | 'result'>('hero')
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)

  const handleChooseMode = (mode: 'write' | 'rewrite') => {
    setCurrentStep(mode === 'write' ? 'input' : 'rewrite')
  }

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

            {/* Header */}
            <Header />

            {/* Main */}
            <main className="container mx-auto px-4 sm:px-6 py-6 pb-24 pt-24 max-w-7xl">
              {currentStep === 'hero' && (
                <>
                  <Hero onChooseMode={handleChooseMode} />
                  <HomeSections />
                </>
              )}

              {currentStep === 'input' && (
                <>
                  <Hero onChooseMode={handleChooseMode} compact />
                  <ApiKeyInput />
                  <ContentInput onContentGenerated={(c) => { setGeneratedContent(c); setCurrentStep('result') }} />
                </>
              )}

              {currentStep === 'rewrite' && (
                <>
                  <Hero onChooseMode={handleChooseMode} compact />
                  <ApiKeyInput />
                  <RewriteInput onContentRewritten={(c) => { setGeneratedContent(c); setCurrentStep('result') }} />
                </>
              )}

              {currentStep === 'result' && generatedContent && (
                <>
                  <Hero onChooseMode={handleChooseMode} compact />
                  <ContentGenerator
                    content={generatedContent}
                    onBack={() => setCurrentStep(generatedContent.isRewrite ? 'rewrite' : 'input')}
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
