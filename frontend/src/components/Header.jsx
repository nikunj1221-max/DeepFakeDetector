import { useState, useEffect } from 'react'
import { soundManager } from '../utils/sound'

export default function Header() {
  const [muted, setMuted] = useState(soundManager.isMuted())
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    // Sync muted state from sound manager
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

  // Scroll spy to highlight current section
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
    <header className="sticky top-0 z-50 w-full border-b border-[rgba(0,240,255,0.15)] bg-[#02050c]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        {/* Brand/Logo */}
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => handleNavClick('home')}
          onMouseEnter={handleHover}
        >
          <div className="relative flex h-10 w-10 items-center justify-center border border-[rgba(0,240,255,0.3)] bg-gradient-to-br from-[#060f21] to-[#01040a]">
            {/* Spinning HUD logo marks */}
            <div className="absolute inset-[3px] border border-dashed border-[rgba(0,240,255,0.5)] rounded-full rotate-ring-cw"></div>
            <div className="absolute inset-[6px] border border-dotted border-[rgba(255,170,0,0.6)] rounded-full rotate-ring-ccw"></div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="2" className="z-10 group-hover:scale-110 transition-transform">
              <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <p className="font-orbitron text-sm font-bold tracking-[0.15em] text-white glow-text-cyan">
                DEEPGUARD
              </p>
              <span className="hidden sm:inline border border-[rgba(0,240,255,0.3)] bg-[rgba(0,240,255,0.05)] px-1.5 py-0.2 font-mono-tech text-[9px] text-[var(--accent-cyan)] uppercase">
                HUD v2.5
              </span>
            </div>
            <p className="font-mono-tech text-[10px] text-[var(--text-dim)]">
              FORENSIC COGNITIVE SHIELD
            </p>
          </div>
        </div>

        {/* Central Nav Links */}
        <nav className="hidden md:flex items-center gap-1 font-orbitron text-xs tracking-wider">
          {[
            { id: 'home', label: 'SYS_INIT' },
            { id: 'scanner', label: 'DIAGNOSTIC_HUD' },
            { id: 'how-it-works', label: 'PIPELINE_MAP' },
            { id: 'about', label: 'THREAT_INTEL' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              onMouseEnter={handleHover}
              className={`px-4 py-2 border-b-2 transition-all duration-200 uppercase ${
                activeSection === item.id
                  ? 'border-[var(--accent-cyan)] text-[var(--accent-cyan)] bg-[rgba(0,240,255,0.03)] glow-text-cyan'
                  : 'border-transparent text-[var(--text-dim)] hover:text-white hover:border-[rgba(0,240,255,0.4)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Side: Status and Audio Widget */}
        <div className="flex items-center gap-4 sm:gap-6 font-mono-tech text-[11px]">
          {/* Diagnostic Core Pill */}
          <div className="hidden sm:flex items-center gap-2 border border-[rgba(0,240,255,0.15)] bg-[rgba(6,15,33,0.4)] px-3 py-1 text-[var(--text-dim)]">
            <span className="led-status active pulse real"></span>
            <span>GRID_CORE: ONLINE</span>
          </div>

          {/* Audio Visualizer Toggle */}
          <button
            onClick={toggleMute}
            onMouseEnter={handleHover}
            className={`flex items-center gap-2.5 px-3 py-1.5 border transition-all duration-200 ${
              muted 
                ? 'border-[rgba(255,170,0,0.3)] text-[var(--accent-gold)] bg-transparent hover:border-[var(--accent-gold)]' 
                : 'border-[rgba(0,240,255,0.3)] text-[var(--accent-cyan)] bg-[rgba(0,240,255,0.05)] hover:border-[var(--accent-cyan)] hover:bg-[rgba(0,240,255,0.1)]'
            }`}
            title={muted ? 'Enable sound responses' : 'Mute sounds'}
          >
            {/* Audio Wave Icon / Animation */}
            <div className="flex h-3 w-5 items-end justify-between gap-[2px]">
              {muted ? (
                <>
                  <div className="h-[2px] w-[3px] bg-[var(--accent-gold)] transition-all"></div>
                  <div className="h-[2px] w-[3px] bg-[var(--accent-gold)] transition-all"></div>
                  <div className="h-[2px] w-[3px] bg-[var(--accent-gold)] transition-all"></div>
                  <div className="h-[2px] w-[3px] bg-[var(--accent-gold)] transition-all"></div>
                </>
              ) : (
                <>
                  <div className="h-2 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                  <div className="h-3 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.3s' }}></div>
                  <div className="h-1.5 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="h-2.5 w-[3px] bg-[var(--accent-cyan)] animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </>
              )}
            </div>
            <span className="font-orbitron font-medium tracking-[0.1em] text-[10px]">
              {muted ? 'VOICE_MUTE' : 'JARVIS_AUDIO'}
            </span>
          </button>
        </div>

      </div>
    </header>
  )
}
