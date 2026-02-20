import { useState, useEffect } from 'react'
import ThemeToggle from './ThemeToggle'

export default function Header() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollTo = (id: string) => {
        const el = document.getElementById(id)
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
            // If we're not on the homepage, reload and scroll
            window.location.href = `/#${id}`
        }
    }

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-cream/80 dark:bg-dark-earth/80 backdrop-blur-md shadow-sm border-b border-forest/10 dark:border-forest-light/10 py-3'
                    : 'bg-transparent py-5'
                }`}
        >
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer group"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <div className="w-8 h-8 rounded-xl bg-forest dark:bg-forest-light text-white dark:text-dark-earth flex items-center justify-center font-bold text-lg shadow-md group-hover:scale-105 transition-transform">
                        W
                    </div>
                    <span className="font-bold text-xl tracking-tight text-earth-dark dark:text-light-cream">
                        Wm AI <span className="text-forest dark:text-forest-light">Writer</span>
                    </span>
                </div>

                {/* Navigation & Actions */}
                <div className="flex items-center gap-6">
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        <button onClick={() => scrollTo('how-it-works')} className="text-earth-dark/70 hover:text-forest dark:text-light-cream/70 dark:hover:text-forest-light transition-colors">How it Works</button>
                        <button onClick={() => scrollTo('features')} className="text-earth-dark/70 hover:text-forest dark:text-light-cream/70 dark:hover:text-forest-light transition-colors">Features</button>
                        <button onClick={() => scrollTo('faq')} className="text-earth-dark/70 hover:text-forest dark:text-light-cream/70 dark:hover:text-forest-light transition-colors">FAQ</button>
                    </nav>

                    <div className="flex items-center gap-4 pl-4 border-l border-earth-dark/10 dark:border-light-cream/10">
                        <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    )
}
