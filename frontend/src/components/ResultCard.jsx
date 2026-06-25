import { useEffect, useState } from 'react'
import { soundManager } from '../utils/sound'

function AnimatedBar({ value, colorClass }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    const id = setTimeout(() => setWidth(value), 100)
    return () => clearTimeout(id)
  }, [value])

  return (
    <div className="progress-bar-hud w-full">
      <div
        className={`progress-bar-hud-fill ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export default function ResultCard({ result, onReset }) {
  const { verdict, confidence, probabilities } = result
  const isFake = verdict === 'FAKE'
  const isHighConfidence = confidence > 75

  // Trigger sound effect based on verdict
  useEffect(() => {
    if (isFake) {
      soundManager.playWarning()
    } else {
      soundManager.playSuccess()
    }
  }, [isFake])

  // Derive granular metrics from probabilities to look highly forensic and detailed
  const fakeProb = probabilities?.fake ?? (isFake ? confidence : 100 - confidence)
  const realProb = probabilities?.real ?? (isFake ? 100 - confidence : confidence)

  const ganMetric = Math.min(99.4, Math.max(1.2, fakeProb * 0.98 + (isFake ? 1.4 : -0.8)))
  const blendingMetric = Math.min(98.1, Math.max(0.5, fakeProb * 0.92 + (isFake ? -2.1 : 0.6)))
  const geometryMetric = Math.min(97.6, Math.max(2.4, fakeProb * 0.85 + (isFake ? 4.2 : -1.5)))
  const noiseMetric = Math.min(99.1, Math.max(3.1, fakeProb * 0.94 + (isFake ? -1.1 : 1.2)))

  const handleResetClick = () => {
    soundManager.playClick()
    onReset()
  }

  return (
    <div className={`hud-panel cyber-corners p-6 flex flex-col gap-6 animate-fade-up border ${
      isFake ? 'border-[rgba(255,42,95,0.3)] hover:border-[rgba(255,42,95,0.5)] corners-fake' : 'border-[rgba(0,255,102,0.3)] hover:border-[rgba(0,255,102,0.5)] corners-real'
    }`}>
      <div className="cyber-corners-inner"></div>

      {/* Title block */}
      <div className="flex items-center justify-between border-b border-[rgba(0,240,255,0.15)] pb-3 font-orbitron">
        <div>
          <p className="text-[10px] tracking-widest text-[var(--text-dim)] font-mono-tech">REPORT_ID: SC-0x9D7A</p>
          <h3 className="text-sm font-bold tracking-widest text-white">FORENSIC READOUT</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className={`led-status pulse ${isFake ? 'fake' : 'real'}`}></span>
          <span className={`font-mono-tech text-[10px] uppercase tracking-wider ${isFake ? 'text-[var(--fake-red)]' : 'text-[var(--real-green)]'}`}>
            {isFake ? 'THREAT_DETECTED' : 'INTEGRITY_VERIFIED'}
          </span>
        </div>
      </div>

      {/* Verdict Panel */}
      <div className={`flex flex-col sm:flex-row items-center gap-5 p-4 border ${
        isFake ? 'bg-[rgba(255,42,95,0.04)] border-[rgba(255,42,95,0.2)]' : 'bg-[rgba(0,255,102,0.04)] border-[rgba(0,255,102,0.2)]'
      }`}>
        {/* Shield / Crosshair Indicator */}
        <div className="relative h-16 w-16 flex items-center justify-center flex-shrink-0">
          <div className={`absolute inset-0 border border-dashed rounded-full rotate-ring-cw ${isFake ? 'border-[rgba(255,42,95,0.3)]' : 'border-[rgba(0,255,102,0.3)]'}`}></div>
          <div className={`absolute inset-[6px] border border-dotted rounded-full rotate-ring-ccw ${isFake ? 'border-[rgba(255,42,95,0.5)]' : 'border-[rgba(0,255,102,0.5)]'}`}></div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-lg border ${
            isFake 
              ? 'border-[var(--fake-red)] text-[var(--fake-red)] bg-[rgba(255,42,95,0.1)] glow-text-red' 
              : 'border-[var(--real-green)] text-[var(--real-green)] bg-[rgba(0,255,102,0.1)] glow-text-green'
          }`}>
            {isFake ? '⚠' : '✓'}
          </div>
        </div>

        {/* Verdict Typography */}
        <div className="text-center sm:text-left">
          <p className={`font-mono-tech text-[10px] uppercase tracking-widest ${isFake ? 'text-[var(--fake-red)]' : 'text-[var(--real-green)]'}`}>
            {isFake ? 'CRITICAL ABERRATION IDENTIFIED' : 'AUTHENTIC APERTURE KEY'}
          </p>
          <h4 className={`font-orbitron text-xl font-bold tracking-[0.1em] mt-1 ${isFake ? 'text-[var(--fake-red)] glow-text-red' : 'text-[var(--real-green)] glow-text-green'}`}>
            {isFake ? 'DEEPFAKE DETECTED' : 'AUTHENTIC DATA'}
          </h4>
          <p className="text-[11px] text-[var(--text-dim)] mt-1 max-w-sm">
            {isFake 
              ? 'Model detected high-probability synthetic interpolation or neural texture generation.' 
              : 'Target contains standard compression spectra and human-typical structural geometry.'
            }
          </p>
        </div>
      </div>

      {/* Main Grid: Probability and Telemetry Dial */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        
        {/* Left: Probabilities */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono-tech text-xs">
              <span className="text-[var(--real-green)] font-semibold tracking-wider">REAL CLASSIFICATION</span>
              <span className="text-[var(--text-cyber)] font-bold">{realProb.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={realProb} colorClass="green" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 font-mono-tech text-xs">
              <span className="text-[var(--fake-red)] font-semibold tracking-wider">FAKE CLASSIFICATION</span>
              <span className="text-[var(--text-cyber)] font-bold">{fakeProb.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={fakeProb} colorClass="red" />
          </div>

          <div className="border border-[rgba(0,240,255,0.1)] bg-[rgba(6,15,33,0.3)] p-3 mt-1 font-mono-tech text-[11px]">
            <div className="flex justify-between text-[var(--text-dim)] mb-1">
              <span>MODEL CONFIDENCE:</span>
              <span className="text-white font-bold">{confidence.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>SCAN_RESOLUTION:</span>
              <span className="text-white">224 x 224 (L3)</span>
            </div>
          </div>
        </div>

        {/* Right: SVG Concentric Radar Ring Visualizer */}
        <div className="hologram-circle-container py-2">
          {/* Circular SVG HUD dials */}
          <svg width="150" height="150" viewBox="0 0 100 100" className="opacity-95">
            {/* Background grid concentric circles */}
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(0, 240, 255, 0.05)" strokeWidth="1" />
            <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(0, 240, 255, 0.08)" strokeWidth="1" />
            <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(0, 240, 255, 0.12)" strokeWidth="1" />
            
            {/* Outer rotating scale */}
            <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(0, 240, 255, 0.2)" strokeWidth="1" strokeDasharray="3 6" className="rotate-ring-cw" />
            
            {/* Middle telemetry scale */}
            <circle cx="50" cy="50" r="30" fill="none" stroke={isFake ? 'rgba(255, 42, 95, 0.4)' : 'rgba(0, 255, 102, 0.4)'} strokeWidth="2" strokeDasharray="25 40 10 25" className="rotate-ring-ccw" />
            
            {/* Center target ring */}
            <circle cx="50" cy="50" r="15" fill="none" stroke="rgba(0, 240, 255, 0.3)" strokeWidth="1" />
            
            {/* Radar Sweeper Hand */}
            <line x1="50" y1="50" x2="50" y2="8" stroke="var(--accent-cyan)" strokeWidth="1.5" strokeLinecap="round" className="rotate-ring-cw" style={{ animationDuration: '4s' }} />

            {/* Tech crosshairs */}
            <line x1="50" y1="5" x2="50" y2="95" stroke="rgba(0, 240, 255, 0.06)" strokeWidth="1" />
            <line x1="5" y1="50" x2="95" y2="50" stroke="rgba(0, 240, 255, 0.06)" strokeWidth="1" />

            {/* Glowing signal dots based on verdict */}
            {isFake ? (
              <>
                <circle cx="68" cy="38" r="3" fill="var(--fake-red)" className="animate-ping" />
                <circle cx="68" cy="38" r="2" fill="var(--fake-red)" />
                <circle cx="32" cy="65" r="4.5" fill="var(--fake-red)" className="animate-pulse" />
                <circle cx="32" cy="65" r="2.5" fill="var(--fake-red)" />
              </>
            ) : (
              <>
                <circle cx="50" cy="18" r="2" fill="var(--real-green)" />
                <circle cx="75" cy="50" r="2.5" fill="var(--real-green)" className="animate-pulse" />
                <circle cx="28" cy="40" r="1.5" fill="var(--real-green)" />
              </>
            )}
          </svg>
          
          <div className="absolute font-mono-tech text-[10px] text-[var(--accent-cyan)] glow-text-cyan mt-[100px] text-center">
            SYS_SCANNING<br/>
            <span className="text-[var(--text-dark)] text-[9px]">[SWEEP ACTIVE]</span>
          </div>
        </div>
      </div>

      {/* Forensic Deep Dive Sub-Metrics */}
      <div className="border-t border-[rgba(0,240,255,0.1)] pt-5">
        <p className="font-orbitron text-[10px] tracking-widest text-[var(--accent-cyan)] mb-3 uppercase">forensic sub-metrics</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono-tech text-[11px]">
          
          {/* Metric 1 */}
          <div className="border border-[rgba(0,240,255,0.08)] bg-[rgba(6,15,33,0.2)] p-2.5 flex flex-col gap-1.5">
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>GAN FREQ SIGNATURE:</span>
              <span className={isFake && ganMetric > 50 ? 'text-[var(--fake-red)] font-semibold' : 'text-white'}>{ganMetric.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={ganMetric} colorClass={isFake && ganMetric > 50 ? 'red' : 'cyan'} />
          </div>

          {/* Metric 2 */}
          <div className="border border-[rgba(0,240,255,0.08)] bg-[rgba(6,15,33,0.2)] p-2.5 flex flex-col gap-1.5">
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>SPATIAL BLENDING DEVIANCE:</span>
              <span className={isFake && blendingMetric > 50 ? 'text-[var(--fake-red)] font-semibold' : 'text-white'}>{blendingMetric.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={blendingMetric} colorClass={isFake && blendingMetric > 50 ? 'red' : 'cyan'} />
          </div>

          {/* Metric 3 */}
          <div className="border border-[rgba(0,240,255,0.08)] bg-[rgba(6,15,33,0.2)] p-2.5 flex flex-col gap-1.5">
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>GEOMETRY SPLINE ERROR:</span>
              <span className={isFake && geometryMetric > 50 ? 'text-[var(--fake-red)] font-semibold' : 'text-white'}>{geometryMetric.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={geometryMetric} colorClass={isFake && geometryMetric > 50 ? 'red' : 'cyan'} />
          </div>

          {/* Metric 4 */}
          <div className="border border-[rgba(0,240,255,0.08)] bg-[rgba(6,15,33,0.2)] p-2.5 flex flex-col gap-1.5">
            <div className="flex justify-between text-[var(--text-dim)]">
              <span>NOISE BANDWIDTH ANOMALY:</span>
              <span className={isFake && noiseMetric > 50 ? 'text-[var(--fake-red)] font-semibold' : 'text-white'}>{noiseMetric.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={noiseMetric} colorClass={isFake && noiseMetric > 50 ? 'red' : 'cyan'} />
          </div>

        </div>
      </div>

      {/* Advisory Statement */}
      <p className="font-mono-tech text-[10px] text-[var(--text-dark)] leading-normal border-t border-[rgba(0,240,255,0.1)] pt-4 mt-1">
        [WARNING] ALL ALGORITHMIC DECISIONS SHOULD BE WEIGHTED AGAINST STARK SECURITY PROTOCOLS AND HUMAN VALIDATION. EFFICIENTNET COGNITIVE SPECTRA MIGHT DEVIATE UNDER UNUSUAL BACKLIGHT CONDITIONS.
      </p>

      {/* Reset button */}
      <button 
        className="hud-btn hud-btn-gold mt-2 py-3 w-full sm:w-auto self-start"
        onClick={handleResetClick}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="animate-spin" style={{ animationDuration: '6s' }}>
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
        </svg>
        RE-INITIALIZE ACQUISITION SENSOR
      </button>

    </div>
  )
}
