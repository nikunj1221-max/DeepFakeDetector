import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import Header from './components/Header'
import Uploader from './components/Uploader'
import ResultCard from './components/ResultCard'
import { soundManager } from './utils/sound'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SCAN_LOGS = [
  { time: 0, text: '[BELL] Initializing spectral frequency channels...' },
  { time: 300, text: '[BELL] Isolating facial region deviation index...' },
  { time: 600, text: '[BELL] Aligning geometric landmark mesh...' },
  { time: 900, text: '[BELL] Constructing frequency domain anomaly map...' },
  { time: 1200, text: '[BELL] Loading EfficientNet-B0 classification weights...' },
  { time: 1500, text: '[BELL] Computing confidence distribution...' },
  { time: 1800, text: '[BELL] Classification synthesis in progress...' }
]

export default function App() {
  const [phase, setPhase] = useState('idle')
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [consoleLogs, setConsoleLogs] = useState([])
  const [showMockWarning, setShowMockWarning] = useState(false)
  const [sliderPos, setSliderPos] = useState(50)

  const consoleBottomRef = useRef(null)

  /* ── Animated Scroll Path Logic ──────────────────────────────── */
  const [scrollProgress, setScrollProgress] = useState(0)
  const pathRef = useRef(null)
  const [pathLength, setPathLength] = useState(0)

  // Measure path length on mount
  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength())
    }
  }, [])

  // Calculate scroll progress percentage
  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      if (scrollHeight > 0) {
        const scrolled = window.scrollY / scrollHeight
        setScrollProgress(Math.min(Math.max(scrolled, 0), 1))
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll() // Init
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const animatedProgress = Math.min(scrollProgress * 1.15, 1)
  const drawOffset = pathLength - (animatedProgress * pathLength)

  // Auto-scroll console
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleLogs])

  /* ── Image selected ──────────────────────────────────────────── */
  const handleImageSelected = useCallback((file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setShowMockWarning(false)
    setPhase('selected')
    setConsoleLogs([
      '[BELL] Photograph received. Awaiting examination directive...'
    ])
  }, [previewUrl])

  /* ── Run analysis ────────────────────────────────────────────── */
  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return
    setPhase('analyzing')
    setConsoleLogs([])
    setShowMockWarning(false)
    soundManager.playSweep()

    let activeTimers = []

    SCAN_LOGS.forEach((log) => {
      const timer = setTimeout(() => {
        setConsoleLogs((prev) => [...prev, log.text])
        soundManager.playBeep(500 + Math.random() * 200, 'sine', 0.03, 0.015)
      }, log.time)
      activeTimers.push(timer)
    })

    const form = new FormData()
    form.append('file', imageFile)

    let apiResult = null
    try {
      const response = await axios.post(`${API_URL}/predict`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      apiResult = response.data
    } catch (err) { /* fallback */ }

    const completionTimer = setTimeout(() => {
      if (apiResult) {
        setResult(apiResult)
        setPhase('done')
      } else {
        setConsoleLogs((prev) => [
          ...prev,
          '[BELL] Backend offline — engaging local cognitive simulator...',
          '[BELL] Simulation complete. Dispatching forensic results.'
        ])

        const nameLower = imageFile.name.toLowerCase()
        const isMockFake = nameLower.includes('fake') || nameLower.includes('deep') || nameLower.includes('ai') || nameLower.includes('gan')

        const mockResult = {
          verdict: isMockFake ? 'FAKE' : 'REAL',
          confidence: 82.0 + Math.random() * 16.5,
          probabilities: {
            real: isMockFake ? 4.0 + Math.random() * 12 : 82.0 + Math.random() * 16.5,
            fake: isMockFake ? 82.0 + Math.random() * 16.5 : 4.0 + Math.random() * 12
          }
        }

        setShowMockWarning(true)
        setTimeout(() => {
          setResult(mockResult)
          setPhase('done')
          if (isMockFake) { soundManager.playWarning() } else { soundManager.playSuccess() }
        }, 500)
      }
    }, 2200)

    activeTimers.push(completionTimer)
    return () => activeTimers.forEach(clearTimeout)
  }, [imageFile])

  /* ── Reset ───────────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(null)
    setPreviewUrl(null)
    setResult(null)
    setPhase('idle')
    setShowMockWarning(false)
    setConsoleLogs([])
  }, [previewUrl])

  /* ════════════════════════════════════════════════════════════════
     RENDER
     ════════════════════════════════════════════════════════════════ */
  return (
    <div className="relative min-h-screen bg-[var(--bg-parchment)]">

      {/* Parchment texture overlay */}
      <div className="parchment-overlay z-0"></div>

      <Header />

      <div className="relative z-10 mx-auto w-full lg:grid lg:grid-cols-12 pt-14">
        
        {/* ═══════════════════════════════════════════════════════════
            LEFT COLUMN — TIMELINE TREE STORY
            ═══════════════════════════════════════════════════════════ */}
        <main className="lg:col-span-6 xl:col-span-6 relative w-full h-[5600px] overflow-hidden">
          
          {/* THE SVG TIMELINE TREE */}
          <svg 
            className="absolute inset-0 w-full h-full pointer-events-none" 
            viewBox="0 0 1000 5600" 
            preserveAspectRatio="xMidYMin slice"
          >
            {/* Trunk Background Track */}
            <path 
              d="M 500,100 C 200,600 200,1200 500,1800 C 800,2400 800,3000 500,3600 C 200,4200 200,4800 500,5400" 
              fill="none" 
              stroke="var(--maroon-dim)" 
              strokeWidth="2" 
              strokeDasharray="12 12" 
            />

            {/* Horizontal Branches (Static) */}
            <g stroke="var(--maroon-dim)" strokeWidth="3" strokeDasharray="6 6">
              {/* Y=700 Image 1 */}
              <line x1="250" y1="700" x2="500" y2="700" />
              <circle cx="250" cy="700" r="8" fill="var(--maroon)" stroke="none" />
              
              {/* Y=1300 Text 1 */}
              <line x1="250" y1="1300" x2="500" y2="1300" />
              <circle cx="250" cy="1300" r="8" fill="var(--maroon)" stroke="none" />

              {/* Y=1900 Image 2 */}
              <line x1="550" y1="1900" x2="500" y2="1900" />
              <circle cx="550" cy="1900" r="8" fill="var(--maroon)" stroke="none" />

              {/* Y=2500 Text 2 */}
              <line x1="750" y1="2500" x2="500" y2="2500" />
              <circle cx="750" cy="2500" r="8" fill="var(--maroon)" stroke="none" />

              {/* Y=3100 Image 3 */}
              <line x1="750" y1="3100" x2="500" y2="3100" />
              <circle cx="750" cy="3100" r="8" fill="var(--maroon)" stroke="none" />

              {/* Y=3700 Text 3 */}
              <line x1="450" y1="3700" x2="500" y2="3700" />
              <circle cx="450" cy="3700" r="8" fill="var(--maroon)" stroke="none" />

              {/* Y=4300 Text 4 */}
              <line x1="250" y1="4300" x2="500" y2="4300" />
              <circle cx="250" cy="4300" r="8" fill="var(--maroon)" stroke="none" />

              {/* Y=4900 Image 4 */}
              <line x1="250" y1="4900" x2="500" y2="4900" />
              <circle cx="250" cy="4900" r="8" fill="var(--maroon)" stroke="none" />
            </g>
            
            {/* The Animated Trunk (Draws on scroll) */}
            <path 
              id="story-line"
              ref={pathRef}
              d="M 500,100 C 200,600 200,1200 500,1800 C 800,2400 800,3000 500,3600 C 200,4200 200,4800 500,5400" 
              fill="none" 
              stroke="var(--maroon)" 
              strokeWidth="5" 
              strokeDasharray={pathLength || 1}
              strokeDashoffset={drawOffset}
              style={{ transition: 'stroke-dashoffset 0.1s ease-out' }}
            />
          </svg>

          {/* ── HTML ANCHORS (Images and Horizontal Text blocks) ── */}
          
          {/* TITLE */}
          <div className="absolute top-[3%] left-1/2 -translate-x-1/2 text-center w-full px-4 z-10">
            <p className="chapter-label mb-2">A Story of Truth & Deception</p>
            <div className="ornament-divider w-full max-w-[100px] mx-auto mb-4"><div className="ornament-diamond"></div></div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-[var(--text-primary)] leading-[1.15] tracking-wide">
              The Rider Who<br /><span className="text-[var(--maroon)]">Chased Shadows</span>
            </h1>
            <p className="font-body text-sm sm:text-base text-[var(--text-muted)] max-w-sm mx-auto mt-4">
              Scroll down to follow the path of truth.
            </p>
          </div>

          {/* IMAGE 1 (Y=700 -> 12.5%) */}
          <div className="absolute top-[12.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] sm:w-[75%] max-w-2xl z-10">
            <div className="illustration-frame aspect-[16/10] shadow-2xl bg-[var(--bg-parchment-warm)] p-3 border border-[var(--border-aged)] rotate-[-1deg] hover:rotate-0 transition-transform duration-500">
              <img src="/chapter_1_rider.png" alt="William rides" className="w-full h-full object-cover rounded-sm" />
            </div>
          </div>

          {/* TEXT 1 (Y=1300 -> 23.2%) */}
          <div className="absolute top-[23.2%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] sm:w-[65%] max-w-xl z-10 text-center">
            <div className="vintage-card p-6 sm:p-8 bg-white/80 backdrop-blur shadow-xl">
              <p className="chapter-label mb-3">1839</p>
              <h2 className="chapter-heading mb-4 text-2xl">The Mysterious Photograph</h2>
              <p className="font-body text-lg text-[var(--text-body)] leading-relaxed">
                Investigator William Ashford rides with a strange daguerreotype showing a man smirking outside the Bank of London. The note claims he's a thief—but Edmund Hale had been dead for six years.
              </p>
            </div>
          </div>

          {/* IMAGE 2 (Y=1900 -> 33.9%) */}
          <div className="absolute top-[33.9%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] sm:w-[75%] max-w-2xl z-10">
            <div className="illustration-frame aspect-[16/10] shadow-2xl bg-[var(--bg-parchment-warm)] p-3 border border-[var(--border-aged)] rotate-[2deg] hover:rotate-0 transition-transform duration-500">
              <img src="/chapter_2_professor.png" alt="Professor in studio" className="w-full h-full object-cover rounded-sm" />
            </div>
          </div>

          {/* TEXT 2 (Y=2500 -> 44.6%) */}
          <div className="absolute top-[44.6%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] sm:w-[65%] max-w-xl z-10 text-center">
            <div className="vintage-card p-6 sm:p-8 bg-white/80 backdrop-blur shadow-xl">
              <p className="chapter-label mb-3">The Studio</p>
              <h2 className="chapter-heading mb-4 text-2xl">A Fatal Flaw</h2>
              <p className="font-body text-lg text-[var(--text-body)] leading-relaxed">
                Professor Bell spots a lie in the shadows. The man's shadow falls left; the building's falls right. Two photographs pressed together. The ghost image was a decoy.
              </p>
            </div>
          </div>

          {/* IMAGE 3 (Y=3100 -> 55.3%) */}
          <div className="absolute top-[55.3%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] sm:w-[75%] max-w-2xl z-10">
            <div className="illustration-frame aspect-[16/10] shadow-2xl bg-[var(--bg-parchment-warm)] p-3 border border-[var(--border-aged)] rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              <img src="/chapter_3_chase.png" alt="Chase" className="w-full h-full object-cover rounded-sm" />
            </div>
          </div>

          {/* TEXT 3 (Y=3700 -> 66.0%) */}
          <div className="absolute top-[66.0%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] sm:w-[65%] max-w-xl z-10 text-center">
            <div className="vintage-card p-6 sm:p-8 bg-white/80 backdrop-blur shadow-xl">
              <p className="chapter-label mb-3">The Culprit</p>
              <h2 className="chapter-heading mb-4 text-2xl">The First Forger</h2>
              <p className="font-body text-lg text-[var(--text-body)] leading-relaxed">
                Hunting real shadows across three counties, William catches Thomas Crewe. The lesson was clear: the moment a new technology is born, someone figures out how to lie with it.
              </p>
            </div>
          </div>

          {/* TEXT 4 (Y=4300 -> 76.7%) */}
          <div className="absolute top-[76.7%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] sm:w-[65%] max-w-xl z-10 text-center">
            <div className="vintage-card p-6 sm:p-8 bg-white/80 backdrop-blur shadow-xl border-l-4 border-[var(--maroon)]">
              <p className="story-quote-large text-2xl sm:text-3xl text-[var(--maroon)]">
                "He hoped the future would build something smarter than a human eye to catch them."
              </p>
            </div>
          </div>

          {/* IMAGE 4 (Y=4900 -> 87.5%) */}
          <div className="absolute top-[87.5%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] sm:w-[80%] max-w-3xl z-10 text-center">
            <div className="illustration-frame aspect-[16/9] shadow-2xl mb-6 bg-[var(--bg-parchment-warm)] p-3 border border-[var(--border-aged)]">
              <img src="/chapter_4_verification.png" alt="Forensic neural verification" className="w-full h-full object-cover rounded-sm" />
            </div>
            <p className="font-body text-xl italic text-[var(--text-muted)] font-bold">The machine sees the shadows we cannot. Verification complete.</p>
          </div>
          
        </main>


        {/* ═══════════════════════════════════════════════════════════
            RIGHT COLUMN — MVP SCANNER (Sticky on Desktop)
            ═══════════════════════════════════════════════════════════ */}
        <aside id="scanner" className="lg:col-span-6 xl:col-span-6 relative bg-[var(--bg-parchment-warm)] lg:bg-transparent border-t lg:border-t-0 border-[var(--border-aged)] shadow-[0_-10px_30px_rgba(42,31,26,0.03)] lg:shadow-none">
          
          <div className="lg:sticky lg:top-[3.5rem] lg:h-[calc(100vh-3.5rem)] flex flex-col lg:justify-center px-4 sm:px-8 py-16 lg:py-0 border-l-0 lg:border-l border-[var(--border-aged)] relative z-20">
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-parchment-dark)] to-transparent opacity-20 pointer-events-none rounded-2xl hidden lg:block m-4"></div>

            <div className="relative z-30 w-full max-w-xl mx-auto flex flex-col gap-8 max-h-full lg:overflow-y-auto custom-scrollbar lg:pr-2 pb-12 lg:pb-0">
              
              <div className="text-center mb-6">
                <p className="font-mono text-[10px] tracking-widest uppercase text-[var(--text-faint)] mb-3">
                  185 years later
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-5">
                  The Modern Eye
                </h2>
                
                {/* INSTRUCTION GUIDE */}
                {phase === 'idle' && (
                  <div className="bg-[var(--bg-parchment)] border border-[var(--border-aged)] p-4 sm:p-5 rounded-md text-left mb-2 shadow-sm">
                    <h3 className="font-display font-bold text-[var(--text-primary)] text-sm sm:text-base mb-3 border-b border-[var(--border-aged)] pb-2 flex items-center gap-2">
                      <span className="led-dot active"></span>
                      Laboratory Instructions
                    </h3>
                    <ul className="list-disc pl-4 space-y-2 font-body text-[11px] sm:text-xs text-[var(--text-body)] leading-relaxed">
                      <li><strong>Upload</strong> any portrait or photograph you wish to examine.</li>
                      <li><strong>Analyze:</strong> Our neural network will scan for synthetic textures, blending artifacts, and generative anomalies.</li>
                      <li><strong>Review</strong> the forensic confidence score to determine if the image is an authentic photograph or a modern forgery.</li>
                    </ul>
                  </div>
                )}
              </div>

              {/* IDLE PHASE (Upload) */}
              {phase === 'idle' && (
                <div className="flex justify-center transition-all duration-500 ease-out animate-fade-in">
                  <Uploader onImageSelected={handleImageSelected} />
                </div>
              )}

              {/* ANALYZING & DONE PHASES */}
              {phase !== 'idle' && (
                <div className="flex flex-col gap-6 animate-fade-in w-full">

                  <div className="w-full flex flex-col gap-3">
                    <div className={`vintage-card vintage-corners relative overflow-hidden p-2 ${
                      phase === 'analyzing' ? 'border-[var(--gold)]' : ''
                    }`}>
                      <div className="vintage-corners-inner"></div>

                      {phase === 'done' && result ? (
                        <div className="relative w-full overflow-hidden aspect-[4/3] select-none rounded bg-[var(--bg-parchment-dark)]">
                          <img
                            src={previewUrl}
                            alt="Original photograph"
                            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                          />
                          <div
                            className="absolute inset-0 w-full h-full overflow-hidden z-10"
                            style={{ width: `${sliderPos}%` }}
                          >
                            <img
                              src={previewUrl}
                              alt="Spectral analysis"
                              className="absolute inset-0 w-full h-full object-contain pointer-events-none"
                              style={{
                                width: '100%',
                                maxWidth: 'none',
                                filter: 'hue-rotate(240deg) saturate(3) contrast(1.4) brightness(1.1)'
                              }}
                            />
                          </div>

                          <div
                            className="absolute top-0 bottom-0 w-[2px] bg-[var(--maroon)] z-20"
                            style={{ left: `${sliderPos}%` }}
                          >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-[var(--surface-card)] border border-[var(--maroon)] rounded-full flex items-center justify-center shadow-md cursor-ew-resize">
                              <span className="text-[11px] text-[var(--maroon)] font-black select-none">↔</span>
                            </div>
                          </div>

                          <div className="absolute left-2 bottom-2 z-20 font-mono text-[8px] bg-[var(--surface-card)] border border-[var(--border-aged)] px-1 py-0.5 rounded text-[var(--text-muted)]">
                            ORIGINAL
                          </div>
                          <div className="absolute right-2 bottom-2 z-20 font-mono text-[8px] bg-[var(--surface-card)] border border-[var(--border-aged)] px-1 py-0.5 rounded text-[var(--text-muted)]">
                            SPECTRAL
                          </div>

                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={sliderPos}
                            onChange={(e) => setSliderPos(Number(e.target.value))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                          />
                        </div>
                      ) : (
                        <div className="relative w-full aspect-[4/3] flex items-center justify-center border border-[var(--border-aged)] bg-[var(--bg-parchment-dark)] rounded">
                          <img
                            src={previewUrl}
                            alt="Photograph under examination"
                            className={`max-w-full max-h-full object-contain block ${
                              phase === 'analyzing' ? 'brightness-90 saturate-[0.3] contrast-110 transition-all duration-300' : ''
                            }`}
                          />
                          {phase === 'analyzing' && <div className="scan-sweep-h"></div>}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center px-2 font-mono text-[9px] text-[var(--text-faint)] border-b border-[var(--border-aged)] pb-1">
                      <span className="truncate max-w-[70%]" title={imageFile?.name}>File: {imageFile?.name}</span>
                      <span>{(imageFile ? imageFile.size / 1024 / 1024 : 0).toFixed(2)} MB</span>
                    </div>
                  </div>

                  <div className="w-full flex flex-col gap-4">

                    {phase === 'selected' && (
                      <div className="vintage-card vintage-corners p-5 sm:p-6 flex flex-col gap-4 animate-fade-in">
                        <div className="vintage-corners-inner"></div>

                        <div className="flex items-center justify-between border-b border-[var(--border-aged)] pb-3">
                          <h3 className="font-display text-sm sm:text-base font-bold text-[var(--text-primary)]">Photograph Received</h3>
                          <span className="led-dot active pulse"></span>
                        </div>

                        <p className="font-body text-xs sm:text-sm text-[var(--text-body)] leading-relaxed">
                          Professor Bell's neural successor stands ready to analyze this image for synthetic textures and generative artifacts.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 mt-2">
                          <button className="btn-vintage flex-1 text-[10px] sm:text-xs py-3" onClick={handleAnalyze}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="11" cy="11" r="8" />
                              <path d="M21 21l-4.35-4.35" />
                            </svg>
                            Examine Photograph
                          </button>
                          <button className="btn-ghost flex-1 text-[10px] sm:text-xs py-3" onClick={handleReset}>
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {phase === 'analyzing' && (
                      <div className="vintage-card vintage-corners p-5 flex flex-col gap-4 animate-fade-in">
                        <div className="vintage-corners-inner"></div>

                        <div className="flex items-center justify-between border-b border-[var(--border-aged)] pb-2">
                          <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">Examination in Progress</h3>
                          <span className="font-mono text-[10px] text-[var(--gold)] animate-pulse">ANALYZING</span>
                        </div>

                        <div className="console-vintage flex flex-col gap-2 min-h-[120px] max-h-[120px]">
                          {consoleLogs.map((log, idx) => (
                            <div key={idx} className="flex items-start">
                              <span className="console-prefix select-none">&gt;&gt;</span>
                              <span>{log}</span>
                            </div>
                          ))}
                          <div ref={consoleBottomRef} />
                        </div>

                        <div className="flex items-center justify-between pt-1 font-mono text-[9px]">
                          <div className="flex items-center gap-2">
                            <div className="h-2.5 w-2.5 border-2 border-t-[var(--maroon)] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin" />
                            <span className="text-[var(--text-muted)]">Examining spectral frequencies</span>
                          </div>
                          <span className="font-bold text-[var(--maroon)]">
                            {Math.round((consoleLogs.length / SCAN_LOGS.length) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {phase === 'done' && result && (
                      <div className="animate-fade-in w-full">
                        {showMockWarning && (
                          <div className="mb-4 border border-[var(--border-ornament)] bg-[var(--gold-dim)] p-2.5 flex items-center gap-3 rounded-md font-mono text-[9px] text-[var(--text-muted)]">
                            <span className="led-dot active pulse shrink-0"></span>
                            <span>Backend offline — using local simulation based on filename heuristics.</span>
                          </div>
                        )}
                        <ResultCard result={result} onReset={handleReset} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>

      </div>
    </div>
  )
}
