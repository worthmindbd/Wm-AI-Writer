import { useContext } from 'react'
import { ThemeContext } from '../contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('ThemeToggle must be used within ThemeProvider')
  const { theme, toggleTheme } = context

  return (
    <button onClick={toggleTheme} aria-label="Toggle theme"
      className="p-2.5 rounded-xl glass hover:shadow-md transition-all duration-200 active:scale-95">
      {theme === 'light' ? (
        <Moon className="w-5 h-5 text-forest" />
      ) : (
        <Sun className="w-5 h-5 text-forest-light" />
      )}
    </button>
  )
}
