import { useState } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'
import { useToast } from '../contexts/ToastContext'
import { generateTitles, generateContent, generateMetaDescription, generateLSIKeywords } from '../services/gemini'
import { fetchSitemapLinks } from '../utils/sitemap'
import { GeneratedContent } from '../types'

interface Props { onContentGenerated: (content: GeneratedContent) => void }
type Step = 'keywords' | 'titles' | 'options'

export default function ContentInput({ onContentGenerated }: Props) {
  const { apiKey, isConfigured } = useApiKey()
  const { showToast } = useToast()
  const [step, setStep] = useState<Step>('keywords')
  const [focusKeyword, setFocusKeyword] = useState('')
  const [lsiKeywords, setLsiKeywords] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [titles, setTitles] = useState<string[]>([])
  const [selectedTitle, setSelectedTitle] = useState('')
  const [customTitle, setCustomTitle] = useState('')
  const [wordCount, setWordCount] = useState(1000)
  const [tone, setTone] = useState<'professional' | 'casual' | 'friendly'>('professional')
  const [format, setFormat] = useState<'blog-post' | 'article' | 'product-description'>('blog-post')
  const [language, setLanguage] = useState('English')
  const [sitemapUrl, setSitemapUrl] = useState('')
  const [sitemapLinks, setSitemapLinks] = useState<string[]>([])
  const [sitemapLoading, setSitemapLoading] = useState(false)
  const [lsiLoading, setLsiLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  const lsiArr = lsiKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)

  const handleGenerateTitles = async () => {
    if (!isConfigured) { showToast('Please configure your API key first', 'error'); return }
    setLoading(true)
    try {
      const t = await generateTitles(apiKey, focusKeyword, lsiArr)
      setTitles(t); setStep('titles')
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to generate titles', 'error') }
    finally { setLoading(false) }
  }

  const handleGenerateContent = async () => {
    if (!isConfigured) { showToast('Please configure your API key first', 'error'); return }
    setLoading(true)
    try {
      const content = await generateContent(apiKey, { title: selectedTitle, focusKeyword, lsiKeywords: lsiArr, wordCount, tone, format, language, targetAudience: targetAudience.trim() || undefined, internalLinks: sitemapLinks.length > 0 ? sitemapLinks : undefined })
      const meta = await generateMetaDescription(apiKey, selectedTitle, focusKeyword)
      const slug = selectedTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 60)
      const wc = content.split(/\s+/).length
      onContentGenerated({
        title: selectedTitle, content, metaDescription: meta, urlSlug: slug,
        wordCount: wc, readingTime: Math.ceil(wc / 200),
        focusKeyword, lsiKeywords: lsiArr, tone, format, language, targetAudience, targetWordCount: wordCount, internalLinks: sitemapLinks.length > 0 ? sitemapLinks : undefined,
      })
    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to generate content', 'error') }
    finally { setLoading(false) }
  }

  return (
    <div className="card max-w-2xl mx-auto">
      {/* Loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="glass-strong p-8 rounded-2xl text-center">
            <div className="w-10 h-10 mx-auto mb-4 border-3 border-forest/20 border-t-forest dark:border-t-forest-light rounded-full animate-spin" style={{ borderWidth: '3px' }} />
            <p className="text-sm font-medium text-earth-dark dark:text-light-cream">
              {step === 'keywords' ? 'Researching top-ranking titles…' : 'Generating your content…'}
            </p>
            <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mt-1">This may take a moment</p>
          </div>
        </div>
      )}

      {step === 'keywords' && (
        <>
          <h2 className="text-xl font-semibold text-forest dark:text-forest-light mb-6">Enter Your Keywords</h2>
          <div className="space-y-5">
            <div>
              <label htmlFor="focus-keyword" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Focus Keyword *</label>
              <input id="focus-keyword" type="text" value={focusKeyword} onChange={e => setFocusKeyword(e.target.value)} placeholder="e.g., sustainable living" className="input-field text-base" />
            </div>
            <div>
              <label htmlFor="lsi-keywords" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">LSI Keywords (comma-separated)</label>
              <div className="flex gap-2">
                <input id="lsi-keywords" type="text" value={lsiKeywords} onChange={e => setLsiKeywords(e.target.value)} placeholder="e.g., eco-friendly, green energy, environment" className="input-field text-base flex-1" />
                <button
                  onClick={async () => {
                    if (!focusKeyword.trim()) { showToast('Enter a focus keyword first', 'error'); return }
                    if (!isConfigured) { showToast('Please configure your API key first', 'error'); return }
                    setLsiLoading(true)
                    try {
                      const suggested = await generateLSIKeywords(apiKey, focusKeyword.trim())
                      setLsiKeywords(prev => prev ? `${prev}, ${suggested}` : suggested)
                      showToast('LSI keywords generated!', 'success')
                    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to generate LSI keywords', 'error') }
                    finally { setLsiLoading(false) }
                  }}
                  disabled={!focusKeyword.trim() || lsiLoading}
                  className="btn-secondary text-sm px-4 whitespace-nowrap min-h-[44px]"
                >
                  {lsiLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-forest/20 border-t-forest dark:border-t-forest-light rounded-full animate-spin" />
                    </span>
                  ) : '✨ Suggest'}
                </button>
              </div>
              <p className="text-xs text-earth-dark/40 dark:text-light-cream/40 mt-1.5">LSI keywords help improve SEO by providing context.</p>
            </div>
            <div>
              <label htmlFor="target-audience" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Target Audience</label>
              <input id="target-audience" type="text" value={targetAudience} onChange={e => setTargetAudience(e.target.value)} placeholder="e.g., small business owners, beginners, developers" className="input-field text-base" />
              <p className="text-xs text-earth-dark/40 dark:text-light-cream/40 mt-1.5">Specify who this content is for to tailor tone and depth.</p>
            </div>
            <div>
              <label htmlFor="sitemap-url" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Website Sitemap URL</label>
              <div className="flex gap-2">
                <input id="sitemap-url" type="url" value={sitemapUrl} onChange={e => setSitemapUrl(e.target.value)} placeholder="e.g., https://yoursite.com/sitemap.xml" className="input-field text-base flex-1" />
                <button
                  onClick={async () => {
                    if (!sitemapUrl.trim()) return
                    setSitemapLoading(true)
                    try {
                      const links = await fetchSitemapLinks(sitemapUrl.trim())
                      setSitemapLinks(links)
                      showToast(`Found ${links.length} links from sitemap!`, 'success')
                    } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to fetch sitemap', 'error') }
                    finally { setSitemapLoading(false) }
                  }}
                  disabled={!sitemapUrl.trim() || sitemapLoading}
                  className="btn-secondary text-sm px-4 whitespace-nowrap min-h-[44px]"
                >
                  {sitemapLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-forest/20 border-t-forest dark:border-t-forest-light rounded-full animate-spin" />
                      Fetching…
                    </span>
                  ) : 'Fetch Links'}
                </button>
              </div>
              {sitemapLinks.length > 0 ? (
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700 dark:text-green-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    {sitemapLinks.length} links loaded for internal linking
                  </span>
                  <button onClick={() => { setSitemapLinks([]); showToast('Sitemap links cleared', 'info') }} className="text-xs text-red-500 hover:text-red-600 transition-colors">Clear</button>
                </div>
              ) : (
                <p className="text-xs text-earth-dark/40 dark:text-light-cream/40 mt-1.5">Provide your sitemap so AI can add relevant internal links to the content.</p>
              )}
            </div>
            <button onClick={handleGenerateTitles} disabled={!focusKeyword.trim() || loading} className="btn-primary w-full text-base">Generate Title Suggestions</button>
          </div>
        </>
      )}

      {step === 'titles' && (
        <>
          <h2 className="text-xl font-semibold text-forest dark:text-forest-light mb-2">Pick Your Title</h2>
          <p className="text-xs text-earth-dark/40 dark:text-light-cream/40 mb-5">Generated after researching top-ranking articles for your keyword</p>
          <div className="space-y-3">
            {titles.map((t, i) => (
              <button key={i} onClick={() => { setSelectedTitle(t); setStep('options') }}
                className="w-full text-left p-4 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 hover:border-forest/30 dark:hover:border-forest-light/30 hover:bg-white/60 dark:hover:bg-white/10 transition-all text-sm">
                <span className="text-xs font-semibold text-forest dark:text-forest-light mr-2">{i + 1}.</span>{t}
              </button>
            ))}
            <div className="border-t border-white/20 dark:border-white/5 pt-4">
              <label className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Or write your own:</label>
              <input type="text" value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Enter your custom title" className="input-field mb-3 text-base" />
              <button onClick={() => { if (customTitle.trim()) { setSelectedTitle(customTitle.trim()); setStep('options') } }} disabled={!customTitle.trim()} className="btn-secondary w-full">Use Custom Title</button>
            </div>
            <button onClick={() => setStep('keywords')} className="w-full py-2 text-sm text-earth-dark/50 dark:text-light-cream/50 hover:text-forest dark:hover:text-forest-light transition-colors">← Back to Keywords</button>
          </div>
        </>
      )}

      {step === 'options' && (
        <>
          <h2 className="text-xl font-semibold text-forest dark:text-forest-light mb-6">Content Options</h2>
          <div className="space-y-5">
            <div className="p-3 rounded-xl bg-forest/5 dark:bg-forest-light/5">
              <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-0.5">Selected Title</p>
              <p className="font-medium text-forest dark:text-forest-light text-sm">{selectedTitle}</p>
            </div>
            <div>
              <label htmlFor="wc" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Word Count: <strong>{wordCount}</strong></label>
              <input id="wc" type="range" min="500" max="3000" step="100" value={wordCount} onChange={e => setWordCount(+e.target.value)} className="w-full accent-forest dark:accent-forest-light" />
              <div className="flex justify-between text-xs text-earth-dark/40 dark:text-light-cream/40 mt-1"><span>500</span><span>3000</span></div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label htmlFor="tone" className="block text-xs font-medium mb-1.5 text-earth-dark/60 dark:text-light-cream/60">Tone</label>
                <select id="tone" value={tone} onChange={e => setTone(e.target.value as typeof tone)} className="input-field text-sm">
                  <option value="professional">Professional</option><option value="casual">Casual</option><option value="friendly">Friendly</option>
                </select>
              </div>
              <div>
                <label htmlFor="format" className="block text-xs font-medium mb-1.5 text-earth-dark/60 dark:text-light-cream/60">Format</label>
                <select id="format" value={format} onChange={e => setFormat(e.target.value as typeof format)} className="input-field text-sm">
                  <option value="blog-post">Blog Post</option><option value="article">Article</option><option value="product-description">Product Desc.</option>
                </select>
              </div>
              <div>
                <label htmlFor="lang" className="block text-xs font-medium mb-1.5 text-earth-dark/60 dark:text-light-cream/60">Language</label>
                <select id="lang" value={language} onChange={e => setLanguage(e.target.value)} className="input-field text-sm">
                  <option>English</option><option>Spanish</option><option>French</option><option>German</option><option>Italian</option><option>Portuguese</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep('titles')} className="btn-secondary flex-1 text-sm">← Back</button>
              <button onClick={handleGenerateContent} disabled={loading} className="btn-primary flex-1 text-sm">Generate Content</button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
