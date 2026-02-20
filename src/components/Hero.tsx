interface HeroProps { onChooseMode: (mode: 'write' | 'rewrite') => void; compact?: boolean }

export default function Hero({ onChooseMode, compact = false }: HeroProps) {
  if (compact) {
    return (
      <div className="text-center py-4 mb-2">
        <h1 className="text-lg sm:text-xl font-bold text-forest dark:text-forest-light tracking-tight">Wm AI Writer</h1>
      </div>
    )
  }

  return (
    <section className="relative min-h-[85vh] flex items-center justify-center py-16 px-4 overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-forest/10 dark:bg-forest-light/10 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-sage/15 dark:bg-sage/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-moss/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm font-medium text-forest dark:text-forest-light mb-8">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Powered by Google Gemini AI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-earth-dark dark:text-light-cream mb-6 leading-[1.1] tracking-tight text-balance">
          Create & Rewrite <span className="text-transparent bg-clip-text bg-gradient-to-r from-forest to-moss dark:from-forest-light dark:to-sage">SEO-Optimized</span> Content
        </h1>

        <p className="text-lg sm:text-xl text-earth-dark/60 dark:text-light-cream/60 mb-10 max-w-2xl mx-auto leading-relaxed text-balance">
          Write fresh AI-powered articles or rewrite existing posts for better SEO — with smart keyword integration, image prompts, and WordPress-ready formatting.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button onClick={() => onChooseMode('write')} className="btn-primary text-lg px-10 py-4 rounded-2xl shadow-xl shadow-forest/20 hover:shadow-2xl hover:shadow-forest/30">
            ✍️ Write New Content
          </button>
          <button onClick={() => onChooseMode('rewrite')} className="btn-secondary text-lg px-10 py-4 rounded-2xl shadow-lg">
            🔄 Rewrite Existing Post
          </button>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mt-10">
          {['SEO Optimized', 'Content Rewriting', 'Image Prompts', 'Multi-Language', 'Internal Linking', 'WordPress Ready'].map(f => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs font-medium glass text-earth-dark/60 dark:text-light-cream/60">{f}</span>
          ))}
        </div>
      </div>
    </section>
  )
}
