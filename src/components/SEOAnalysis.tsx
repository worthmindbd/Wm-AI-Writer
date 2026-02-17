import { useMemo } from 'react'
import { GeneratedContent, SEOAnalysis } from '../types'

function analyze(c: GeneratedContent): SEOAnalysis {
    const text = c.content.toLowerCase()
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const total = words.length
    const fk = c.focusKeyword.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const focusKeywordCount = (text.match(new RegExp(fk, 'gi')) || []).length
    const keywordDensity = total > 0 ? Math.round((focusKeywordCount / total) * 10000) / 100 : 0

    const lsiKeywordUsage: Record<string, number> = {}
    c.lsiKeywords.forEach(kw => {
        lsiKeywordUsage[kw] = (text.match(new RegExp(kw.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length
    })

    const lines = c.content.split('\n')
    const headingCount = { h1: 0, h2: 0, h3: 0 }
    lines.forEach(l => { if (l.startsWith('### ')) headingCount.h3++; else if (l.startsWith('## ')) headingCount.h2++; else if (l.startsWith('# ')) headingCount.h1++ })

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const avgWPS = sentences.length > 0 ? total / sentences.length : 0
    const avgWL = words.reduce((s, w) => s + w.length, 0) / (total || 1)
    const readabilityScore = Math.max(0, Math.min(100, 100 - avgWPS * 1.5 - avgWL * 5 + 50))

    let seoScore = 0
    if (keywordDensity >= 0.5 && keywordDensity <= 3) seoScore += 20; else if (keywordDensity > 0) seoScore += 10
    if (headingCount.h2 >= 2) seoScore += 15
    if (headingCount.h3 >= 1) seoScore += 10
    if (total >= 500) seoScore += 15
    if (total >= 1000) seoScore += 10
    if (c.metaDescription?.length > 50) seoScore += 15
    const lsiUsed = Object.values(lsiKeywordUsage).filter(v => v > 0).length
    if (lsiUsed >= c.lsiKeywords.length * 0.5) seoScore += 15; else if (lsiUsed > 0) seoScore += 8

    return { keywordDensity, focusKeywordCount, lsiKeywordUsage, seoScore: Math.min(100, seoScore), readabilityScore: Math.round(readabilityScore), headingCount }
}

function Bar({ score, label }: { score: number; label: string }) {
    const color = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
    return (
        <div>
            <div className="flex justify-between text-xs mb-1">
                <span className="text-earth-dark/60 dark:text-light-cream/60">{label}</span>
                <span className="font-semibold text-earth-dark dark:text-light-cream">{score}/100</span>
            </div>
            <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
            </div>
        </div>
    )
}

export default function SEOAnalysisPanel({ content }: { content: GeneratedContent }) {
    const a = useMemo(() => analyze(content), [content])
    return (
        <div className="card sticky top-20">
            <h3 className="text-lg font-semibold text-forest dark:text-forest-light mb-4">📊 SEO Analysis</h3>
            <div className="space-y-4">
                <Bar score={a.seoScore} label="SEO Score" />
                <Bar score={a.readabilityScore} label="Readability" />

                <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                        <p className="text-xs text-earth-dark/50 dark:text-light-cream/50">Words</p>
                        <p className="text-lg font-bold text-forest dark:text-forest-light">{content.wordCount}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                        <p className="text-xs text-earth-dark/50 dark:text-light-cream/50">Read Time</p>
                        <p className="text-lg font-bold text-forest dark:text-forest-light">{content.readingTime} min</p>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-1">Keyword Density</p>
                    <p className="text-sm font-semibold text-earth-dark dark:text-light-cream">
                        "{content.focusKeyword}" — {a.keywordDensity}% <span className="text-xs font-normal">({a.focusKeywordCount}×)</span>
                    </p>
                    <p className="text-xs text-earth-dark/40 dark:text-light-cream/40 mt-1">Ideal: 0.5%–3%</p>
                </div>

                {content.lsiKeywords.length > 0 && (
                    <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                        <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-2">LSI Keywords</p>
                        <div className="flex flex-wrap gap-1.5">
                            {content.lsiKeywords.map(kw => {
                                const c = a.lsiKeywordUsage[kw] || 0
                                return <span key={kw} className={`text-xs px-2 py-0.5 rounded-full border ${c > 0 ? 'bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'}`}>{kw} ({c})</span>
                            })}
                        </div>
                    </div>
                )}

                <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-1">Headings</p>
                    <div className="flex gap-3 text-xs text-earth-dark/70 dark:text-light-cream/70">
                        <span>H1: {a.headingCount.h1}</span><span>H2: {a.headingCount.h2}</span><span>H3: {a.headingCount.h3}</span>
                    </div>
                </div>

                <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-1">URL Slug</p>
                    <p className="text-xs font-mono text-forest dark:text-forest-light break-all">/{content.urlSlug}</p>
                </div>

                <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5">
                    <p className="text-xs text-earth-dark/50 dark:text-light-cream/50 mb-1">Meta Description</p>
                    <p className="text-xs text-earth-dark/70 dark:text-light-cream/70 leading-relaxed">{content.metaDescription}</p>
                    <p className="text-xs text-earth-dark/40 dark:text-light-cream/40 mt-1">{content.metaDescription.length}/155 chars</p>
                </div>

                <div className="border-t border-white/20 dark:border-white/5 pt-3">
                    <p className="text-xs font-medium text-forest dark:text-forest-light mb-2">💡 Suggestions</p>
                    <ul className="text-xs text-earth-dark/60 dark:text-light-cream/60 space-y-1">
                        <li>• Link to authoritative sources about "{content.focusKeyword}"</li>
                        <li>• Add internal links to related content</li>
                        <li>• Include 2–3 external references for credibility</li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
