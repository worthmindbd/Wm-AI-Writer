import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface Toast { id: number; message: string; type: 'success' | 'error' | 'info' }
interface ToastContextType { toasts: Toast[]; showToast: (message: string, type?: 'success' | 'error' | 'info') => void }

const ToastContext = createContext<ToastContextType | undefined>(undefined)
let nextId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])
    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = ++nextId
        setToasts(prev => [...prev, { id, message, type }])
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000)
    }, [])
    return <ToastContext.Provider value={{ toasts, showToast }}>{children}</ToastContext.Provider>
}

export function useToast() {
    const ctx = useContext(ToastContext)
    if (!ctx) throw new Error('useToast must be used within ToastProvider')
    return ctx
}
