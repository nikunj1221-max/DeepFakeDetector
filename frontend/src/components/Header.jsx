import { useState, useEffect } from 'react'

const CHAPTERS = [
  { id: 'prologue', label: 'Prologue' },
  { id: 'chapter-1', label: 'I' },
  { id: 'chapter-2', label: 'II' },
  { id: 'chapter-3', label: 'III' },
  { id: 'chapter-4', label: 'IV' },
  { id: 'scanner', label: 'Scanner' },
]

export default function Header() {
  const [activeChapter, setActiveChapter] = useState('prologue')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60)

      const scrollPos = window.scrollY + window.innerHeight / 3
      for (let i = CHAPTERS.length - 1; i >= 0; i--) {
        const el = document.getElementById(CHAPTERS[i].id)
        if (el && scrollPos >= el.offsetTop) {
          setActiveChapter(CHAPTERS[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[var(--bg-parchment)]/90 backdrop-blur-md shadow-sm border-b border-[var(--border-aged)]'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">

        {/* Left: Title */}
        <button
          onClick={() => scrollTo('prologue')}
          className="font-display text-sm sm:text-base font-bold text-[var(--text-primary)] hover:text-[var(--maroon)] transition-colors tracking-wide"
        >
          <span className="hidden sm:inline">The Rider Who Chased Shadows</span>
          <span className="sm:hidden">The Rider</span>
        </button>

        {/* Center: Chapter dots */}
        <nav className="hidden md:flex items-center gap-3" aria-label="Chapter navigation">
          {CHAPTERS.map((ch) => (
            <button
              key={ch.id}
              onClick={() => scrollTo(ch.id)}
              className={`chapter-dot ${activeChapter === ch.id ? 'active' : ''}`}
              aria-label={`Go to ${ch.label}`}
              title={ch.label}
            />
          ))}
        </nav>

        {/* Right: Skip to Scanner */}
        <button
          onClick={() => scrollTo('scanner')}
          className="font-sans text-xs font-semibold tracking-widest uppercase text-[var(--text-muted)] hover:text-[var(--maroon)] transition-colors flex items-center gap-2"
        >
          <span className="hidden sm:inline">Skip to</span>
          <span className="underline underline-offset-4 decoration-[var(--maroon-dim)]">Scanner</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-50">
            <path d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        </button>

      </div>
    </header>
  )
}
