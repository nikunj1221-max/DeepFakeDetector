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
        <h2 className="text-xl sm:text-2xl font-bold tracking-[0.15em] text-white glow-text-cyan">
          TARGET ACQUISITION HUD
        </h2>
        <p className="text-xs text-[var(--text-dim)] mt-2 font-mono-tech max-w-lg mx-auto uppercase">
          INJECT SCAN TARGET PROTOCOL FOR DEEP SPECTRUM MATRIX SCANNING.
        </p>
      </div>

      {/* Futuristic Drop Zone Box */}
      <div
        className={`hud-panel cyber-corners relative flex flex-col items-center justify-center p-8 sm:p-10 cursor-pointer transition-all duration-300 min-h-[380px] border-2 ${
          isDragging 
            ? 'border-[var(--accent-gold)] bg-[rgba(255,166,0,0.08)] corners-gold' 
            : 'border-[var(--border-hud)] hover:border-[var(--border-hud-hover)] bg-[rgba(15,33,73,0.35)]'
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

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={onInputChange}
          className="hidden"
        />

        {/* Sweeping Active Scanline - Even when idle */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded">
          <div 
            className="absolute left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-[var(--accent-cyan)] to-transparent opacity-85"
            style={{
              boxShadow: 'var(--glow-cyan)',
              animation: 'sweepVertical 4.5s linear infinite'
            }}
          ></div>
        </div>

        {/* Blinking System Alert Status Banner */}
        <div className="absolute top-0 left-0 right-0 border-b border-[rgba(255,166,0,0.2)] bg-[rgba(255,166,0,0.04)] px-4 py-2 flex items-center justify-between font-mono-tech text-[9px]">
          <div className="flex items-center gap-1.5 text-[var(--accent-cyan)] glow-text-cyan">
            <span className="led-status active pulse"></span>
            <span>SYSTEM_ONLINE // EFFICIENTNET_CORES</span>
          </div>
          <div className="animate-pulse text-[var(--accent-cyan)] glow-text-cyan font-bold tracking-widest">
            [SYS_ALERT: WAITING_FOR_TARGET_INPUT]
          </div>
        </div>

        {/* Dynamic Telemetry HUD Markings inside panel */}
        <div className="absolute top-10 left-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          LOC_COORD: [45.927, -122.390]
        </div>
        <div className="absolute top-10 right-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          TARGET_MODE: APERTURE_LOCK
        </div>
        <div className="absolute bottom-3 left-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          GRID_SEC: RX-709
        </div>
        <div className="absolute bottom-3 right-4 font-mono-tech text-[9px] text-[var(--text-dark)] tracking-wider">
          SYS_ZOOM: 100%
        </div>

        {/* Central Rotating Target Vector (JARVIS core) */}
        <div className="relative h-32 w-32 flex items-center justify-center mb-5 mt-4">
          {/* Concentric rotating indicator vectors */}
          <div className={`absolute inset-0 border-2 border-dashed rounded-full rotate-ring-slow ${
            isDragging ? 'border-[var(--accent-gold)]' : 'border-[rgba(255,166,0,0.3)]'
          }`}></div>
          <div className={`absolute inset-[12px] border border-dotted rounded-full rotate-ring-ccw ${
            isDragging ? 'border-[var(--accent-gold)]' : 'border-[rgba(0,240,255,0.5)]'
          }`}></div>
          <div className={`absolute inset-[24px] border border-dashed rounded-full rotate-ring-cw ${
            isDragging ? 'border-[var(--accent-gold)] opacity-70' : 'border-[var(--accent-cyan-dim)]'
          }`}></div>
          
          {/* Target Reticle Crosshair SVG */}
          <svg 
            viewBox="0 0 100 100" 
            className={`w-14 h-14 transition-transform duration-500 ${
              isDragging ? 'scale-125 text-[var(--accent-gold)] rotate-45' : 'text-[var(--accent-cyan)]'
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

        {/* Highly Visible Click Target Button & Labels */}
        <div className="text-center z-10 flex flex-col items-center gap-3">
          <div>
            <p className={`font-orbitron text-sm font-black tracking-[0.2em] mb-1 transition-colors uppercase ${
              isDragging ? 'text-[var(--accent-gold)] glow-text-gold' : 'text-[var(--accent-cyan)] glow-text-cyan'
            }`}>
              {isDragging ? 'RELEASE TO COMMENCE SCAN' : 'ACQUISITION SENSOR DISENGAGED'}
            </p>
            <p className="font-mono-tech text-[10px] text-[var(--text-dim)] uppercase tracking-widest">
              {isDragging ? 'TARGET DETECTED IN FRAME' : 'Drag target image here or click below'}
            </p>
          </div>

          {/* Glowing CTA Button */}
          <button 
            type="button"
            className="hud-btn hud-btn-gold font-orbitron py-2.5 px-6 text-[11px] font-bold tracking-widest mt-2 hover:scale-105 transition-transform"
            onClick={triggerInput}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            ACQUIRE TARGET IMAGE
          </button>
        </div>

        {/* SVG Graphic Telemetry Waveform */}
        <div className="w-48 h-8 opacity-25 mt-6 pointer-events-none">
          <svg viewBox="0 0 100 20" className="w-full h-full text-[var(--accent-cyan)]">
            <path 
              d="M0,10 Q10,2 20,10 T40,10 T60,10 T80,10 T100,10" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="animate-pulse"
            />
            <path 
              d="M0,10 Q5,15 15,10 T30,10 T50,10 T70,10 T90,10 T100,10" 
              fill="none" 
              stroke="rgba(0, 230, 118, 0.5)" 
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Technical Data Columns */}
        <div className="hidden sm:flex absolute right-4 top-14 bottom-14 w-24 flex-col justify-between items-end pointer-events-none opacity-60 font-mono-tech text-[8px] text-[var(--text-dim)]">
          <div>SCAN_BUFF: 0%</div>
          <div className="text-[var(--real-green)]">MEM_ADDR: 0x8C4</div>
          <div>CORE_ALLOC: 4</div>
          <div>VOLT_IND: 1.2V</div>
          <div className="text-[var(--accent-cyan)] font-bold">THERM: STABLE</div>
        </div>

        <div className="hidden sm:flex absolute left-4 top-14 bottom-14 w-24 flex-col justify-between items-start pointer-events-none opacity-60 font-mono-tech text-[8px] text-[var(--text-dim)]">
          <div className="text-[var(--accent-cyan)] font-bold">DATA_NET: ETHER</div>
          <div>ALGO: ENE_B0</div>
          <div>FRAC_SCALE: 1:1</div>
          <div className="text-[var(--real-green)]">FPS: 60.0</div>
          <div>SECURE: SEC-3</div>
        </div>
      </div>

      {/* Validation Error Screen */}
      {validationError && (
        <div className="border border-[rgba(255,61,0,0.4)] bg-[rgba(255,61,0,0.06)] p-3 flex items-center gap-3">
          <span className="led-status fake pulse"></span>
          <p className="font-mono-tech text-[12px] text-[var(--fake-red)] uppercase tracking-wider">
            CRITICAL_ERROR: {validationError}
          </p>
        </div>
      )}
    </div>
  )
}
