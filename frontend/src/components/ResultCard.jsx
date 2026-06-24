import { useEffect, useState } from 'react'

/* Animated bar — grows from 0 to `value` on mount */
function AnimatedBar({ value, color }) {
  const [width, setWidth] = useState(0)

  useEffect(() => {
    // Defer so the transition actually fires
    const id = setTimeout(() => setWidth(value), 60)
    return () => clearTimeout(id)
  }, [value])

  return (
    <div className="progress-track">
      <div
        className="progress-fill"
        style={{ width: `${width}%`, background: color }}
      />
    </div>
  )
}

export default function ResultCard({ result, onReset }) {
  const { verdict, confidence, probabilities } = result
  const isFake = verdict === 'FAKE'

  const accentColor = isFake ? 'var(--fake)' : 'var(--real)'

  return (
    <div className="result-card">

      {/* ── Verdict ─────────────────────────────────────────────────── */}
      <div className={`verdict-badge ${isFake ? 'is-fake' : 'is-real'}`}>
        <div className={`verdict-icon ${isFake ? 'fake' : 'real'}`}>
          {isFake ? '⚠' : '✓'}
        </div>

        <div>
          <p className={`verdict-label ${isFake ? 'fake' : 'real'}`}>
            {isFake ? 'Manipulation detected' : 'No manipulation found'}
          </p>
          <p className={`verdict-title ${isFake ? 'fake' : 'real'}`}>
            {isFake ? 'Deepfake Image' : 'Authentic Image'}
          </p>
        </div>
      </div>

      {/* ── Confidence ──────────────────────────────────────────────── */}
      <div>
        <p className="section-label">Model confidence</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            How certain the model is about its verdict
          </span>
          <span className="mono-val" style={{ color: accentColor, fontWeight: 500 }}>
            {confidence.toFixed(1)}%
          </span>
        </div>
        <AnimatedBar value={confidence} color={accentColor} />
      </div>

      {/* ── Probability breakdown ────────────────────────────────────── */}
      <div>
        <p className="section-label">Class probabilities</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* REAL */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  color: 'var(--real)',
                  fontWeight: 500,
                }}
              >
                REAL
              </span>
              <span className="mono-val">{probabilities.real.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={probabilities.real} color="var(--real)" />
          </div>

          {/* FAKE */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '12px',
                  color: 'var(--fake)',
                  fontWeight: 500,
                }}
              >
                FAKE
              </span>
              <span className="mono-val">{probabilities.fake.toFixed(1)}%</span>
            </div>
            <AnimatedBar value={probabilities.fake} color="var(--fake)" />
          </div>
        </div>
      </div>

      {/* ── Model metadata ───────────────────────────────────────────── */}
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {[
          ['Model', 'EfficientNet-B0'],
          ['Input', '224 × 224 px'],
          ['Classes', 'REAL / FAKE'],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="mono-sm" style={{ marginBottom: '2px' }}>{k}</p>
            <p className="mono-sm" style={{ color: 'var(--text-secondary)' }}>{v}</p>
          </div>
        ))}
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────────── */}
      <p
        style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.6,
          margin: 0,
          borderTop: '1px solid var(--border)',
          paddingTop: '16px',
        }}
      >
        ⚠ This tool is a forensic aid. Accuracy depends on the fine-tuned
        weights loaded in the backend. Always pair algorithmic results with
        human review for high-stakes decisions.
      </p>

      {/* ── Analyze another ─────────────────────────────────────────── */}
      <button className="btn-ghost" onClick={onReset} style={{ alignSelf: 'flex-start' }}>
        ← Analyze another image
      </button>
    </div>
  )
}
