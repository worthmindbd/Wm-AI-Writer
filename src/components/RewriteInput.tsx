import { useState } from 'react'
import { useApiKey } from '../contexts/ApiKeyContext'
import { useToast } from '../contexts/ToastContext'
import { generateLSIKeywords, fetchPostContent, rewriteContent, generateMetaDescription } from '../services/gemini'
import { fetchSitemapLinks } from '../utils/sitemap'
import { GeneratedContent } from '../types'

interface Props { onContentRewritten: (content: GeneratedContent) => void }
type Step = 'url' | 'keywords' | 'options'

export default function RewriteInput({ onContentRewritten }: Props) {
    const { apiKey, isConfigured, selectedModel } = useApiKey()
    const { showToast } = useToast()

    const [step, setStep] = useState<Step>('url')
    const [postUrl, setPostUrl] = useState('')
    const [focusKeyword, setFocusKeyword] = useState('')
    const [lsiKeywords, setLsiKeywords] = useState('')
    const [tone, setTone] = useState<'professional' | 'casual' | 'friendly'>('professional')
    const [language, setLanguage] = useState('English')
    const [targetAudience, setTargetAudience] = useState('')
    const [lengthStrategy, setLengthStrategy] = useState<'keep_same' | 'make_longer' | 'make_shorter'>('keep_same')
    const [sitemapUrl, setSitemapUrl] = useState('')
    const [sitemapLinks, setSitemapLinks] = useState<string[]>([])

    const [originalTitle, setOriginalTitle] = useState('')
    const [originalContent, setOriginalContent] = useState('')

    const [urlLoading, setUrlLoading] = useState(false)
    const [lsiLoading, setLsiLoading] = useState(false)
    const [sitemapLoading, setSitemapLoading] = useState(false)
    const [loading, setLoading] = useState(false)

    const lsiArr = lsiKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0)

    // Step 1: Fetch Original Content
    const handleFetchContent = async () => {
        if (!postUrl.trim()) return
        setUrlLoading(true)
        try {
            const text = await fetchPostContent(postUrl.trim())
            setOriginalContent(text)

            // Try to extract a rough title from the URL slug
            let extractedTitle = 'Rewritten Post'
            try {
                const path = new URL(postUrl.trim()).pathname
                const slug = path.split('/').filter(Boolean).pop()
                if (slug) {
                    extractedTitle = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                }
            } catch { /* ignore URL parse errors */ }

            setOriginalTitle(extractedTitle)
            setStep('keywords')
            showToast('Content fetched successfully!', 'success')
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to fetch the URL content', 'error')
        } finally {
            setUrlLoading(false)
        }
    }

    // Step 3: Rewrite Content
    const handleRewrite = async () => {
        if (!isConfigured) { showToast('Please configure your API key first', 'error'); return }
        if (!focusKeyword.trim()) { showToast('Focus keyword is required', 'error'); return }

        setLoading(true)
        try {
            const rewrittenText = await rewriteContent(apiKey, {
                originalContent,
                focusKeyword: focusKeyword.trim(),
                lsiKeywords: lsiArr,
                tone,
                language,
                targetAudience: targetAudience.trim() ? targetAudience.trim() : undefined,
                lengthStrategy,
                internalLinks: sitemapLinks.length > 0 ? sitemapLinks : undefined,
                model: selectedModel
            })

            const meta = await generateMetaDescription(apiKey, originalTitle, focusKeyword.trim(), selectedModel)
            const slug = originalTitle.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').substring(0, 60)
            const wc = rewrittenText.split(/\s+/).length

            onContentRewritten({
                title: originalTitle,
                content: rewrittenText,
                metaDescription: meta,
                urlSlug: slug,
                wordCount: wc,
                readingTime: Math.ceil(wc / 200),
                focusKeyword: focusKeyword.trim(),
                lsiKeywords: lsiArr,
                tone,
                format: 'article', // Default format for rewrites
                language,
                targetAudience: '', // NA for rewrites
                targetWordCount: wc,
                internalLinks: sitemapLinks.length > 0 ? sitemapLinks : undefined,
                isRewrite: true,
                originalUrl: postUrl.trim()
            })
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Failed to rewrite content', 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card max-w-2xl mx-auto">
            {/* Breadcrumb Navigation */}
            <div className="flex items-center justify-center gap-2 mb-8 text-sm bg-forest/5 dark:bg-forest-light/5 rounded-xl p-2 w-max mx-auto border border-forest/10 dark:border-forest-light/10">
                <button onClick={() => setStep('url')} className={`px-4 py-1.5 rounded-lg font-medium transition-all ${step === 'url' ? 'bg-white dark:bg-dark-earth text-forest dark:text-forest-light shadow-sm' : 'text-earth-dark/60 dark:text-light-cream/60 hover:text-earth-dark dark:hover:text-light-cream'}`}>1. URL</button>
                <span className="text-earth-dark/20 dark:text-light-cream/20">/</span>
                <button onClick={() => originalContent ? setStep('keywords') : null} disabled={!originalContent} className={`px-4 py-1.5 rounded-lg font-medium transition-all ${step === 'keywords' ? 'bg-white dark:bg-dark-earth text-forest dark:text-forest-light shadow-sm' : 'text-earth-dark/60 dark:text-light-cream/60 hover:text-earth-dark dark:hover:text-light-cream disabled:opacity-50 disabled:cursor-not-allowed'}`}>2. SEO</button>
                <span className="text-earth-dark/20 dark:text-light-cream/20">/</span>
                <button onClick={() => focusKeyword.trim() ? setStep('options') : null} disabled={!focusKeyword.trim()} className={`px-4 py-1.5 rounded-lg font-medium transition-all ${step === 'options' ? 'bg-white dark:bg-dark-earth text-forest dark:text-forest-light shadow-sm' : 'text-earth-dark/60 dark:text-light-cream/60 hover:text-earth-dark dark:hover:text-light-cream disabled:opacity-50 disabled:cursor-not-allowed'}`}>3. Options</button>
            </div>

            {/* Loading overlay for rewrite */}
            {loading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <div className="glass-strong p-8 rounded-2xl text-center shadow-2xl">
                        <div className="w-10 h-10 mx-auto mb-4 border-3 border-forest/20 border-t-forest dark:border-t-forest-light rounded-full animate-spin" style={{ borderWidth: '3px' }} />
                        <p className="text-sm font-medium text-earth-dark dark:text-light-cream">
                            Rewriting and optimizing your post…
                        </p>
                        <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mt-1">This takes a little longer as AI analyzes the full text.</p>
                    </div>
                </div>
            )}

            {/* STEP 1: Enter URL */}
            {step === 'url' && (
                <>
                    <h2 className="text-xl font-semibold text-forest dark:text-forest-light mb-2">Rewrite Existing Post</h2>
                    <p className="text-xs text-earth-dark/60 dark:text-light-cream/60 mb-6">Enter the URL of the blog post or article you want to optimize for SEO.</p>

                    <div className="space-y-4">
                        <div>
                            <label htmlFor="post-url" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Post URL *</label>
                            <div className="flex gap-2">
                                <input
                                    id="post-url"
                                    type="url"
                                    value={postUrl}
                                    onChange={e => setPostUrl(e.target.value)}
                                    placeholder="https://yoursite.com/blog/my-post"
                                    className="input-field text-base flex-1"
                                    disabled={urlLoading}
                                    onKeyDown={e => e.key === 'Enter' && handleFetchContent()}
                                />
                                <button
                                    onClick={handleFetchContent}
                                    disabled={!postUrl.trim() || !postUrl.startsWith('http') || urlLoading}
                                    className="btn-primary"
                                >
                                    {urlLoading ? (
                                        <span className="flex items-center gap-2">
                                            <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Fetching
                                        </span>
                                    ) : 'Next ➔'}
                                </button>
                            </div>
                            {!postUrl.startsWith('http') && postUrl.trim().length > 0 && (
                                <p className="text-xs text-red-500 mt-2">URL must start with http:// or https://</p>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* STEP 2: Keywords & Links */}
            {step === 'keywords' && (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-forest dark:text-forest-light">SEO Optimization</h2>
                    </div>

                    <div className="p-3 mb-6 rounded-xl bg-forest/5 dark:bg-forest-light/5 border border-forest/10 dark:border-forest-light/10">
                        <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-1">Content fetched from:</p>
                        <p className="font-mono text-xs text-forest dark:text-forest-light truncate">{postUrl}</p>
                        <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mt-2">Word count: ~{originalContent.split(/\s+/).length} words</p>
                    </div>

                    <div className="space-y-5">
                        <div>
                            <label htmlFor="focus-keyword" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Target Focus Keyword *</label>
                            <input
                                id="focus-keyword"
                                type="text"
                                value={focusKeyword}
                                onChange={e => setFocusKeyword(e.target.value)}
                                placeholder="The main keyword you want to rank for"
                                className="input-field text-base"
                            />
                        </div>

                        <div>
                            <label htmlFor="target-audience" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Target Audience (Optional)</label>
                            <input
                                id="target-audience"
                                type="text"
                                value={targetAudience}
                                onChange={e => setTargetAudience(e.target.value)}
                                placeholder="e.g., small business owners, beginners, developers"
                                className="input-field text-base w-full"
                            />
                        </div>

                        <div>
                            <label htmlFor="lsi-keywords" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">LSI Keywords (comma-separated)</label>
                            <div className="flex gap-2">
                                <input
                                    id="lsi-keywords"
                                    type="text"
                                    value={lsiKeywords}
                                    onChange={e => setLsiKeywords(e.target.value)}
                                    placeholder="Secondary keywords to weave in"
                                    className="input-field text-base flex-1"
                                />
                                <button
                                    onClick={async () => {
                                        if (!focusKeyword.trim()) { showToast('Enter a focus keyword first', 'error'); return }
                                        if (!isConfigured) { showToast('Please configure your API key first', 'error'); return }
                                        setLsiLoading(true)
                                        try {
                                            const suggested = await generateLSIKeywords(apiKey, focusKeyword.trim(), selectedModel)
                                            setLsiKeywords(prev => prev ? `${prev}, ${suggested}` : suggested)
                                            showToast('LSI keywords generated!', 'success')
                                        } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to generate LSI keywords', 'error') }
                                        finally { setLsiLoading(false) }
                                    }}
                                    disabled={!focusKeyword.trim() || lsiLoading}
                                    className="btn-secondary text-sm px-4 whitespace-nowrap min-h-[44px]"
                                >
                                    {lsiLoading ? (
                                        <span className="w-4 h-4 border-2 border-forest/20 border-t-forest dark:border-t-forest-light rounded-full animate-spin inline-block" />
                                    ) : '✨ Suggest'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="sitemap-url" className="block text-sm font-medium mb-2 text-earth-dark/80 dark:text-light-cream/80">Website Sitemap (Optional)</label>
                            <div className="flex gap-2">
                                <input
                                    id="sitemap-url"
                                    type="url"
                                    value={sitemapUrl}
                                    onChange={e => setSitemapUrl(e.target.value)}
                                    placeholder="https://yoursite.com/sitemap.xml"
                                    className="input-field text-base flex-1"
                                />
                                <button
                                    onClick={async () => {
                                        if (!sitemapUrl.trim()) return
                                        setSitemapLoading(true)
                                        try {
                                            const links = await fetchSitemapLinks(sitemapUrl.trim())
                                            setSitemapLinks(links)
                                            showToast(`Found ${links.length} links! AI will use these.`, 'success')
                                        } catch (err) { showToast(err instanceof Error ? err.message : 'Failed to fetch sitemap', 'error') }
                                        finally { setSitemapLoading(false) }
                                    }}
                                    disabled={!sitemapUrl.trim() || sitemapLoading}
                                    className="btn-secondary text-sm px-4 whitespace-nowrap min-h-[44px]"
                                >
                                    {sitemapLoading ? 'Fetching…' : 'Fetch Links'}
                                </button>
                            </div>
                            {sitemapLinks.length > 0 && (
                                <p className="text-xs text-green-600 dark:text-green-400 mt-2 font-medium">✓ {sitemapLinks.length} internal links ready to be woven in.</p>
                            )}
                        </div>

                        <button onClick={() => setStep('options')} disabled={!focusKeyword.trim()} className="btn-primary w-full text-base mt-2">
                            Continue to Options ➔
                        </button>
                    </div>
                </>
            )}

            {/* STEP 3: Options */}
            {step === 'options' && (
                <>
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-forest dark:text-forest-light">Final Options</h2>
                    </div>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="tone" className="block text-xs font-medium mb-1.5 text-earth-dark/60 dark:text-light-cream/60">Tone of Voice</label>
                                <select id="tone" value={tone} onChange={e => setTone(e.target.value as typeof tone)} className="input-field text-sm">
                                    <option value="professional">Professional & Authoritative</option>
                                    <option value="casual">Casual & Conversational</option>
                                    <option value="friendly">Friendly & Engaging</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="lang" className="block text-xs font-medium mb-1.5 text-earth-dark/60 dark:text-light-cream/60">Output Language</label>
                                <select id="lang" value={language} onChange={e => setLanguage(e.target.value)} className="input-field text-sm">
                                    <option>English</option><option>Spanish</option><option>French</option>
                                    <option>German</option><option>Italian</option><option>Portuguese</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="length" className="block text-xs font-medium mb-1.5 text-earth-dark/60 dark:text-light-cream/60">Word Count Strategy</label>
                            <select id="length" value={lengthStrategy} onChange={e => setLengthStrategy(e.target.value as any)} className="input-field text-sm">
                                <option value="keep_same">Keep current length</option>
                                <option value="make_longer">Expand & make longer</option>
                                <option value="make_shorter">Summarize & make shorter</option>
                            </select>
                        </div>

                        <button onClick={handleRewrite} disabled={loading} className="btn-primary w-full text-base mt-4 btn-rewrite">
                            Rewrite & Optimize
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}
