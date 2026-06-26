import { useState, useRef, useCallback } from 'react'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 10 * 1024 * 1024

function validate(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'Only JPEG, PNG, and WebP photographs are accepted.'
  if (file.size > MAX_BYTES) return 'File exceeds the 10 MB limit.'
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
        setValidationError(error)
        return
      }
      setValidationError(null)
      onImageSelected(file)
    },
    [onImageSelected],
  )

  const onDragOver = (e) => {
    e.preventDefault()
    if (!isDragging) setIsDragging(true)
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
    inputRef.current?.click()
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-5">

      {/* Drop Zone */}
      <div
        className={`vintage-card vintage-corners relative flex flex-col items-center justify-center p-10 sm:p-14 cursor-pointer min-h-[340px] border-2 border-dashed transition-all duration-300 ${
          isDragging
            ? 'border-[var(--gold)] bg-[var(--gold-dim)]'
            : 'border-[var(--border-aged)] hover:border-[var(--border-aged-hover)] bg-[var(--surface-card)]'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={triggerInput}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && triggerInput(e)}
        aria-label="Drop your photograph here or click to select"
      >
        <div className="vintage-corners-inner"></div>

        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(',')}
          onChange={onInputChange}
          className="hidden"
        />

        {/* Icon */}
        <div className={`mb-6 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
          <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke={isDragging ? 'var(--gold)' : 'var(--maroon)'} strokeWidth="1.2" className="opacity-40">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
        </div>

        {/* Text */}
        <div className="text-center">
          <p className={`font-display text-lg font-bold tracking-wide mb-2 transition-colors ${
            isDragging ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'
          }`}>
            {isDragging ? 'Release to examine' : 'Place your photograph here'}
          </p>
          <p className="font-body text-sm text-[var(--text-muted)]">
            {isDragging
              ? 'The Professor is ready to examine it'
              : 'Drag and drop any image, or click to select from your files'}
          </p>
          <p className="font-mono text-[10px] text-[var(--text-faint)] mt-3 tracking-wider uppercase">
            JPEG · PNG · WebP — up to 10 MB
          </p>
        </div>

        {/* CTA Button */}
        <button
          type="button"
          className="btn-vintage mt-6"
          onClick={triggerInput}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          Select Photograph
        </button>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="border border-[rgba(139,48,64,0.3)] bg-[var(--forgery-red-dim)] px-4 py-3 rounded-md flex items-center gap-3">
          <span className="led-dot danger pulse"></span>
          <p className="font-sans text-sm text-[var(--forgery-red)]">
            {validationError}
          </p>
        </div>
      )}
    </div>
  )
}
