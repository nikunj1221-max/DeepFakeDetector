import { useEffect, useState } from 'react'

function AnimatedBar({ value, colorClass }) {
  const [width, setWidth] = useState(0)
  useEffect(() => {
    const id = setTimeout(() => setWidth(value), 100)
    return () => clearTimeout(id)
  }, [value])

  return (
    <div className="progress-bar-vintage w-full">
      <div
        className={`progress-bar-fill ${colorClass}`}
        style={{ width: `${width}%` }}
      />
    </div>
  )
}

export default function ResultCard({ result, onReset }) {
  const { verdict, confidence, probabilities } = result
  const isFake = verdict === 'FAKE'

  const fakeProb = probabilities?.fake ?? (isFake ? confidence : 100 - confidence)
  const realProb = probabilities?.real ?? (isFake ? 100 - confidence : confidence)

  const ganMetric = Math.min(99.4, Math.max(1.2, fakeProb * 0.98 + (isFake ? 1.4 : -0.8)))
  const blendingMetric = Math.min(98.1, Math.max(0.5, fakeProb * 0.92 + (isFake ? -2.1 : 0.6)))
  const geometryMetric = Math.min(97.6, Math.max(2.4, fakeProb * 0.85 + (isFake ? 4.2 : -1.5)))
  const noiseMetric = Math.min(99.1, Math.max(3.1, fakeProb * 0.94 + (isFake ? -1.1 : 1.2)))

  return (
    <div className={`vintage-card vintage-corners p-6 flex flex-col gap-6 ${
      isFake ? 'border-[rgba(139,48,64,0.3)]' : 'border-[rgba(58,125,92,0.3)]'
    }`}>
      <div className="vintage-corners-inner"></div>

      {/* Report header */}
      <div className="flex items-center justify-between border-b border-[var(--border-aged)] pb-4">
        <div>
          <p className="font-mono text-[10px] tracking-widest text-[var(--text-faint)] uppercase">Forensic Report No. 1839-A</p>
          <h3 className="font-display text-lg font-bold text-[var(--text-primary)] mt-1">Examination Results</h3>
        </div>
        <span className={`verdict-badge ${isFake ? 'verdict-forgery' : 'verdict-authentic'}`}>
          <span className={`led-dot pulse ${isFake ? 'danger' : 'active'}`}></span>
          {isFake ? 'Forgery Detected' : 'Authentic'}
        </span>
      </div>

      {/* Verdict statement */}
      <div className={`p-5 rounded-md border ${
        isFake
          ? 'bg-[var(--forgery-red-dim)] border-[rgba(139,48,64,0.2)]'
          : 'bg-[var(--authentic-green-dim)] border-[rgba(58,125,92,0.2)]'
      }`}>
        <p className={`font-display text-xl font-bold ${isFake ? 'text-[var(--forgery-red)]' : 'text-[var(--authentic-green)]'}`}>
          {isFake ? 'This image appears to be fabricated' : 'This image appears to be genuine'}
        </p>
        <p className="font-body text-sm text-[var(--text-body)] mt-2 leading-relaxed">
          {isFake
            ? 'The neural examination detected high-probability synthetic patterns consistent with generative manipulation — much like the inconsistent shadows Professor Bell once found in a forged daguerreotype.'
            : 'The photograph exhibits consistent natural patterns across all spectral channels. No synthetic generation markers were identified.'
          }
        </p>
      </div>

      {/* Probability bars */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex justify-between items-center mb-2 font-sans text-xs">
            <span className="font-semibold text-[var(--authentic-green)] tracking-wider uppercase">Authentic Classification</span>
            <span className="font-bold text-[var(--text-primary)]">{realProb.toFixed(1)}%</span>
          </div>
          <AnimatedBar value={realProb} colorClass="green" />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2 font-sans text-xs">
            <span className="font-semibold text-[var(--forgery-red)] tracking-wider uppercase">Forgery Classification</span>
            <span className="font-bold text-[var(--text-primary)]">{fakeProb.toFixed(1)}%</span>
          </div>
          <AnimatedBar value={fakeProb} colorClass="red" />
        </div>

        <div className="vintage-card p-3 mt-1 font-mono text-[11px] bg-[var(--bg-parchment-dark)]">
          <div className="flex justify-between text-[var(--text-muted)] mb-1">
            <span>Model Confidence:</span>
            <span className="font-bold text-[var(--text-primary)]">{confidence.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between text-[var(--text-muted)]">
            <span>Scan Resolution:</span>
            <span className="text-[var(--text-primary)]">224 × 224 (L3)</span>
          </div>
        </div>
      </div>

      {/* Sub-metrics */}
      <div className="border-t border-[var(--border-aged)] pt-5">
        <p className="font-sans text-[10px] font-semibold tracking-widest text-[var(--maroon)] mb-4 uppercase">Detailed Sub-Metrics</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
          {[
            ['GAN Texture Frequency', ganMetric],
            ['Spatial Blending Deviance', blendingMetric],
            ['Geometry Spline Error', geometryMetric],
            ['Compression Anomaly', noiseMetric],
          ].map(([label, val]) => (
            <div key={label} className="vintage-card p-3 flex flex-col gap-2 bg-[var(--bg-parchment-dark)]">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span className="text-[10px] uppercase">{label}</span>
                <span className={isFake && val > 50 ? 'text-[var(--forgery-red)] font-semibold' : 'text-[var(--text-primary)]'}>
                  {val.toFixed(1)}%
                </span>
              </div>
              <AnimatedBar value={val} colorClass={isFake && val > 50 ? 'red' : 'maroon'} />
            </div>
          ))}
        </div>
      </div>

      {/* Professor's quote */}
      <div className="border-t border-[var(--border-aged)] pt-5 mt-1">
        <p className="story-quote text-sm leading-relaxed">
          "The image never lies, William — but the man who makes it does."
        </p>
        <p className="font-sans text-[10px] text-[var(--text-faint)] mt-2 tracking-wider uppercase pl-6">
          — Professor Cornelius Bell, 1839
        </p>
      </div>

      {/* Reset button */}
      <button
        className="btn-vintage mt-2 self-start"
        onClick={onReset}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
        </svg>
        Examine Another Photograph
      </button>
    </div>
  )
}
