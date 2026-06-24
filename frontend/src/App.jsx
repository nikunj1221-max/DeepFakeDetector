import { useState, useCallback } from 'react'
import axios from 'axios'
import Header from './components/Header'
import Uploader from './components/Uploader'
import ResultCard from './components/ResultCard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

/*
 * App state machine
 *   idle  →  selected  →  analyzing  →  done
 *                                    ↘  error
 */
export default function App() {
  const [phase, setPhase]       = useState('idle')        // idle | selected | analyzing | done | error
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult]     = useState(null)
  const [errorMsg, setErrorMsg] = useState(null)

  /* ── Image chosen in uploader ───────────────────────────────────── */
  const handleImageSelected = useCallback((file) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setResult(null)
    setErrorMsg(null)
    setPhase('selected')
  }, [previewUrl])

  /* ── Run inference ──────────────────────────────────────────────── */
  const handleAnalyze = useCallback(async () => {
    if (!imageFile) return
    setPhase('analyzing')

    const form = new FormData()
    form.append('file', imageFile)

    try {
      const { data } = await axios.post(`${API_URL}/predict`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setResult(data)
      setPhase('done')
    } catch (err) {
      const detail = err.response?.data?.detail ?? 'Could not reach the backend. Is the API running on port 8000?'
      setErrorMsg(detail)
      setPhase('error')
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
  }, [previewUrl])

  /* ── Render ─────────────────────────────────────────────────────── */
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <Header />

      <main style={{ maxWidth: '960px', margin: '0 auto', padding: '48px 16px' }}>

        {/* ── IDLE: show uploader ────────────────────────────────── */}
        {phase === 'idle' && (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Uploader onImageSelected={handleImageSelected} />
          </div>
        )}

        {/* ── Everything else: two-panel layout ─────────────────── */}
        {phase !== 'idle' && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left: image preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Image + scan overlay */}
              <div
                style={{
                  position: 'relative',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  aspectRatio: '4/3',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Uploaded image for analysis"
                  className={phase === 'analyzing' ? 'scan-image-dim' : ''}
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    display: 'block',
                    transition: 'filter 0.3s',
                  }}
                />

                {/* Scan animation — only while analyzing */}
                {phase === 'analyzing' && (
                  <div className="scan-wrap" aria-hidden="true">
                    <div className="scan-line" />
                    <div className="scan-grid" />
                  </div>
                )}
              </div>

              {/* File metadata strip */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0 4px',
                }}
              >
                <span className="mono-sm" style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                  {imageFile?.name}
                </span>
                <span className="mono-sm">
                  {imageFile && (imageFile.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            </div>

            {/* Right: action / result panel */}
            <div>
              {/* SELECTED: prompt to run */}
              {phase === 'selected' && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '32px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '20px',
                    alignItems: 'center',
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: 'var(--accent-dim, #1D4ED820)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                  </div>

                  <div>
                    <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '17px', fontWeight: 500, margin: '0 0 6px' }}>
                      Image ready
                    </p>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                      EfficientNet-B0 will scan for GAN artifacts, blending boundaries, and frequency anomalies.
                    </p>
                  </div>

                  <button className="btn-primary" onClick={handleAnalyze}>
                    Run forensic analysis
                  </button>

                  <button className="btn-ghost" onClick={handleReset} style={{ width: '100%' }}>
                    Choose a different image
                  </button>
                </div>
              )}

              {/* ANALYZING: loading state */}
              {phase === 'analyzing' && (
                <div
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '56px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div className="spinner" />
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '15px', color: 'var(--text-secondary)', margin: 0 }}>
                    Scanning for artifacts…
                  </p>
                  <p className="mono-sm">Running EfficientNet-B0 inference</p>
                </div>
              )}

              {/* DONE: show result */}
              {phase === 'done' && result && (
                <ResultCard result={result} onReset={handleReset} />
              )}

              {/* ERROR */}
              {phase === 'error' && (
                <div className="error-panel">
                  <div style={{ fontSize: '28px' }}>⚠</div>
                  <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '16px', fontWeight: 500, margin: 0, color: 'var(--fake)' }}>
                    Analysis failed
                  </p>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                    {errorMsg}
                  </p>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button className="btn-primary" onClick={handleAnalyze} style={{ width: 'auto', padding: '10px 20px' }}>
                      Retry
                    </button>
                    <button className="btn-ghost" onClick={handleReset}>
                      Start over
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
