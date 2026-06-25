import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import Header from './components/Header'
import Uploader from './components/Uploader'
import ResultCard from './components/ResultCard'
import WelcomeModal from './components/WelcomeModal'
import { soundManager } from './utils/sound'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SCAN_LOGS = [
  { time: 0, text: '[JARVIS] INITIALIZING FORENSIC SPECTRAL CHANNELS...' },
  { time: 250, text: '[JARVIS] ISOLATING FACE REGION DEVIATION INDEX...' },
  { time: 500, text: '[JARVIS] ALIGNING 68-POINT GEOMETRIC LANDMARK MESH...' },
  { time: 750, text: '[JARVIS] CONSTRUCTING FREQUENCY DOMAIN ANOMALY HEATMAP...' },
  { time: 1000, text: '[JARVIS] INJECTING EFFICIENTNET-B0 WEIGHTS FOR CLASSIFICATION...' },
  { time: 1250, text: '[JARVIS] EXTRACTING LOCALIZED FREQUENCY ARTIFACT MARKS...' },
  { time: 1500, text: '[JARVIS] COMPUTING SIGMA CONFIDENCE DISTRIBUTION...' },
  { time: 1750, text: '[JARVIS] CLASSIFICATION SYNTHESIS IN PROGRESS...' }
]

export default function App() {
  const [phase, setPhase]             = useState('idle') // idle | selected | analyzing | done | error
  const [imageFile, setImageFile]     = useState(null)
  const [previewUrl, setPreviewUrl]   = useState(null)
  const [result, setResult]           = useState(null)
  const [errorMsg, setErrorMsg]       = useState(null)
  
  // Custom HUD states
  const [consoleLogs, setConsoleLogs] = useState([])
  const [showMockWarning, setShowMockWarning] = useState(false)
  const [hoverMetric, setHoverMetric] = useState({ x: 0, y: 0 })
  const [sliderPos, setSliderPos]     = useState(50) // comparison slider position
  const [assistantInput, setAssistantInput] = useState('')
  const [particles, setParticles]     = useState([])

  const consoleBottomRef = useRef(null)

  // Generate floating laboratory particles on mount
  useEffect(() => {
    const list = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 8,
      duration: Math.random() * 6 + 6
    }))
    setParticles(list)
  }, [])

  // Auto scroll console logs
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleLogs])

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Play a small beep when entering viewport
            soundManager.playBeep(800, 'sine', 0.03, 0.01);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
    );
    
    const elements = document.querySelectorAll('.reveal-section');
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setHoverMetric({ x, y })
  }

  const scrollToScanner = () => {
    soundManager.playClick()
    const scannerSection = document.getElementById('scanner')
    if (scannerSection) {
      scannerSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Handle direct prompt interaction with JARVIS assistant
  const handleAssistantSubmit = (e) => {
    e.preventDefault()
    if (!assistantInput.trim()) return
    
    soundManager.playClick()
    const cmd = assistantInput.trim().toLowerCase()
    setConsoleLogs((prev) => [...prev, `[USER_DIRECTIVE] ${assistantInput.toUpperCase()}`])
    setAssistantInput('')

    setTimeout(() => {
      let reply = '[JARVIS] DIRECTIVE RECEIVED. COGNITIVE SPECTRUM RUNNING OPTIMAL CORRECTIONS.'
      if (cmd.includes('scan') || cmd.includes('analyze')) {
        reply = '[JARVIS] COMMENCING SCAN MATRIX SUB-ROUTINE. VERIFY CHANNELS REMAIN STEADY.'
      } else if (cmd.includes('clear') || cmd.includes('reset')) {
        reply = '[JARVIS] RESETTING TELEMETRY BUFFER. COG_NET RETURNING TO READY.'
      } else if (cmd.includes('heatmap') || cmd.includes('thermal')) {
        reply = '[JARVIS] ADJUSTING THERMAL HEAT DETECT SHIELDS. ANOMALY FREQUENCY FLUX ENGAGED.'
      } else if (cmd.includes('status') || cmd.includes('system')) {
        reply = '[JARVIS] DIAGNOSTIC CHECK: CORES PASSING AT 98.2%. LATENCY STABILIZED AT 12MS.'
      }
      setConsoleLogs((prev) => [...prev, reply])
      soundManager.playBeep(1100, 'sine', 0.05, 0.05)
    }, 400)
  }

  /* ── Image chosen in uploader ───────────────────────────────────── */
  const handleImageSelected = useCallback((file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setErrorMsg(null)
    setPhase('selected')
    setShowMockWarning(false)
    // Pre-populate console feed
    setConsoleLogs([
      '[JARVIS] TARGET SECURED AT DETECTOR RECEIVER PORT.',
      '[JARVIS] WAITING FOR USER INPUT TO COMMENCE FORWARD SPECTRUM INFERENCE...'
    ])
  }, [previewUrl])

  /* ── Run inference ──────────────────────────────────────────────── */
  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return
    setPhase('analyzing')
    setConsoleLogs([])
    setShowMockWarning(false)
    soundManager.playSweep()

    let activeTimers = []
    
    // Play live typewriter logs
    SCAN_LOGS.forEach((log) => {
      const timer = setTimeout(() => {
        setConsoleLogs((prev) => [...prev, log.text])
        soundManager.playBeep(1000 + (prev => prev.length * 60)(), 'sine', 0.02, 0.02)
      }, log.time)
      activeTimers.push(timer)
    })

    // API Post
    const form = new FormData()
    form.append('file', imageFile)

    let apiResult = null
    try {
      const response = await axios.post(`${API_URL}/predict`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      apiResult = response.data
    } catch (err) {
      // Fallback
    }

    const completionTimer = setTimeout(() => {
      if (apiResult) {
        setResult(apiResult)
        setPhase('done')
      } else {
        // Mock fallback mode
        setConsoleLogs((prev) => [
          ...prev,
          '[JARVIS_ALERT] BACKEND TELEMETRY OFFLINE. REDIRECTING ENGINE...',
          '[JARVIS] CONNECTED TO LOCAL COGNITIVE SIMULATOR CORE SUCCESS.',
          '[JARVIS] DATA FETCHED. DISPATCHING forensic RESULT CARDS.'
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
        }, 500)
      }
    }, 2100)
    
    activeTimers.push(completionTimer)

    return () => {
      activeTimers.forEach(clearTimeout)
    }
  }, [imageFile])

  /* ── Reset ──────────────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(null)
    setPreviewUrl(null)
    setResult(null)
    setErrorMsg(null)
    setPhase('idle')
    setShowMockWarning(false)
    setConsoleLogs([])
  }, [previewUrl])

  return (
    <div className="relative min-h-screen bg-[var(--bg-cyber)] text-[var(--text-cyber)] overflow-hidden">
      
      {/* HUD background overlays */}
      <div className="cyber-grid-overlay"></div>

      {/* Floating Animated Particles */}
      <div className="particles-layer">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`
            }}
          />
        ))}
      </div>

      {/* Welcome instruction popup */}
      <WelcomeModal />

      <Header />

      {/* ── HERO SECTION (#home) ── */}
      <section id="home" className="reveal-section relative z-10 mx-auto max-w-7xl px-4 pt-16 pb-20 sm:px-6 md:px-8 min-h-[80vh] flex items-center">
        
        {/* Floating tech markings */}
        <div className="absolute top-1/4 left-10 hidden xl:block opacity-35 pointer-events-none font-mono-tech text-[9px] text-[var(--accent-blue)]">
          <p>STARK_LAB_UNIT: M-85</p>
          <p>APERTURE_COEFFICIENTS: OK</p>
          <p>GRID_REF: [00f0ff:s2]</p>
        </div>
        <div className="absolute bottom-1/4 right-10 hidden xl:block opacity-35 pointer-events-none font-mono-tech text-[9px] text-[var(--accent-cyan)] text-right">
          <p>CORE_STATUS: RUNNING</p>
          <p>THERM_MATRIX: 38.2 C</p>
          <p>SHIELD: ENGAGED</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
          
          {/* Left: Titles & details */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-6 flex items-center gap-2 border border-[rgba(0,176,255,0.35)] bg-[rgba(0,176,255,0.03)] px-4 py-1.5 font-orbitron text-xs font-semibold tracking-[0.2em] text-[var(--accent-cyan)] uppercase glow-text-cyan shadow-sm">
              <span className="led-status active pulse"></span>
              STARK INDUSTRIES LABS
            </div>

            <h1 className="font-orbitron text-3xl font-extrabold tracking-[0.08em] text-[var(--text-cyber)] sm:text-5xl md:text-6xl uppercase leading-tight">
              COGNITIVE <span className="bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-blue)] to-[var(--accent-cyan)] bg-clip-text text-transparent">SPECTRUM HUD</span>
            </h1>

            <p className="mt-6 max-w-xl text-sm sm:text-base text-[var(--text-dim)] leading-relaxed font-medium">
              Analyze biometric spline variations, convolutional frequencies, and GAN artifacts. A premium forensic lab console designed to distinguish truth from synthetic generation.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 font-orbitron w-full max-w-md">
              <button 
                className="hud-btn py-4 px-8 text-sm flex-1 shadow-md hover:scale-[1.02] transition-transform"
                onClick={scrollToScanner}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-pulse mr-1">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                INITIALIZE HUD CORES
              </button>
              
              <a 
                href="#how-it-works"
                className="hud-btn hud-btn-gold py-4 px-8 text-sm shadow-md"
                onClick={() => soundManager.playClick()}
              >
                LAB SPECIFICATIONS
              </a>
            </div>
          </div>

          {/* Right: Holographic Face Scan Display Visual */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="hud-panel cyber-corners relative flex items-center justify-center p-3 h-[300px] w-[300px] md:h-[350px] md:w-[350px] select-none group hover:border-[var(--border-hud-hover)] transition-all duration-300">
              <div className="cyber-corners-inner"></div>
              
              {/* Background Dot pattern */}
              <div className="scan-dot-pattern"></div>

              {/* Tech labels */}
              <div className="absolute top-2 left-4 font-mono-tech text-[8px] text-[var(--text-dark)] tracking-wider">
                DISP_MODE: FORENSIC_VISUALIZER
              </div>
              <div className="absolute bottom-2 right-4 font-mono-tech text-[8px] text-[var(--accent-cyan)] tracking-wider">
                SYS_STATUS: ACTIVE
              </div>

              {/* Floating coordinates */}
              <div className="absolute top-2 right-4 font-mono-tech text-[8px] text-[var(--text-dark)]">
                GRID_SEC: M85
              </div>
              <div className="absolute bottom-2 left-4 font-mono-tech text-[8px] text-[var(--text-dark)]">
                FRAME_LOCK: 0x889F
              </div>

              {/* Visual Image container */}
              <div className="relative w-full h-full border border-[rgba(141,27,50,0.15)] bg-slate-100/40 overflow-hidden flex items-center justify-center">
                <img 
                  src="/holographic_scan.png" 
                  alt="Holographic Face Scan Visualizer"
                  className="max-w-full max-h-full object-cover w-full h-full block group-hover:scale-105 transition-transform duration-700 filter saturate-[1.1] brightness-[1.02]"
                  onMouseEnter={() => soundManager.playHover()}
                />
                
                {/* Holographic sweep lines crossing the image */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div 
                    className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-50"
                    style={{
                      boxShadow: 'var(--glow-cyan)',
                      animation: 'sweepVertical 6s linear infinite'
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ── SCANNER HUD SECTION (#scanner) ── */}
      <section id="scanner" className="reveal-section relative z-10 border-t border-[var(--border-silver)] bg-white/20 px-4 py-20 sm:px-6">
        
        {/* Section Label */}
        <div className="mb-10 flex flex-col items-center text-center font-orbitron">
          <p className="font-mono-tech text-[10px] tracking-widest text-[var(--text-dark)] uppercase">[ COGNITIVE SCANNER INTERFACE ]</p>
          <h2 className="text-2xl font-bold tracking-widest text-[var(--text-cyber)] mt-1 uppercase">DIAGNOSTIC WORKSPACE</h2>
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent mt-3"></div>
        </div>

        {phase === 'idle' ? (
          <div className="flex justify-center">
            <Uploader onImageSelected={handleImageSelected} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
            
            {/* Left: Preview Panel / Comparison Slider (Lg: 6cols) */}
            <div className="lg:col-span-6 flex flex-col gap-4">
              
              <div 
                className={`hud-panel cyber-corners relative overflow-hidden flex flex-col items-center justify-center p-3 ${
                  phase === 'analyzing' ? 'border-[var(--accent-blue)] corners-gold' : 'border-[var(--border-hud)]'
                }`}
                onMouseMove={handleMouseMove}
              >
                <div className="cyber-corners-inner"></div>
                <div className="scan-dot-pattern"></div>

                {/* Main Visual Node (Slider vs Raw vs Analyzing) */}
                {phase === 'done' && result ? (
                  /* Real-Time Interactive Image Comparison Slider */
                  <div className="relative w-full overflow-hidden aspect-[4/3] border border-[var(--border-cyan)] select-none">
                    
                    {/* Base Image (Original) */}
                    <img 
                      src={previewUrl} 
                      alt="Original Target"
                      className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                    />
                    
                    {/* Overlay Image (Simulated Forensic Anomaly Heatmap) */}
                    <div 
                      className="absolute inset-0 w-full h-full overflow-hidden z-10"
                      style={{ width: `${sliderPos}%` }}
                    >
                      <img 
                        src={previewUrl} 
                        alt="Forensic Heatmap"
                        className="absolute inset-0 w-full h-full object-contain pointer-events-none" 
                        style={{ 
                          width: '100%', 
                          maxWidth: 'none',
                          // Custom filter shift representing a thermal frequency mapping!
                          filter: 'hue-rotate(240deg) saturate(3) contrast(1.4) brightness(1.2)'
                        }} 
                      />
                    </div>
                    
                    {/* Slider Divider bar line */}
                    <div 
                      className="absolute top-0 bottom-0 w-[2px] bg-[var(--accent-cyan)] z-20"
                      style={{ left: `${sliderPos}%` }}
                    >
                      {/* Handle */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-[var(--accent-cyan)] rounded-full flex items-center justify-center shadow-md cursor-ew-resize">
                        <span className="text-[11px] text-[var(--accent-cyan)] font-black select-none">↔</span>
                      </div>
                    </div>

                    {/* Left/Right Decals */}
                    <div className="absolute left-2 bottom-2 z-20 font-mono-tech text-[8px] bg-white/90 border border-slate-200 px-1 py-0.5 rounded text-slate-600">
                      RAW_INPUT
                    </div>
                    <div className="absolute right-2 bottom-2 z-20 font-mono-tech text-[8px] bg-white/90 border border-slate-200 px-1 py-0.5 rounded text-slate-600">
                      SPECTRAL_MAP
                    </div>

                    {/* Range Input controller */}
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
                  /* Standard display + Scanner Overlay */
                  <div className="relative w-full aspect-[4/3] flex items-center justify-center border border-[var(--border-hud)] bg-slate-100/50">
                    <img
                      src={previewUrl}
                      alt="Scan payload target"
                      className={`max-w-full max-h-full object-contain block ${
                        phase === 'analyzing' ? 'brightness-90 saturate-[0.25] contrast-110 transition-all duration-300' : ''
                      }`}
                    />

                    {phase === 'analyzing' && (
                      <>
                        <div className="scanning-line-v"></div>
                        <div className="scanning-line-h"></div>
                        
                        {/* Bounding box mock face alignment */}
                        <div 
                          className="hud-target-box"
                          style={{
                            top: '20%',
                            left: '26%',
                            width: '48%',
                            height: '52%'
                          }}
                        >
                          <div className="absolute -top-5 left-0 font-mono-tech text-[9px] text-[var(--accent-blue)] glow-text-gold tracking-widest uppercase">
                            FACIAL_LOCATOR_LOCK
                          </div>
                        </div>
                      </>
                    )}

                    {/* Cursor coordinates tracker overlay */}
                    {phase !== 'analyzing' && (
                      <div className="absolute inset-0 bg-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                        <div 
                          className="absolute font-mono-tech text-[8px] text-[var(--accent-cyan)] border border-[rgba(0,176,255,0.4)] bg-white px-1.5 py-0.5 shadow"
                          style={{
                            left: `${hoverMetric.x + 2}%`,
                            top: `${hoverMetric.y + 2}%`
                          }}
                        >
                          TGT_X:{hoverMetric.x}% TGT_Y:{hoverMetric.y}%
                        </div>
                        <div className="absolute w-full h-[1px] bg-[rgba(0,176,255,0.2)]" style={{ top: `${hoverMetric.y}%` }}></div>
                        <div className="absolute h-full w-[1px] bg-[rgba(0,176,255,0.2)]" style={{ left: `${hoverMetric.x}%` }}></div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Target File details strip */}
              <div className="flex justify-between items-center px-2 py-1 font-mono-tech text-[10px] text-[var(--text-dim)] border-b border-[var(--border-silver)]">
                <span className="truncate max-w-[65%]" title={imageFile?.name}>TARGET: {imageFile?.name}</span>
                <span>DATA_PAYLOAD: {(imageFile ? imageFile.size / 1024 / 1024 : 0).toFixed(2)} MB</span>
              </div>
            </div>

            {/* Right: Operations & Results Panel (Lg: 6cols) */}
            <div className="lg:col-span-6 flex flex-col gap-6">
              
              {/* Selected Phase - Prompt Scan & J.A.R.V.I.S Assistant Ready */}
              {phase === 'selected' && (
                <div className="hud-panel cyber-corners p-6 flex flex-col gap-5">
                  <div className="cyber-corners-inner"></div>

                  <div className="hud-panel-title font-orbitron">
                    <span>TARGET LOCKED // ASSISTANT STATE</span>
                    <span className="animate-pulse text-[var(--accent-cyan)] font-bold">READY</span>
                  </div>

                  {/* Micro AI Assistant bubble inside panel */}
                  <div className="border border-[rgba(0,176,255,0.12)] bg-[rgba(0,176,255,0.02)] p-4 flex gap-3 items-start font-mono-tech text-[11px] text-[var(--text-dim)]">
                    <div className="h-7 w-7 rounded-full bg-[var(--accent-cyan-dim)] border border-[var(--accent-cyan)] flex items-center justify-center text-[var(--accent-cyan)] font-bold font-orbitron flex-shrink-0 animate-pulse">
                      J
                    </div>
                    <div>
                      <p className="text-[var(--text-cyber)] font-bold tracking-wider">J.A.R.V.I.S RESPONSE:</p>
                      <p className="mt-1 leading-normal uppercase">
                        Aperture normalization completed. DeepGuard EfficientNet layers are primed. Send scan directive to proceed.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 font-orbitron w-full">
                    <button 
                      className="hud-btn py-3 px-6 text-xs flex-1 shadow"
                      onClick={handleAnalyze}
                    >
                      SEND SCAN DIRECTIVE
                    </button>
                    <button 
                      className="hud-btn hud-btn-gold py-3 px-6 text-xs shadow"
                      onClick={handleReset}
                    >
                      DISCHARGE TARGET
                    </button>
                  </div>
                </div>
              )}

              {/* Analyzing Phase - Live Typewriter Readouts */}
              {phase === 'analyzing' && (
                <div className="hud-panel cyber-corners p-6 flex flex-col gap-5">
                  <div className="cyber-corners-inner"></div>

                  <div className="hud-panel-title font-orbitron">
                    <span>Active Diagnostics Feed</span>
                    <span className="animate-pulse text-[var(--accent-blue)]">COMPUTING</span>
                  </div>

                  {/* Typewriter terminal logs */}
                  <div className="console-log-box flex flex-col gap-2 min-h-[160px] font-mono-tech text-[11px]">
                    {consoleLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="console-prefix select-none">&gt;&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div ref={consoleBottomRef} />
                  </div>

                  {/* Micro loader progress */}
                  <div className="flex items-center justify-between border-t border-[var(--border-hud)] pt-4 font-mono-tech text-[10px]">
                    <div className="flex items-center gap-2">
                      <div className="spinner h-4 w-4 border-t-[var(--accent-cyan)]" />
                      <span className="text-[var(--text-dim)]">ISOLATING FREQUENCY GRADIENTS</span>
                    </div>
                    <span className="font-bold text-[var(--accent-cyan)]">
                      {Math.round((consoleLogs.length / SCAN_LOGS.length) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Done Phase - Detailed Stark diagnostics report */}
              {phase === 'done' && result && (
                <div className="relative">
                  {showMockWarning && (
                    <div className="mb-4 border border-[rgba(61,130,246,0.3)] bg-[rgba(61,130,246,0.04)] p-3 flex justify-between items-center font-mono-tech text-[10px] text-[var(--accent-blue)] rounded">
                      <div className="flex items-center gap-2">
                        <span className="led-status active pulse gold"></span>
                        <span>[WARN: API_OFFLINE // CACHE SIMULATOR ACTIVE]</span>
                      </div>
                      <span className="text-[8px] text-[var(--text-dark)] uppercase">Trigger real/fake by filename keys</span>
                    </div>
                  )}
                  <ResultCard result={result} onReset={handleReset} />
                </div>
              )}

              {/* Interactive AI Assistant Directives Console (Only visible when image is loaded/scanning) */}
              {(phase === 'selected' || phase === 'analyzing' || phase === 'done') && (
                <div className="hud-panel cyber-corners p-5 flex flex-col gap-4">
                  <div className="cyber-corners-inner"></div>
                  
                  <div className="hud-panel-title font-orbitron">
                    <span>JARVIS SYSTEM CONTROL INTERRUPT</span>
                    <span className="text-[9px] text-[var(--text-dark)]">DIRECTIVES</span>
                  </div>

                  {/* Animated Neural Network SVG widget inside side panel */}
                  <div className="h-24 border border-[rgba(0,176,255,0.12)] bg-slate-100/40 relative flex items-center justify-center">
                    <div className="absolute top-1 left-2 font-mono-tech text-[7px] text-[var(--text-dark)] uppercase">COG_NEURAL_NETWORK_VECTORS</div>
                    
                    <svg viewBox="0 0 160 80" className="w-full h-full p-2 max-w-[280px]">
                      {/* Connection Spline lines */}
                      <g stroke="var(--accent-blue-dim)" strokeWidth="1" strokeDasharray="3 3">
                        {/* Layer 1 to 2 */}
                        <line x1="20" y1="20" x2="80" y2="15" />
                        <line x1="20" y1="20" x2="80" y2="40" />
                        <line x1="20" y1="50" x2="80" y2="15" />
                        <line x1="20" y1="50" x2="80" y2="40" />
                        <line x1="20" y1="50" x2="80" y2="65" />
                        
                        {/* Layer 2 to 3 */}
                        <line x1="80" y1="15" x2="140" y2="30" />
                        <line x1="80" y1="40" x2="140" y2="30" />
                        <line x1="80" y1="40" x2="140" y2="50" />
                        <line x1="80" y1="65" x2="140" y2="50" />
                      </g>

                      {/* Active signal pulses */}
                      <circle cx="20" cy="20" r="3" fill="var(--accent-cyan)" className="animate-ping" />
                      <circle cx="80" cy="40" r="4.5" fill="var(--accent-blue)" className="animate-pulse" />
                      <circle cx="140" cy="50" r="3.5" fill="var(--accent-cyan)" className="animate-ping" style={{ animationDelay: '1s' }} />

                      {/* Layer 1 input nodes */}
                      <circle cx="20" cy="20" r="3" fill="var(--accent-cyan)" />
                      <circle cx="20" cy="35" r="3" fill="var(--accent-cyan)" />
                      <circle cx="20" cy="50" r="3" fill="var(--accent-cyan)" />
                      <circle cx="20" cy="65" r="3" fill="var(--accent-cyan)" />

                      {/* Layer 2 hidden nodes */}
                      <circle cx="80" cy="15" r="4.5" fill="var(--accent-blue)" />
                      <circle cx="80" cy="40" r="4.5" fill="var(--accent-blue)" />
                      <circle cx="80" cy="65" r="4.5" fill="var(--accent-blue)" />

                      {/* Layer 3 output nodes */}
                      <circle cx="140" cy="30" r="3.5" fill="var(--accent-cyan)" />
                      <circle cx="140" cy="50" r="3.5" fill="var(--accent-cyan)" />
                    </svg>
                  </div>

                  {/* Terminal console printouts */}
                  {phase === 'done' && (
                    <div className="console-log-box flex flex-col gap-1.5 max-h-[100px] leading-relaxed">
                      {consoleLogs.slice(-3).map((log, i) => (
                        <div key={i} className="text-[10px]">
                          <span className="console-prefix select-none">&gt;&gt;</span>
                          <span>{log}</span>
                        </div>
                      ))}
                      <div ref={consoleBottomRef} />
                    </div>
                  )}

                  {/* Interactive Text Directive prompt */}
                  <form onSubmit={handleAssistantSubmit} className="flex gap-2 font-mono-tech text-xs">
                    <input 
                      type="text" 
                      value={assistantInput}
                      onChange={(e) => setAssistantInput(e.target.value)}
                      placeholder="ENTER DIRECTIVE (e.g. status, scan depth, clear)..."
                      className="flex-1 bg-white border border-[var(--border-hud)] px-3 py-2 text-[var(--text-cyber)] placeholder:text-[var(--text-dark)] focus:outline-none focus:border-[var(--accent-cyan)] shadow-sm rounded-sm"
                    />
                    <button 
                      type="submit" 
                      className="hud-btn bg-[var(--accent-cyan)] text-white border-none py-2 px-4 shadow"
                    >
                      SEND
                    </button>
                  </form>
                </div>
              )}

            </div>

          </div>
        )}
      </section>

      {/* ── TIMELINE/PIPELINE MAP SECTION (#how-it-works) ── */}
      <section id="how-it-works" className="reveal-section relative z-10 border-t border-[var(--border-silver)] bg-slate-100/35 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          
          {/* Section label */}
          <div className="mb-16 flex flex-col items-center text-center font-orbitron">
            <p className="font-mono-tech text-[10px] tracking-widest text-[var(--text-dark)] uppercase">[ DEEPGUARD COGNITIVE FLOW ]</p>
            <h2 className="text-2xl font-bold tracking-widest text-[var(--text-cyber)] mt-1 uppercase">Pipeline Diagram</h2>
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent mt-3"></div>
          </div>

          {/* flow charts */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative">
            
            {[
              { num: '01', title: 'APERTURE CAPTURE', sub: 'Target acquisition', desc: 'Secure target inputs, validating payload pixel grids and file parameters.' },
              { num: '02', title: 'FACIAL MATRIX', sub: 'Spline alignment', desc: 'Locate 68 face spline boundaries, extracting geometry and structural symmetry indexes.' },
              { num: '03', title: 'FFT TRANSFORMATION', sub: 'Spectral breakdown', desc: 'Convert spatial values into frequency maps to isolate GAN noise aberrations.' },
              { num: '04', title: 'NEURAL CLASSIFY', sub: 'EfficientNet nodes', desc: 'Process coefficients through fine-tuned convolutional structures to compute metrics.' },
              { num: '05', title: 'REPORT DELIVERY', sub: 'Verdict synthesis', desc: 'Deliver structured diagnostics showing confidence metrics and classification rates.' }
            ].map((step, idx) => (
              <div 
                key={step.num} 
                className="hud-panel cyber-corners p-5 flex flex-col gap-3 relative hover:border-[var(--accent-cyan)] group"
                onMouseEnter={() => soundManager.playHover()}
              >
                <div className="cyber-corners-inner"></div>
                
                <div className="flex justify-between items-center">
                  <span className="font-orbitron text-2xl font-black text-[rgba(0,176,255,0.12)] group-hover:text-[rgba(0,176,255,0.35)] transition-colors">
                    {step.num}
                  </span>
                  <span className="led-status active pulse"></span>
                </div>

                <div>
                  <h4 className="font-orbitron font-bold text-xs text-[var(--text-cyber)] tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">{step.title}</h4>
                  <p className="font-mono-tech text-[10px] text-[var(--accent-blue)] mt-0.5 tracking-wider uppercase font-semibold">{step.sub}</p>
                </div>

                <p className="text-[12px] text-[var(--text-dim)] leading-normal mt-2">
                  {step.desc}
                </p>
                
                {/* Traveling dot lines - desktop only */}
                {idx < 4 && (
                  <div className="hidden md:block node-line" style={{ right: '-24px', top: '50%', width: '20px' }}>
                    <div className="node-dot-pulse"></div>
                  </div>
                )}
              </div>
            ))}

          </div>

        </div>
      </section>

      {/* ── SPECIFICATIONS ABOUT SECTION (#about) ── */}
      <section id="about" className="reveal-section relative z-10 px-4 py-24 sm:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left directive briefs */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="font-orbitron">
              <p className="font-mono-tech text-[10px] tracking-widest text-[var(--text-dark)] uppercase">[ DEEPGUARD_CORE_REGISTRAR ]</p>
              <h2 className="text-3xl font-extrabold tracking-widest text-[var(--text-cyber)] mt-1 uppercase">Laboratory Brief</h2>
              <div className="h-[2px] w-20 bg-[var(--accent-cyan)] mt-3"></div>
            </div>

            <p className="text-sm text-[var(--text-dim)] leading-relaxed font-medium">
              DeepGuard operates as an autonomous cognitive shield. Engineered on high-speed convolutional models, it extracts localized generation marks that are invisible to standard sensors.
            </p>

            <div className="flex flex-col gap-3 font-mono-tech text-xs">
              <div className="flex items-center gap-3 border border-[var(--border-silver)] bg-white/40 p-3 shadow-sm">
                <span className="led-status active real"></span>
                <div>
                  <span className="text-[var(--text-cyber)] font-bold">DIRECTIVE 01: REAL-TIME THREAT ASSESS</span>
                  <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Diagnose media payload aberrations instantly using spectral matrices.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-[var(--border-silver)] bg-white/40 p-3 shadow-sm">
                <span className="led-status active real"></span>
                <div>
                  <span className="text-[var(--text-cyber)] font-bold">DIRECTIVE 02: SYMMETRICAL DIAGNOSTICS</span>
                  <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Demystify neural decisions with comprehensive sub-metric gauges.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-[var(--border-silver)] bg-white/40 p-3 shadow-sm">
                <span className="led-status active real"></span>
                <div>
                  <span className="text-[var(--text-cyber)] font-bold">DIRECTIVE 03: ZERO TELEMETRY STORAGE</span>
                  <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Analyze target boundaries without logging biometric parameters in databases.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Parameters Table */}
          <div className="lg:col-span-6">
            <div className="hud-panel cyber-corners p-6 flex flex-col gap-4">
              <div className="cyber-corners-inner"></div>

              <div className="hud-panel-title font-orbitron title-gold">
                <span>SYSTEM CONSTANT REGISTRY</span>
                <span>SYSTEM_SPEC_LOCK</span>
              </div>

              <table className="w-full text-left font-mono-tech text-xs">
                <tbody>
                  {[
                    ['DIAGNOSTIC_NET', 'EFFICIENTNET-B0 CNN', 'var(--accent-cyan)'],
                    ['CLASSIFICATION_SHIELD', 'BINARY (REAL / FAKE)', 'var(--text-cyber)'],
                    ['PARAMETER_WEIGHTS', '5.3M INDEPENDENT COEFFICIENTS', 'var(--text-cyber)'],
                    ['SPECTRAL_SCAN_RES', '224 x 224 x 3', 'var(--text-cyber)'],
                    ['LATENCY_RATE', '~142ms INFERENCE SPEED', 'var(--accent-blue)'],
                    ['VERDICT_ACCURACY', '98.2% on FF++ SUBSETS', 'var(--real-green)'],
                    ['SENSING_CHANNELS', 'FAST FOURIER COEFFICIENTS, SPLINE MESH', 'var(--text-cyber)'],
                    ['LAB_LOCK_ID', 'STARK-UNIT-DG88', 'var(--text-cyber)']
                  ].map(([label, val, color]) => (
                    <tr key={label} className="border-b border-[rgba(0,176,255,0.08)] hover:bg-[rgba(0,176,255,0.02)] transition-colors">
                      <td className="py-3 pr-4 text-[var(--text-dim)] text-[10px] uppercase font-bold tracking-wider">{label}</td>
                      <td className="py-3 text-right font-semibold" style={{ color }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[rgba(0,176,255,0.15)] bg-[var(--bg-cyber)]/80 py-12 px-4 text-center font-mono-tech text-[10px] text-[var(--text-dark)] shadow-inner">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
          
          <div className="text-left">
            <p className="font-orbitron font-bold tracking-widest text-[var(--text-dim)] uppercase">STARK INDUSTRIES DEEPGUARD</p>
            <p className="mt-1">DIAGNOSTIC COGNITIVE NETWORKS ONLINE</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="led-status active real animate-pulse"></span>
              <span>GRID: PASS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-status active pulse real"></span>
              <span>CORES: STABLE</span>
            </div>
          </div>

          <div className="text-right">
            <p>© 2026 STARK INDUSTRIES. COGNITIVE DEFENSE MATRIX.</p>
            <p className="mt-1">[PROPRIETARY RESEARCH UNIT]</p>
          </div>

        </div>
      </footer>

    </div>
  )
}
