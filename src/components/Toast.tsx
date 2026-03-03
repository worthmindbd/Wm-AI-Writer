import { useToast } from '../contexts/ToastContext'
import { CheckCircle, XCircle, Info } from 'lucide-react'

export default function ToastContainer() {
    const { toasts } = useToast()
    if (!toasts.length) return null
    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 max-w-sm">
            {toasts.map(t => (
                <div key={t.id} className={`glass-strong px-5 py-3 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-2.5 animate-slide-up
          ${t.type === 'success' ? 'text-green-700 dark:text-green-400' : ''}
          ${t.type === 'error' ? 'text-red-700 dark:text-red-400' : ''}
          ${t.type === 'info' ? 'text-forest dark:text-forest-light' : ''}`}>
                    {t.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : t.type === 'error' ? <XCircle className="w-4 h-4 flex-shrink-0" /> : <Info className="w-4 h-4 flex-shrink-0" />}
                    {t.message}
                </div>
            ))}
        </div>
    )
}
