import { useState, useEffect } from 'react'
import { soundManager } from '../utils/sound'

export default function WelcomeModal() {
  const [visible, setVisible] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)
  const [animateOut, setAnimateOut] = useState(false)

  useEffect(() => {
    // Small delay so the page renders first, then the modal slides in
    const timer = setTimeout(() => {
      setVisible(true)
      soundManager.playSweep()
      // Trigger CSS enter animation after mount
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setAnimateIn(true)
        })
      })
    }, 600)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    soundManager.playClick()
    setAnimateOut(true)
    // Wait for exit animation to complete before unmounting
    setTimeout(() => {
      setVisible(false)
    }, 450)
  }

  if (!visible) return null

  const steps = [
    {
      num: '01',
      title: 'UPLOAD TARGET IMAGE',
      desc: 'Navigate to the Diagnostic Workspace and drop any photo — a selfie, portrait, or downloaded image — into the scanner receiver.'
    },
    {
      num: '02',
      title: 'INITIATE SCAN DIRECTIVE',
      desc: 'Press "Send Scan Directive" to engage the EfficientNet neural classifier. JARVIS will process spectral frequencies in real-time.'
    },
    {
      num: '03',
      title: 'RECEIVE VERDICT',
      desc: 'View the full forensic report — confidence meters, anomaly heatmaps, and a REAL or FAKE classification verdict.'
    }
  ]

  return (
    <div
      className={`welcome-modal-overlay ${animateIn ? 'active' : ''} ${animateOut ? 'exit' : ''}`}
      onClick={handleDismiss}
    >
      <div
        className={`welcome-modal-card ${animateIn ? 'active' : ''} ${animateOut ? 'exit' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent bar */}
        <div className="welcome-modal-accent-bar"></div>

        {/* Corner brackets */}
        <div className="cyber-corners"><div className="cyber-corners-inner"></div></div>

        {/* Header section */}
        <div className="welcome-modal-header">
          <div className="welcome-modal-badge">
            <span className="led-status active pulse"></span>
            <span>SYSTEM BRIEFING</span>
          </div>

          <div className="welcome-modal-icon-ring">
            <div className="welcome-modal-ring-outer rotate-ring-cw"></div>
            <div className="welcome-modal-ring-inner rotate-ring-ccw"></div>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" strokeWidth="1.8">
              <circle cx="12" cy="12" r="10" strokeDasharray="4 2" />
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
            </svg>
          </div>

          <h2 className="welcome-modal-title">
            WELCOME TO <span className="welcome-modal-title-accent">STARK LABORATORIES</span>
          </h2>
          <p className="welcome-modal-subtitle">
            DEEPGUARD COGNITIVE DEFENSE MATRIX — v3.0
          </p>
        </div>

        {/* Divider */}
        <div className="welcome-modal-divider"></div>

        {/* Description */}
        <div className="welcome-modal-body">
          <p className="welcome-modal-intro">
            This is <strong>Mr. Stark's Laboratory</strong> — a premium AI-powered forensic console designed to detect deepfake and AI-generated images. Upload any photograph and our neural diagnostic engine will analyze it to determine whether it is <span className="glow-text-green" style={{ fontWeight: 700 }}>AUTHENTIC</span> or a <span className="glow-text-red" style={{ fontWeight: 700 }}>DEEPFAKE</span>.
          </p>

          {/* Steps */}
          <div className="welcome-modal-steps">
            {steps.map((step) => (
              <div key={step.num} className="welcome-modal-step">
                <div className="welcome-modal-step-num">{step.num}</div>
                <div className="welcome-modal-step-content">
                  <h4 className="welcome-modal-step-title">{step.title}</h4>
                  <p className="welcome-modal-step-desc">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="welcome-modal-footer">
          <div className="welcome-modal-footer-meta">
            <span className="led-status active real"></span>
            <span>ALL DIAGNOSTIC CORES ONLINE</span>
          </div>
          <button
            className="hud-btn welcome-modal-btn"
            onClick={handleDismiss}
            onMouseEnter={() => soundManager.playHover()}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
            INITIALIZE LABORATORY
          </button>
        </div>
      </div>
    </div>
  )
}
