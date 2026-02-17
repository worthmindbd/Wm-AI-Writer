import { useToast } from '../contexts/ToastContext'
import { ImagePrompt } from '../types'

export default function ImagePrompts({ prompts, loading }: { prompts: ImagePrompt[]; loading?: boolean }) {
    const { showToast } = useToast()

    return (
        <div className="card">
            <h3 className="text-lg font-semibold text-forest dark:text-forest-light mb-4">🖼️ Image Prompts</h3>
            {loading ? (
                <div className="flex items-center gap-3 text-sm text-earth-dark/60 dark:text-light-cream/60 py-4">
                    <div className="w-5 h-5 border-2 border-forest/20 border-t-forest dark:border-t-forest-light rounded-full animate-spin" />
                    Generating image prompts…
                </div>
            ) : prompts.length === 0 ? (
                <p className="text-sm text-earth-dark/40 dark:text-light-cream/40">No image prompts generated yet.</p>
            ) : (
                <div className="space-y-3">
                    {prompts.map((p, i) => (
                        <div key={i} className="p-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-medium text-forest dark:text-forest-light px-2 py-0.5 rounded-full bg-forest/10 dark:bg-forest-light/10">{p.section}</span>
                                <button onClick={() => { navigator.clipboard.writeText(p.prompt); showToast('Prompt copied!', 'success') }}
                                    className="text-xs text-earth-dark/40 dark:text-light-cream/40 hover:text-forest dark:hover:text-forest-light transition-colors">Copy</button>
                            </div>
                            <p className="text-sm text-earth-dark/80 dark:text-light-cream/80 leading-relaxed">{p.prompt}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
