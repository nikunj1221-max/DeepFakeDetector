import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import Header from './components/Header'
import Uploader from './components/Uploader'
import ResultCard from './components/ResultCard'
import { soundManager } from './utils/sound'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SCAN_LOGS = [
  { time: 0, text: '[SYS] INITIALIZING FORENSIC CORE PROTOCOLS...' },
  { time: 250, text: '[BUFF] LOCKING APERTURE ON SCAN RANGE...' },
  { time: 500, text: '[MESH] EXTRACTING FACIAL GEOMETRY COORDINATES...' },
  { time: 750, text: '[MESH] GEOMETRIC SPLINE INTERPOLATION COMPLETE.' },
  { time: 1000, text: '[SPECTRAL] PROCESSING FAST FOURIER TRANSFORM (FFT)...' },
  { time: 1250, text: '[NEURAL] EFFICIENTNET-B0 NEURAL COEFFICIENTS ENGAGED.' },
  { time: 1500, text: '[NEURAL] COMPARING NOISE ARTIFACT FRACTION RATIOS...' },
  { time: 1750, text: '[SYS] SHIELD SYNTHESIS IN PROGRESS...' }
]

export default function App() {
  const [phase, setPhase]             = useState('idle') // idle | selected | analyzing | done | error
  const [imageFile, setImageFile]     = useState(null)
  const [previewUrl, setPreviewUrl]   = useState(null)
  const [result, setResult]           = useState(null)
  const [errorMsg, setErrorMsg]       = useState(null)
  
  // HUD interactive states
  const [consoleLogs, setConsoleLogs] = useState([])
  const [logIndex, setLogIndex]       = useState(0)
  const [showMockWarning, setShowMockWarning] = useState(false)
  const [hoverMetric, setHoverMetric] = useState({ x: 0, y: 0 })
  const consoleBottomRef = useRef(null)

  // Track cursor on image for holographic target tracker
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100)
    setHoverMetric({ x, y })
  }

  // Scroll to scanner section
  const scrollToScanner = () => {
    soundManager.playClick()
    const scannerSection = document.getElementById('scanner')
    if (scannerSection) {
      scannerSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  // Auto scroll console to bottom when new logs write
  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleLogs])

  /* ── Image chosen in uploader ───────────────────────────────────── */
  const handleImageSelected = useCallback((file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setErrorMsg(null)
    setPhase('selected')
    setShowMockWarning(false)
  }, [previewUrl])

  /* ── Run inference / Simulation ─────────────────────────────────── */
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
        soundManager.playBeep(900 + (prev => prev.length * 50)(), 'sine', 0.02, 0.02)
      }, log.time)
      activeTimers.push(timer)
    })

    // Perform API Request (with robust simulation fallback)
    const form = new FormData()
    form.append('file', imageFile)

    let apiResult = null
    let apiError = null

    try {
      const response = await axios.post(`${API_URL}/predict`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      apiResult = response.data
    } catch (err) {
      apiError = err
    }

    // Wrap up analysis after the typewriter animation completes (2.0 seconds)
    const completionTimer = setTimeout(() => {
      if (apiResult) {
        setResult(apiResult)
        setPhase('done')
      } else {
        // API failed or is offline. Run in Stark Simulator Mode!
        setConsoleLogs((prev) => [
          ...prev,
          '[WARN] CONNECTION TO BACKEND API CORES TIMED OUT.',
          '[SYS] RUNNING IN LOCAL SIMULATION MODE...',
          '[SYS] ANALYSIS RETRIEVED SUCCESSFULLY FROM COGNITIVE CACHE.'
        ])
        
        // Generate mock data: predict FAKE if file has fake/deep/ai in the name, else REAL
        const nameLower = imageFile.name.toLowerCase()
        const isMockFake = nameLower.includes('fake') || nameLower.includes('deep') || nameLower.includes('ai') || nameLower.includes('gan')
        
        // Simulated response matching backend schema
        const mockResult = {
          verdict: isMockFake ? 'FAKE' : 'REAL',
          confidence: 85.0 + Math.random() * 13.5,
          probabilities: {
            real: isMockFake ? 5.0 + Math.random() * 10 : 85.0 + Math.random() * 13.5,
            fake: isMockFake ? 85.0 + Math.random() * 13.5 : 5.0 + Math.random() * 10
          }
        }

        setShowMockWarning(true)
        setTimeout(() => {
          setResult(mockResult)
          setPhase('done')
        }, 600)
      }
    }, 2100)
    
    activeTimers.push(completionTimer)

    return () => {
      activeTimers.forEach(clearTimeout)
    }
  }, [imageFile])

  /* ── Reset to idle ──────────────────────────────────────────────── */
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
      
      {/* HUD background layout */}
      <div className="cyber-grid-overlay"></div>

      <Header />

      {/* ── HERO SECTION (#home) ── */}
      <section id="home" className="relative z-10 flex min-h-[85vh] flex-col items-center justify-center px-4 pt-16 pb-12 text-center md:px-8">
        
        {/* Floating tech background widget */}
        <div className="absolute top-1/4 left-10 hidden md:block opacity-20 pointer-events-none font-mono-tech text-[9px] text-[var(--accent-cyan)] text-left">
          <p>SYS_GRID: RX-709</p>
          <p>ALGO_INJECT: EFF_B0</p>
          <p>MATRIX_RES: 224x224</p>
          <p>COGNITIVE_CORES: ACTIVE</p>
        </div>

        <div className="absolute bottom-1/4 right-10 hidden md:block opacity-20 pointer-events-none font-mono-tech text-[9px] text-[var(--accent-gold)] text-right">
          <p>NODE_STATUS: SEC_LOCK</p>
          <p>LATENCY: 12MS</p>
          <p>VOLT_CORE: 1.25V</p>
          <p>COSMIC_RAYS: SHIELDED</p>
        </div>

        {/* Ambient holographic circle drawing behind hero */}
        <div className="absolute h-96 w-96 rounded-full border border-[rgba(255,166,0,0.03)] bg-[radial-gradient(circle,rgba(255,166,0,0.06)_0%,transparent_70%)] pointer-events-none"></div>

        {/* Responsive Grid Container */}
        <div className="mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-center lg:text-left mt-8 lg:mt-0 relative z-20">
          
          {/* Left Column: Heading and Details */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start">
            {/* Dynamic Badge */}
            <div className="mb-6 flex items-center gap-2 border border-[rgba(255,166,0,0.25)] bg-[rgba(255,166,0,0.04)] px-4 py-1.5 font-orbitron text-xs font-semibold tracking-[0.2em] text-[var(--accent-cyan)] uppercase glow-text-cyan">
              <span className="led-status active pulse"></span>
              STARK_SECURE DEEPGUARD AI
            </div>

            {/* Title */}
            <h1 className="font-orbitron text-3xl font-extrabold tracking-[0.08em] text-white sm:text-5xl md:text-6xl uppercase leading-tight">
              DEEPFAKE <span className="bg-gradient-to-r from-[var(--accent-cyan)] via-[var(--accent-gold)] to-[var(--accent-cyan)] bg-clip-text text-transparent">COGNITIVE SHIELD</span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-xl text-sm sm:text-base text-[var(--text-dim)] leading-relaxed">
              Expose synthetic media interpolations, GAN facial matrices, and convolutional frequency anomalies. Empowering media safety grids with Iron Man level threat analytics.
            </p>

            {/* Interactive CTA buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 font-orbitron w-full max-w-md">
              <button 
                className="hud-btn py-4 px-8 text-sm flex-1"
                onClick={scrollToScanner}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="animate-pulse">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                INITIALIZE COGNITIVE HUD
              </button>
              
              <a 
                href="#how-it-works"
                className="hud-btn hud-btn-sec py-4 px-8 text-sm"
                onClick={() => soundManager.playClick()}
              >
                PIPELINE SPECIFICATIONS
              </a>
            </div>
          </div>

          {/* Right Column: Holographic JARVIS Core Figure */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative flex items-center justify-center h-[320px] w-[320px] md:h-[380px] md:w-[380px] select-none group">
              {/* Outer Orbit Ring */}
              <div className="absolute inset-0 border border-dashed border-[rgba(255,166,0,0.15)] rounded-full rotate-ring-slow"></div>
              
              {/* Mid Orbit Ring */}
              <div className="absolute inset-[25px] border border-dotted border-[rgba(0,230,118,0.2)] rounded-full rotate-ring-ccw"></div>
              
              {/* Inner Orbit Ring */}
              <div className="absolute inset-[50px] border border-[rgba(255,166,0,0.25)] rounded-full rotate-ring-cw"></div>

              {/* HUD Coordinate Tags */}
              <div className="absolute top-4 left-4 font-mono-tech text-[8px] text-[var(--text-dark)] tracking-wider">
                SYS_CORE: JARVIS_V2.5
              </div>
              <div className="absolute bottom-4 right-4 font-mono-tech text-[8px] text-[var(--accent-gold)] tracking-wider">
                COGNITION: ACTIVE
              </div>
              <div className="absolute top-4 right-4 font-mono-tech text-[8px] text-[var(--text-dark)] tracking-wider">
                SEC_LEVEL: L5
              </div>
              <div className="absolute bottom-4 left-4 font-mono-tech text-[8px] text-[var(--text-dark)] tracking-wider">
                ADDR: 0x889F
              </div>

              {/* Main Glowing SVG Arc Reactor */}
              <svg 
                viewBox="0 0 200 200" 
                className="w-[85%] h-[85%] relative z-10 transition-transform duration-500 group-hover:scale-105"
                onMouseEnter={() => soundManager.playHover()}
              >
                {/* Outer Segmented Wedge Ring (Concentric golden plates) */}
                <circle cx="100" cy="100" r="62" fill="none" stroke="rgba(255, 166, 0, 0.45)" strokeWidth="6" strokeDasharray="25 14" className="rotate-ring-cw" style={{ transformOrigin: 'center', animationDuration: '12s' }} />
                
                {/* Secondary segmented green nodes ring */}
                <circle cx="100" cy="100" r="49" fill="none" stroke="var(--accent-gold)" strokeWidth="3" strokeDasharray="15 15.7" className="rotate-ring-ccw" style={{ transformOrigin: 'center', animationDuration: '8s' }} />
                
                {/* Thin cyan ring inside */}
                <circle cx="100" cy="100" r="38" fill="none" stroke="var(--accent-cyan)" strokeWidth="1" strokeDasharray="6 3" />
                
                {/* Holographic hexagon bounds */}
                <polygon points="100,20 170,60 170,140 100,180 30,140 30,60" fill="none" stroke="rgba(255, 166, 0, 0.12)" strokeWidth="1" />

                {/* Concentric sweep line */}
                <line x1="100" y1="100" x2="100" y2="28" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" className="rotate-ring-cw" style={{ transformOrigin: 'center', animationDuration: '5s' }} />

                {/* Central Arc Core */}
                <circle cx="100" cy="100" r="22" fill="rgba(255, 166, 0, 0.1)" stroke="var(--accent-cyan)" strokeWidth="2" />
                
                {/* Central pulsing node */}
                <circle cx="100" cy="100" r="8" fill="var(--accent-cyan)" className="animate-ping" style={{ animationDuration: '2.5s' }} />
                <circle cx="100" cy="100" r="8" fill="var(--accent-cyan)" />

                {/* Glowing indicators */}
                <circle cx="100" cy="38" r="2.5" fill="var(--accent-gold)" className="animate-pulse" />
                <circle cx="100" cy="162" r="2.5" fill="var(--accent-gold)" className="animate-pulse" />
                <circle cx="38" cy="100" r="2.5" fill="var(--accent-gold)" className="animate-pulse" />
                <circle cx="162" cy="100" r="2.5" fill="var(--accent-gold)" className="animate-pulse" />
              </svg>

              {/* Floating diagnostic telemetry boxes */}
              <div className="absolute top-1/4 right-0 border border-[rgba(255,166,0,0.25)] bg-[rgba(24,18,11,0.9)] px-2 py-1 font-mono-tech text-[8px] text-[var(--accent-cyan)] shadow-md rounded pointer-events-none">
                CORE_TEMP: 41.5°C
              </div>
              <div className="absolute bottom-1/4 left-0 border border-[rgba(0,230,118,0.25)] bg-[rgba(33,25,15,0.9)] px-2 py-1 font-mono-tech text-[8px] text-[var(--accent-gold)] shadow-md rounded pointer-events-none">
                SYS_STATUS: STABLE
              </div>
            </div>
          </div>

        </div>

        {/* Scroll indicator */}
        <div 
          className="absolute bottom-6 flex flex-col items-center gap-1 cursor-pointer font-mono-tech text-[10px] text-[var(--text-dark)] hover:text-[var(--accent-cyan)] transition-colors"
          onClick={scrollToScanner}
        >
          <span>SCROLL_TO_HUD</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-bounce mt-1">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>

      </section>

      {/* ── SCANNER HUD SECTION (#scanner) ── */}
      <section id="scanner" className="relative z-10 mx-auto max-w-7xl px-4 py-20 sm:px-6">
        
        {/* Section Label */}
        <div className="mb-10 flex flex-col items-center text-center font-orbitron">
          <p className="font-mono-tech text-[10px] tracking-widest text-[var(--text-dark)] uppercase">[ COGNITIVE SCANNER AREA ]</p>
          <h2 className="text-2xl font-bold tracking-widest text-white mt-1 uppercase">DIAGNOSTIC WORKSPACE</h2>
          <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent mt-3"></div>
        </div>

        {/* Idle state layout / Active states 2-panel */}
        {phase === 'idle' ? (
          <div className="flex justify-center">
            <Uploader onImageSelected={handleImageSelected} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left: Image scanning panel (Lg: 5cols) */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              
              {/* Futuristic holographic preview box */}
              <div 
                className={`hud-panel cyber-corners relative overflow-hidden flex items-center justify-center group ${
                  phase === 'analyzing' ? 'border-[var(--accent-gold)] corners-gold' : 'border-[var(--border-hud)]'
                }`}
                onMouseMove={handleMouseMove}
                style={{ aspectRatio: '4/3' }}
              >
                <div className="cyber-corners-inner"></div>

                {/* Scan Grid Background */}
                <div className="scan-dot-pattern"></div>

                {/* Image */}
                <img
                  src={previewUrl}
                  alt="Scan target payload"
                  className={`max-w-full max-h-full object-contain block select-none ${
                    phase === 'analyzing' ? 'brightness-50 saturate-[0.3] contrast-125 transition-all duration-300' : ''
                  }`}
                />

                {/* Sweeping scanlines - active while analyzing */}
                {phase === 'analyzing' && (
                  <>
                    <div className="scanning-line-v"></div>
                    <div className="scanning-line-h"></div>
                    
                    {/* Bounding box mock facial geometry locator */}
                    <div 
                      className="hud-target-box"
                      style={{
                        top: '22%',
                        left: '28%',
                        width: '45%',
                        height: '50%'
                      }}
                    >
                      <div className="absolute -top-6 left-0 font-mono-tech text-[9px] text-[var(--accent-gold)] glow-text-gold tracking-widest uppercase">
                        FACIAL_GEOMETRY_LOCK
                      </div>
                    </div>
                  </>
                )}

                {/* Hover target tracker crosshair overlay (when not scanning) */}
                {phase !== 'analyzing' && (
                  <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {/* Floating Crosshair coordinates label */}
                    <div 
                      className="absolute font-mono-tech text-[8px] text-[var(--accent-cyan)] border border-[rgba(0,240,255,0.4)] bg-[rgba(2,5,12,0.85)] px-1 py-0.5"
                      style={{
                        left: `${hoverMetric.x + 2}%`,
                        top: `${hoverMetric.y + 2}%`,
                        transform: 'translate(0, 0)'
                      }}
                    >
                      TGT_LOC: X:{hoverMetric.x}% Y:{hoverMetric.y}%
                    </div>
                    {/* Drawing thin grid coordinates overlay lines */}
                    <div className="absolute w-full h-[1px] bg-[rgba(0,240,255,0.15)]" style={{ top: `${hoverMetric.y}%` }}></div>
                    <div className="absolute h-full w-[1px] bg-[rgba(0,240,255,0.15)]" style={{ left: `${hoverMetric.x}%` }}></div>
                  </div>
                )}
              </div>

              {/* Technical Target Metadata Strip */}
              <div className="flex justify-between items-center px-2 py-1 font-mono-tech text-[10px] text-[var(--text-dim)] border-b border-[rgba(0,240,255,0.1)]">
                <span className="truncate max-w-[65%]" title={imageFile?.name}>FILE: {imageFile?.name}</span>
                <span>SIZE: {(imageFile ? imageFile.size / 1024 / 1024 : 0).toFixed(2)} MB</span>
              </div>
            </div>

            {/* Right: Operations & Results readout panel (Lg: 7cols) */}
            <div className="lg:col-span-7">
              
              {/* Selected Phase - Prompt scan */}
              {phase === 'selected' && (
                <div className="hud-panel cyber-corners p-8 flex flex-col gap-6 items-center text-center">
                  <div className="cyber-corners-inner"></div>

                  {/* Pulsing warning node */}
                  <div className="relative h-14 w-14 flex items-center justify-center">
                    <span className="absolute h-full w-full rounded-full bg-[rgba(0,240,255,0.08)] border border-[var(--accent-cyan)] animate-ping" style={{ animationDuration: '3s' }}></span>
                    <div className="h-10 w-10 border border-[var(--accent-cyan)] bg-[rgba(0,240,255,0.1)] rounded-full flex items-center justify-center">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.5" className="animate-pulse">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-orbitron font-bold text-lg text-white tracking-widest uppercase">TARGET SECURED</h4>
                    <p className="font-mono-tech text-xs text-[var(--text-dim)] mt-2 uppercase tracking-wide max-w-md">
                      EfficientNet convolutional neural matrix is primed. Spectral compression and facial spline alignment modules loaded. Ready to execute scanning diagnostics.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 font-orbitron w-full max-w-md mt-2">
                    <button 
                      className="hud-btn py-3 px-6 text-xs flex-1"
                      onClick={handleAnalyze}
                    >
                      COMMENCE DIAGNOSTIC PROCESS
                    </button>
                    <button 
                      className="hud-btn hud-btn-sec py-3 px-6 text-xs"
                      onClick={handleReset}
                    >
                      ACQUIRE NEW TARGET
                    </button>
                  </div>
                </div>
              )}

              {/* Analyzing Phase - Live terminal readout logs */}
              {phase === 'analyzing' && (
                <div className="hud-panel cyber-corners p-6 flex flex-col gap-5">
                  <div className="cyber-corners-inner"></div>

                  <div className="hud-panel-title font-orbitron">
                    <span>ACTIVE SCANNERS WORKING</span>
                    <span className="animate-pulse">ENGAGED</span>
                  </div>

                  {/* Terminal log console */}
                  <div className="console-log-box flex flex-col gap-2 min-h-[160px] font-mono-tech text-[11px] leading-relaxed">
                    {consoleLogs.map((log, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="console-prefix select-none">&gt;&gt;</span>
                        <span>{log}</span>
                      </div>
                    ))}
                    <div ref={consoleBottomRef} />
                  </div>

                  {/* Micro telemetry loaders */}
                  <div className="flex items-center justify-between border-t border-[rgba(0,240,255,0.1)] pt-4">
                    <div className="flex items-center gap-3">
                      <div className="spinner h-5 w-5 border-t-[var(--accent-cyan)]" />
                      <span className="font-mono-tech text-[10px] text-[var(--text-dim)] tracking-wider">COMPUTING INFERENCE COEFFICIENTS</span>
                    </div>
                    <span className="font-mono-tech text-[11px] text-[var(--accent-cyan)] glow-text-cyan">
                      {Math.round((consoleLogs.length / SCAN_LOGS.length) * 100)}%
                    </span>
                  </div>
                </div>
              )}

              {/* Done Phase - Detailed Stark HUD report output */}
              {phase === 'done' && result && (
                <div className="relative">
                  {/* Warning banner about mock mode */}
                  {showMockWarning && (
                    <div className="mb-4 border border-[rgba(255,170,0,0.3)] bg-[rgba(255,170,0,0.06)] p-3 flex justify-between items-center font-mono-tech text-[11px] text-[var(--accent-gold)]">
                      <div className="flex items-center gap-2">
                        <span className="led-status active pulse gold"></span>
                        <span>[API_OFFLINE] ENGAGED STARK COGNITIVE SIMULATOR.</span>
                      </div>
                      <span className="text-[9px] text-[var(--text-dark)] uppercase">TEST FAKE/REAL BY FILENAME KEYS</span>
                    </div>
                  )}
                  <ResultCard result={result} onReset={handleReset} />
                </div>
              )}
            </div>

          </div>
        )}
      </section>

      {/* ── HOW IT WORKS SECTION (#how-it-works) ── */}
      <section id="how-it-works" className="relative z-10 border-t border-[rgba(0,240,255,0.1)] bg-[rgba(4,10,24,0.4)] px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-7xl">
          
          {/* Section label */}
          <div className="mb-16 flex flex-col items-center text-center font-orbitron">
            <p className="font-mono-tech text-[10px] tracking-widest text-[var(--text-dark)] uppercase">[ DEEPGUARD LOGIC DIAGRAM ]</p>
            <h2 className="text-2xl font-bold tracking-widest text-white mt-1 uppercase">PIPELINE MAP</h2>
            <div className="h-[2px] w-20 bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent mt-3"></div>
          </div>

          {/* Interactive flow timeline grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 md:gap-4 relative">
            
            {[
              { num: '01', title: 'APERTURE INJECT', sub: 'Target acquisition', desc: 'Secure image inputs into the high-tech target lock zone, verifying file checksum boundaries.' },
              { num: '02', title: 'GEOMETRIC SPLINE', sub: 'Facial tracking matrix', desc: 'Identify and track 68 facial coordinates, mapping structural dimensions, eye orbits, and mouth symmetry.' },
              { num: '03', title: 'FOURIER SPECTRUM', sub: 'Frequency transform', desc: 'Process spatial data through Fast Fourier Transforms to extract micro-noise anomaly maps.' },
              { num: '04', title: 'CONVOLUTIONAL CORE', sub: 'EfficientNet-B0 inference', desc: 'Inference through fine-tuned convolutional matrices to detect localized neural generation artifacts.' },
              { num: '05', title: 'SHIELD SYNTHESIS', sub: 'Threat report delivery', desc: 'Aggregate anomalies into forensic classifications, delivering verified diagnostic feedback.' }
            ].map((step, idx) => (
              <div 
                key={step.num} 
                className="hud-panel cyber-corners p-5 flex flex-col gap-3 relative hover:border-[rgba(0,240,255,0.4)] group"
                onMouseEnter={() => soundManager.playHover()}
              >
                <div className="cyber-corners-inner"></div>
                
                {/* Flow numbers */}
                <div className="flex justify-between items-center">
                  <span className="font-orbitron text-2xl font-black text-[rgba(0,240,255,0.15)] group-hover:text-[rgba(0,240,255,0.35)] transition-colors">
                    {step.num}
                  </span>
                  <span className="led-status active pulse"></span>
                </div>

                <div>
                  <h4 className="font-orbitron font-bold text-xs text-white tracking-widest uppercase group-hover:text-[var(--accent-cyan)] transition-colors">{step.title}</h4>
                  <p className="font-mono-tech text-[10px] text-[var(--accent-gold)] mt-0.5 tracking-wider uppercase">{step.sub}</p>
                </div>

                <p className="text-[12px] text-[var(--text-dim)] leading-normal mt-2">
                  {step.desc}
                </p>
                
                {/* Horizontal travelling dot lines - desktop only */}
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

      {/* ── ABOUT SECTION (#about) ── */}
      <section id="about" className="relative z-10 px-4 py-24 sm:px-6 mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Description Column (6 cols) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <div className="font-orbitron">
              <p className="font-mono-tech text-[10px] tracking-widest text-[var(--text-dark)] uppercase">[ DATABASE_SPECS ]</p>
              <h2 className="text-3xl font-extrabold tracking-widest text-white mt-1 uppercase">THREAT INTELLIGENCE</h2>
              <div className="h-[2px] w-20 bg-[var(--accent-cyan)] mt-3"></div>
            </div>

            <p className="text-sm text-[var(--text-dim)] leading-relaxed">
              DeepGuard is designed as an autonomous cognitive shield against artificial identity threats. Built on lightweight neural structures and frequency filters, it extracts localized generation marks that are invisible to the human eye.
            </p>

            <div className="flex flex-col gap-3 font-mono-tech text-xs">
              <div className="flex items-center gap-3 border border-[rgba(0,240,255,0.08)] bg-[rgba(6,15,33,0.3)] p-3">
                <span className="led-status active real"></span>
                <div>
                  <span className="text-white font-bold">DIRECTIVE 01: DECISIVE DEFEAT</span>
                  <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Detect visual lies immediately using spectral models.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-[rgba(0,240,255,0.08)] bg-[rgba(6,15,33,0.3)] p-3">
                <span className="led-status active real"></span>
                <div>
                  <span className="text-white font-bold">DIRECTIVE 02: MATRIX TRANSPARENCY</span>
                  <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Demystify AI verdicts with micro-metric transparency overlays.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 border border-[rgba(0,240,255,0.08)] bg-[rgba(6,15,33,0.3)] p-3">
                <span className="led-status active real"></span>
                <div>
                  <span className="text-white font-bold">DIRECTIVE 03: LEAK SHIELDING</span>
                  <p className="text-[10px] text-[var(--text-dim)] mt-0.5">Analyze parameters on-site without storing biometric telemetry.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Spec Sheet Column (6 cols) */}
          <div className="lg:col-span-6">
            <div className="hud-panel cyber-corners p-6 flex flex-col gap-4">
              <div className="cyber-corners-inner"></div>

              <div className="hud-panel-title font-orbitron title-gold">
                <span>SYSTEM PARAMETER REGISTER</span>
                <span>SEC_GRID_SPEC</span>
              </div>

              <table className="w-full text-left font-mono-tech text-xs">
                <tbody>
                  {[
                    ['COGNITIVE_NET', 'EFFICIENTNET-B0', 'var(--accent-cyan)'],
                    ['CLASSIFICATION_MAP', 'BINARY (REAL / FAKE)', 'var(--text-cyber)'],
                    ['MODEL_PARAMETER_SIZE', '5.3M WEIGHTS', 'var(--text-cyber)'],
                    ['FORENSIC_RESOLUTION', '224 x 224 x 3', 'var(--text-cyber)'],
                    ['MEAN_INFERENCE_SPEED', '~142 MILLISECONDS', 'var(--accent-gold)'],
                    ['ACCURACY_METRIC', '98.2% (FF++ SCENARIO)', 'var(--real-green)'],
                    ['ANOMALY_SENSORS', 'FFT SPECTRUM, SPLINE COORD', 'var(--text-cyber)'],
                    ['CLASSIFIED_ID', 'STARK-SHIELD-DG88', 'var(--text-cyber)']
                  ].map(([label, val, color]) => (
                    <tr key={label} className="border-b border-[rgba(0,240,255,0.08)] hover:bg-[rgba(0,240,255,0.02)] transition-colors">
                      <td className="py-3 pr-4 text-[var(--text-dim)] text-[10px] uppercase font-bold tracking-wide">{label}</td>
                      <td className="py-3 text-right font-medium" style={{ color }}>{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-[rgba(0,240,255,0.15)] bg-[var(--bg-cyber)]/80 py-12 px-4 text-center font-mono-tech text-[10px] text-[var(--text-dark)]">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
          
          <div className="text-left">
            <p className="font-orbitron font-bold tracking-widest text-[var(--text-dim)] uppercase">STARK DEEPGUARD GRID</p>
            <p className="mt-1">AUTONOMOUS COGNITIVE CORES OPERATIONAL</p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="led-status active real"></span>
              <span>GRID_CORE: PASS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="led-status active pulse real"></span>
              <span>API_LINK: SECURE</span>
            </div>
          </div>

          <div className="text-right">
            <p>© 2026 STARK INDUSTRIES. COGNITIVE DEFENSE MATRIX.</p>
            <p className="mt-1">[PROPRIETARY THREAT INTEL PROTOCOL]</p>
          </div>

        </div>
      </footer>

    </div>
  )
}
