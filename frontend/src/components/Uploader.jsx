import { useState, useRef, useCallback } from 'react'

const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES      = 10 * 1024 * 1024 // 10 MB

function validate(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPEG, PNG, and WebP images are supported.'
  if (file.size > MAX_BYTES)              return 'File must be under 10 MB.'
  return null
}

export default function Uploader({ onImageSelected }) {
  const [isDragging, setIsDragging] = useState(false)
  const [validationError, setValidationError] = useState(null)
  const inputRef = useRef(null)

  const handleFile = useCallback(
    (file) => {
      const error = validate(file)
      if (error) { setValidationError(error); return }
      setValidationError(null)
      onImageSelected(file)
    },
    [onImageSelected],
  )

  const onDragOver  = (e) => { e.preventDefault(); setIsDragging(true) }
  const onDragLeave = ()  => setIsDragging(false)
  const onDrop      = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }
  const onInputChange = (e) => {
    if (e.target.files[0]) handleFile(e.target.files[0])
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%' }}>
      {/* Hero text above the drop zone */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: '26px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
          }}
        >
          Is this image real or AI-generated?
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
          Upload any face image and EfficientNet-B0 will analyse it for deepfake artifacts.
        </p>
      </div>

      {/* Drop zone */}
      <div
        className={`uploader ${isDragging ? 'dragging' : ''}`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Drop an image here or click to choose a file"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={onInputChange}
          style={{ display: 'none' }}
        />

        {/* Icon */}
        <div className="upload-icon-wrap">
          <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <p className="upload-title">
          {isDragging ? 'Drop to analyse' : 'Drop image here or click to upload'}
        </p>
        <p className="upload-sub">JPEG · PNG · WebP · max 10 MB</p>

        {/* Feature tags */}
        <div className="upload-tags">
          {['EfficientNet-B0', 'FaceForensics++', 'Real-time inference'].map((t) => (
            <span key={t} className="tag">{t}</span>
          ))}
        </div>
      </div>

      {/* Validation error */}
      {validationError && (
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: '13px', color: 'var(--fake)', margin: 0 }}>
          ⚠ {validationError}
        </p>
      )}
    </div>
  )
}
