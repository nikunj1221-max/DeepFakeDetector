import { useState, useRef, useCallback } from 'react'
import { soundManager } from '../utils/sound'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024 // 10 MB

function validate(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'FORMAT_MISMATCH: Only JPEG, PNG, and WebP are compatible.'
  if (file.size > MAX_BYTES)              return 'OVERSIZE_ERROR: Payload exceeds 10 MB threshold.'
  return null
}

export default function Uploader({ onImageSelected }) {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback(
    (file) => {
      const error = validate(file)
      if (error) { 
        setValidationError(error); 
        soundManager.playWarning();
        return 
      }
      setValidationError(null)
      soundManager.playClick()
      onImageSelected(file)
    },
    [onImageSelected],
  )

  const onDragOver = (e) => {
    e.preventDefault()
    if (!isDragging) {
      setIsDragging(true)
      soundManager.playHover()
    }
  }
  const onDragLeave = () => setIsDragging(false)
  const onDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  
  const onInputChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0])
  }

  const triggerInput = (e) => {
    e.stopPropagation()
    soundManager.playClick()
    inputRef.current?.click()
  }

  return (
    <div className="w-full max-w-2xl flex flex-col gap-6">
      
      {/* Panel Intro Readout */}
      <div className="text-center font-orbitron">
        <h2 className="text-xl sm:text-2xl font-bold tracking-[0.15em] text-[var(--text-cyber)] glow-text-cyan uppercase">
          Forensic Acquisition Slot
        </h2>
        <p className="text-xs text-[var(--text-dim)] mt-2 font-mono-tech max-w-lg mx-auto uppercase">
          Inject target payload to run neural network classification layers.
        </p>
      </div>

      {/* Futuristic Light Glassmorphic Drop Zone */}
      <div
        className={`hud-panel cyber-corners relative flex flex-col items-center justify-center p-8 sm:p-10 cursor-pointer transition-all duration-300 min-h-[380px] border ${
          isDragging 
            ? 'border-[var(--accent-blue)] bg-[rgba(61,130,246,0.06)] corners-gold' 
            : 'border-[var(--border-hud)] hover:border-[var(--border-hud-hover)] bg-[rgba(255,255,255,0.55)] shadow-sm'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerInput}
        onMouseEnter={() => soundManager.playHover()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && triggerInput(e)}
        aria-label="Drop target image here or click to acquire"
      >
        <div className="cyber-corners-inner"></div>

        {/* Sweeping Light Scanline */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded">
          <div 
            className="absolute left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-70"
            style={{
              boxShadow: 'var(--glow-cyan)',
              animation: 'sweepVertical 4.5s linear infinite'
            }}
          ></div>
        </div>

        {/* System Alert Status Banner (Light Theme) */}
        <div className="absolute top-0 left-0 right-0 border-b border-[rgba(0,176,255,0.12)] bg-[rgba(0,176,255,0.02)] px-4 py-2 flex items-center justify-between font-mono-tech text-[9px] text-[var(--text-dim)]">
          <div className="flex items-center gap-1.5 text-[var(--accent-cyan)] glow-text-cyan font-bold">
            <span className="led-status active pulse"></span>
            <span>DIAGNOSTICS_ACTIVE // LAB_MATRIX</span>
          </div>
          <div className="animate-pulse text-[var(--accent-blue)] glow-text-gold font-bold tracking-wider">
            [STATUS: WAITING_FOR_IMAGE_PAYLOAD]
          </div>
        </div>

        {/* Technical HUD Markings */}
        <div className="absolute top-10 left-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          COORDINATES: [SYS_LOCK_45B]
        </div>
        <div className="absolute top-10 right-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          MODE: RADAR_TARGET
        </div>
        <div className="absolute bottom-3 left-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          SECTOR: L-32A
        </div>
        <div className="absolute bottom-3 right-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          ZOOM: AUTO
        </div>

        {/* Central Rotating Target Vector (JARVIS core - Light) */}
        <div className="relative h-32 w-32 flex items-center justify-center mb-5 mt-4">
          <div className={`absolute inset-0 border border-dashed rounded-full rotate-ring-slow ${
            isDragging ? 'border-[var(--accent-blue)]' : 'border-[rgba(0,176,255,0.25)]'
          }`}></div>
          <div className={`absolute inset-[12px] border border-dotted rounded-full rotate-ring-ccw ${
            isDragging ? 'border-[var(--accent-blue)]' : 'border-[rgba(61,130,246,0.35)]'
          }`}></div>
          <div className={`absolute inset-[24px] border border-dashed rounded-full rotate-ring-cw ${
            isDragging ? 'border-[var(--accent-blue)] opacity-60' : 'border-[rgba(0,176,255,0.15)]'
          }`}></div>
          
          {/* Target Reticle Crosshair */}
          <svg 
            viewBox="0 0 100 100" 
            className={`w-14 h-14 transition-transform duration-500 ${
              isDragging ? 'scale-125 text-[var(--accent-blue)] rotate-45' : 'text-[var(--accent-cyan)]'
            }`}
          >
            <circle cx="50" cy="50" r="16" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="50" y1="12" x2="50" y2="25" stroke="currentColor" strokeWidth="2" />
            <line x1="50" y1="75" x2="50" y2="88" stroke="currentColor" strokeWidth="2" />
            <line x1="12" y1="50" x2="25" y2="50" stroke="currentColor" strokeWidth="2" />
            <line x1="75" y1="50" x2="88" y2="50" stroke="currentColor" strokeWidth="2" />
            <circle cx="50" cy="50" r="2.5" fill="currentColor" />
          </svg>
        </div>

        {/* Interactive Click Button & Description */}
        <div className="text-center z-10 flex flex-col items-center gap-3">
          <div>
            <p className={`font-orbitron text-sm font-bold tracking-[0.15em] mb-1 transition-colors uppercase ${
              isDragging ? 'text-[var(--accent-blue)] glow-text-gold' : 'text-[var(--accent-cyan)] glow-text-cyan'
            }`}>
              {isDragging ? 'RELEASE PAYLOAD TO COMMENCE SCAN' : 'ACQUISITION READY'}
            </p>
            <p className="font-mono-tech text-[10px] text-[var(--text-dim)] uppercase tracking-wider">
              {isDragging ? 'Awaiting release' : 'Drag image here or click below'}
            </p>
          </div>

          {/* Action button inside dropzone */}
          <button 
            type="button"
            className="hud-btn font-orbitron py-2.5 px-6 text-[10px] font-bold tracking-widest mt-2 hover:scale-105 transition-transform"
            onClick={triggerInput}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            LOAD TARGET PAYLOAD
          </button>
        </div>

        {/* Small decorative data visuals */}
        <div className="hidden sm:flex absolute right-4 top-14 bottom-14 w-24 flex-col justify-between items-end pointer-events-none opacity-50 font-mono-tech text-[8px] text-[var(--text-dark)]">
          <div>BUFF_FLOW: 100%</div>
          <div className="text-[var(--accent-cyan)]">MEM_REG: 0x98A</div>
          <div>CORES_NET: 12</div>
          <div>INFERENCE: AP-B0</div>
          <div className="text-[var(--accent-blue)] font-bold">STATE: LOADED</div>
        </div>

        <div className="hidden sm:flex absolute left-4 top-14 bottom-14 w-24 flex-col justify-between items-start pointer-events-none opacity-50 font-mono-tech text-[8px] text-[var(--text-dark)]">
          <div className="text-[var(--accent-blue)] font-bold">NET: SECURE</div>
          <div>VECTORS: GAIN_C</div>
          <div>SCALE: 224px</div>
          <div className="text-[var(--accent-cyan)]">SYS: APERTURE</div>
          <div>FPS_RATE: 60</div>
        </div>
      </div>

      {/* Validation Alert */}
      {validationError && (
        <div className="border border-[rgba(223,42,73,0.4)] bg-[rgba(223,42,73,0.06)] p-3 flex items-center gap-3">
          <span className="led-status fake pulse"></span>
          <p className="font-mono-tech text-[11px] text-[var(--fake-red)] uppercase tracking-wider">
            CRITICAL_ERROR: {validationError}
          </p>
        </div>
      )}
    </div>
  )
}
