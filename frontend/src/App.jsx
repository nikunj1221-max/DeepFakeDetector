import { useState, useCallback, useEffect, useRef } from 'react'
import axios from 'axios'
import Uploader from './components/Uploader'
import ResultCard from './components/ResultCard'
import { soundManager } from './utils/sound'


const API_URL = import.meta.env.VITE_API_URL || '/api'

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
  const [errorMessage, setErrorMessage] = useState(null)
  const [sliderPos, setSliderPos] = useState(50)
  const [showMockWarning, setShowMockWarning] = useState(false)
  const consoleBottomRef = useRef(null)

  useEffect(() => {
    if (consoleBottomRef.current) {
      consoleBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [consoleLogs])

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

  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return
    setPhase('analyzing')
    setConsoleLogs([
      '[BELL] Packaging image and sending to prediction service...'
    ])
    setErrorMessage(null)
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
    let apiError = null
    try {
      const response = await axios.post(`${API_URL}/predict`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 20000,
      })
      apiResult = response.data
    } catch (err) {
      apiError = err
      console.error(err)
    }

    const completionTimer = setTimeout(() => {
      if (apiResult) {
        setResult(apiResult)
        setPhase('done')
      } else {
        setErrorMessage(
          apiError?.response?.data?.detail ||
          apiError?.message ||
          'Unable to reach the prediction service. Please try again later.'
        )
        setPhase('error')
        setConsoleLogs((prev) => [
          ...prev,
          '[BELL] Analysis failed. Please check backend connectivity.'
        ])
      }
    }, 2200)

    activeTimers.push(completionTimer)
    return () => activeTimers.forEach(clearTimeout)
  }, [imageFile])

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(null)
    setPreviewUrl(null)
    setResult(null)
    setPhase('idle')
    setShowMockWarning(false)
    setConsoleLogs([])
  }, [previewUrl])

  return (
    <div className="relative min-h-screen bg-[var(--bg-parchment)]">
      <div className="parchment-overlay z-0"></div>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 py-16 sm:px-6">
        <div className="flex flex-col gap-12">
          <section className="text-center">
            <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[var(--text-faint)] mb-3">Deepfake Detector</p>
            <h1 className="font-display text-4xl sm:text-5xl font-black text-[var(--text-primary)] leading-tight">Upload a photograph for forensic analysis</h1>
            <p className="mx-auto mt-4 max-w-2xl font-body text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
              Drag and drop or select an image file to examine it for visual tampering.
            </p>
          </section>

          <section className="flex flex-col items-center gap-8">
            {phase === 'idle' && (
              <div className="w-full max-w-xl bg-[var(--bg-parchment)] border border-[var(--border-aged)] p-5 sm:p-6 rounded-3xl shadow-sm">
                <h2 className="font-display text-base sm:text-lg font-bold text-[var(--text-primary)] mb-4">How to use</h2>
                <ul className="list-disc pl-5 space-y-2 font-body text-sm text-[var(--text-body)] leading-relaxed">
                  <li><strong>Upload</strong> a portrait or photograph.</li>
                  <li><strong>Analyze</strong> the file for synthetic features.</li>
                  <li><strong>Review</strong> the result once the scan is complete.</li>
                </ul>
              </div>
            )}

            <div className="w-full max-w-xl">
              {phase === 'idle' ? (
                <Uploader onImageSelected={handleImageSelected} />
              ) : (
                <div className="flex flex-col gap-6">
                  <div className="w-full flex flex-col gap-3">
                    <div className={`vintage-card vintage-corners relative overflow-hidden p-2 ${phase === 'analyzing' ? 'border-[var(--gold)]' : ''}`}>
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
                            className={`max-w-full max-h-full object-contain block ${phase === 'analyzing' ? 'brightness-90 saturate-[0.3] contrast-110 transition-all duration-300' : ''}`}
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
                          The detector is ready to analyze this image for synthetic textures and generative artifacts.
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
                        <ResultCard result={result} onReset={handleReset} />
                      </div>
                    )}
                    {phase === 'error' && (
                      <div className="vintage-card vintage-corners p-5 sm:p-6 flex flex-col gap-4 animate-fade-in border border-[var(--forgery-red-dim)] bg-[var(--surface-card)]">
                        <div className="font-display text-sm sm:text-base font-bold text-[var(--forgery-red)]">Analysis failed</div>
                        <p className="font-body text-sm text-[var(--text-body)] leading-relaxed">
                          {errorMessage || 'Unable to complete the analysis at this time.'}
                        </p>
                        <button
                          className="btn-vintage text-[10px] sm:text-xs py-3"
                          onClick={handleReset}
                        >
                          Start Over
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
