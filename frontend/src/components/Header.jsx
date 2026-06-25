import { useState, useEffect } from 'react'
import { soundManager } from '../utils/sound'

export default function Header() {
  const [muted, setMuted] = useState(soundManager.isMuted())
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    setMuted(soundManager.isMuted())
  }, [])

  const toggleMute = () => {
    const nextMuted = !muted
    soundManager.setMuted(nextMuted)
    setMuted(nextMuted)
    if (!nextMuted) {
      soundManager.playClick()
    }
  }

  const handleNavClick = (sectionId) => {
    soundManager.playClick()
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleHover = () => {
    soundManager.playHover()
  }

  useEffect(() => {
    const sections = ['home', 'scanner', 'how-it-works', 'about']
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100
      for (const section of sections) {
        const el = document.getElementById(section)
        if (el) {
          const top = el.offsetTop
          const height = el.offsetHeight
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section)
            break
          }
        }
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(0,176,255,0.15)] bg-white/70 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand/Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavClick('home')}
          onMouseEnter={handleHover}
        >
          <div className="relative flex h-10 w-10 items-center justify-center border border-[rgba(0,176,255,0.3)] bg-gradient-to-br from-white to-[#f0f7ff] rounded-sm shadow-inner">
            {/* Spinning HUD rings (Light Mode) */}
            <div className="absolute inset-[3px] border border-dashed border-[rgba(0,176,255,0.4)] rounded-full rotate-ring-cw"></div>
            <div className="absolute inset-[6px] border border-dotted border-[rgba(61,130,246,0.5)] rounded-full rotate-ring-ccw"></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" className="z-10 group-hover:scale-110 transition-transform">
              <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-orbitron text-sm font-bold tracking-[0.15em] text-[var(--text-cyber)] glow-text-cyan">
                DEEPGUARD
              </p>
              <span className="hidden sm:inline border border-[rgba(0,176,255,0.25)] bg-[rgba(0,176,255,0.05)] px-1.5 py-0.2 font-mono-tech text-[9px] text-[var(--accent-cyan)] uppercase font-semibold">
                LAB_CORE v3.0
              </span>
            </div>
            <p className="font-mono-tech text-[10px] text-[var(--text-dark)] tracking-wider">
              COGNITIVE DIAGNOSTIC SYSTEM
            </p>
          </div>
        </div>

        {/* Central Nav Links */}
        <nav className="hidden md:flex items-center gap-1 font-orbitron text-xs tracking-wider">
          {[
            { id: 'home', label: 'SYS_INIT' },
            { id: 'scanner', label: 'LAB_WORKSPACE' },
            { id: 'how-it-works', label: 'DETECTION_TIMELINE' },
            { id: 'about', label: 'SYSTEM_SPEC' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              onMouseEnter={handleHover}
              className={`px-4 py-2 border-b-2 transition-all duration-200 uppercase font-semibold ${
                activeSection === item.id
                  ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[rgba(0,176,255,0.02)] glow-text-cyan'
                  : 'border-transparent text-[var(--text-dim)] hover:text-[var(--text-cyber)] hover:border-[rgba(0,176,255,0.3)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side: Status and Audio Widget */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono-tech text-[11px]">
          {/* Diagnostic Core Pill */}
          <div className="hidden sm:flex items-center gap-2 border border-[rgba(0,176,255,0.15)] bg-white/50 px-3 py-1 text-[var(--text-dim)] shadow-sm">
            <span className="led-status active pulse real animate-pulse"></span>
            <span>SYSTEM: ONLINE</span>
          </div>

          {/* Audio Visualizer Toggle */}
          <button
            onClick={toggleMute}
            onMouseEnter={handleHover}
            className={`flex items-center gap-2.5 px-3 py-1.5 border transition-all duration-200 rounded-sm shadow-sm ${
              muted 
                ? 'border-[rgba(163,184,204,0.4)] text-[var(--text-dark)] bg-transparent hover:border-[var(--accent-silver)]' 
                : 'border-[rgba(0,176,255,0.3)] text-[var(--accent-cyan)] bg-[rgba(0,176,255,0.04)] hover:border-[var(--accent-cyan)] hover:bg-[rgba(0,176,255,0.08)]'
            }`}
            title={muted ? 'Enable voice output' : 'Mute voice'}
          >
            {/* Audio Wave Icon / Animation */}
            <div className="flex h-3 w-5 items-end justify-between gap-[2px]">
              {muted ? (
                <>
                  <div className="h-[2px] w-[3px] bg-[var(--text-dark)] transition-all"></div>
                  <div className="h-[2px] w-[3px] bg-[var(--text-dark)] transition-all"></div>
                  <div className="h-[2px] w-[3px] bg-[var(--text-dark)] transition-all"></div>
                  <div className="h-[2px] w-[3px] bg-[var(--text-dark)] transition-all"></div>
                </>
              ) : (
                <>
                  <div className="h-2.5 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-3 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="h-1.5 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}
            </div>
            <span className="font-orbitron font-bold tracking-[0.1em] text-[10px]">
              {muted ? 'VOICE_OFF' : 'JARVIS_VOX'}
            </span>
          </button>
        </div>

      </div>
    </header>
  )
}
