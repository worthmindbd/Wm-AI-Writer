import { useState, useEffect } from 'react'
import { GeneratedContent, ImagePrompt } from '../types'
import { useApiKey } from '../contexts/ApiKeyContext'
import { useToast } from '../contexts/ToastContext'
import { generateContent, generateMetaDescription, generateImagePrompts } from '../services/gemini'
import SEOAnalysis from './SEOAnalysis'
import ImagePromptsPanel from './ImagePrompts'

interface Props { content: GeneratedContent; onBack: () => void; onContentUpdate: (c: GeneratedContent) => void }

export default function ContentGenerator({ content, onBack, onContentUpdate }: Props) {
  const { apiKey } = useApiKey()
  const { showToast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(content.content)
  const [imgPrompts, setImgPrompts] = useState<ImagePrompt[]>(content.imagePrompts || [])
  const [imgLoading, setImgLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => { setEditedContent(content.content) }, [content.content])

  useEffect(() => {
    if (imgPrompts.length === 0 && apiKey && content.content) {
      setImgLoading(true)
      generateImagePrompts(apiKey, content.title, content.content, 5)
        .then(p => setImgPrompts(p))
        .catch(() => showToast('Could not generate image prompts', 'error'))
        .finally(() => setImgLoading(false))
    }
  }, [])

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(editedContent); showToast('Copied to clipboard!', 'success') }
    catch { showToast('Failed to copy', 'error') }
  }

  const handleDownload = (fmt: 'txt' | 'md') => {
    const blob = new Blob([editedContent], { type: fmt === 'md' ? 'text/markdown' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${content.title.replace(/[^a-z0-9\s-]/gi, '').replace(/\s+/g, '-').toLowerCase()}.${fmt}`
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
    showToast(`Downloaded as .${fmt}`, 'success')
  }

  const handleRegenerate = async () => {
    setRegenerating(true)
    try {
      const newContent = await generateContent(apiKey, {
        title: content.title, focusKeyword: content.focusKeyword, lsiKeywords: content.lsiKeywords,
        wordCount: content.targetWordCount, tone: content.tone, format: content.format, language: content.language, targetAudience: content.targetAudience || undefined, internalLinks: content.internalLinks,
      })
      const meta = await generateMetaDescription(apiKey, content.title, content.focusKeyword)
      const wc = newContent.split(/\s+/).length
      const updated: GeneratedContent = { ...content, content: newContent, metaDescription: meta, wordCount: wc, readingTime: Math.ceil(wc / 200), imagePrompts: undefined }
      setEditedContent(newContent)
      setImgPrompts([])
      onContentUpdate(updated)
      showToast('Content regenerated!', 'success')
      // Re-generate image prompts
      setImgLoading(true)
      generateImagePrompts(apiKey, content.title, newContent, 5)
        .then(p => setImgPrompts(p)).catch(() => { }).finally(() => setImgLoading(false))
    } catch (err) { showToast(err instanceof Error ? err.message : 'Regeneration failed', 'error') }
    finally { setRegenerating(false) }
  }

  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
      if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold mt-5 mb-2 text-forest dark:text-forest-light">{line.substring(4)}</h3>
      if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-forest dark:text-forest-light">{line.substring(3)}</h2>
      if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-extrabold mt-6 mb-3 text-forest dark:text-forest-light">{line.substring(2)}</h1>
      if (line.startsWith('- ') || line.startsWith('* ')) return <li key={i} className="ml-6 list-disc text-sm leading-relaxed">{line.substring(2)}</li>
      if (line.match(/^\d+\.\s/)) return <li key={i} className="ml-6 list-decimal text-sm leading-relaxed">{line.replace(/^\d+\.\s/, '')}</li>
      if (line.trim() === '') return <div key={i} className="h-3" />
      // Bold handling
      const parts = line.split(/(\*\*[^*]+\*\*)/g)
      return <p key={i} className="mb-2 leading-relaxed text-sm">{parts.map((p, j) =>
        p.startsWith('**') && p.endsWith('**') ? <strong key={j} className="font-semibold">{p.slice(2, -2)}</strong> : p
      )}</p>
    })
  }

  const displayContent: GeneratedContent = { ...content, content: editedContent, wordCount: editedContent.split(/\s+/).length }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Regeneration overlay */}
      {regenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="glass-strong p-8 rounded-2xl text-center">
            <div className="w-10 h-10 mx-auto mb-4 rounded-full animate-spin" style={{ borderWidth: '3px', borderStyle: 'solid', borderColor: 'rgba(45,80,22,0.2)', borderTopColor: '#2D5016' }} />
            <p className="text-sm font-medium text-earth-dark dark:text-light-cream">Regenerating content…</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
          <h2 className="text-xl font-bold text-forest dark:text-forest-light">Generated Content</h2>
          <button onClick={onBack} className="text-sm text-earth-dark/50 dark:text-light-cream/50 hover:text-forest dark:hover:text-forest-light transition-colors">← Back to Input</button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-earth-dark dark:text-light-cream mb-3">{content.title}</h1>
        <div className="flex flex-wrap gap-3 text-sm text-earth-dark/50 dark:text-light-cream/50 mb-4">
          <span>📝 {displayContent.wordCount} words</span>
          <span>⏱️ {content.readingTime} min read</span>
          <span>🔗 <span className="font-mono text-xs">{content.urlSlug}</span></span>
        </div>

        {/* Meta Description */}
        <div className="p-3 rounded-xl bg-white/40 dark:bg-white/5 mb-4">
          <p className="text-xs text-earth-dark/40 dark:text-light-cream/40 mb-0.5">Meta Description</p>
          <p className="text-sm text-earth-dark/70 dark:text-light-cream/70">{content.metaDescription}</p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <>
              <button onClick={() => setIsEditing(true)} className="btn-secondary text-xs px-4">✏️ Edit</button>
              <button onClick={handleCopy} className="btn-secondary text-xs px-4">📋 Copy</button>
              <button onClick={() => handleDownload('txt')} className="btn-secondary text-xs px-4">💾 .txt</button>
              <button onClick={() => handleDownload('md')} className="btn-secondary text-xs px-4">📄 .md</button>
              <button onClick={handleRegenerate} disabled={regenerating} className="btn-primary text-xs px-4">🔄 Regenerate</button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-primary text-xs px-5">✓ Done</button>
              <button onClick={() => { setEditedContent(content.content); setIsEditing(false) }} className="btn-secondary text-xs px-5">✗ Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Content */}
          <div className="card">
            {isEditing ? (
              <textarea value={editedContent} onChange={e => setEditedContent(e.target.value)}
                className="w-full min-h-[500px] p-4 rounded-xl bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/5 text-earth-dark dark:text-light-cream focus:outline-none focus:ring-2 focus:ring-forest/50 font-mono text-xs leading-relaxed resize-y" />
            ) : (
              <div className="prose-custom">{renderContent(editedContent)}</div>
            )}
          </div>

          {/* Image Prompts */}
          <ImagePromptsPanel prompts={imgPrompts} loading={imgLoading} />
        </div>

        {/* SEO Sidebar */}
        <div className="lg:col-span-1">
          <SEOAnalysis content={displayContent} />
        </div>
      </div>
    </div>
  )
}
