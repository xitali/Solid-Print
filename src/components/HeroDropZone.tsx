'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { UploadCloud, Box, RotateCcw, ArrowUpRight, AlertCircle, FileCheck } from 'lucide-react'
import { HeroVasePrint } from './HeroVasePrint'
import { MODEL_EXTENSIONS, extensionOf, validateFiles, previewEligibility } from '@/lib/rules'
import { PrintLoader } from './PrintLoader'
import { setPendingHeroFile } from '@/lib/hero-file-transfer'

const ModelPreview = dynamic(
  () => import('./ModelPreview').then((m) => m.ModelPreview),
  {
    ssr: false,
    loading: () => (
      <div className="hero-model-loading">
        <PrintLoader />
        <span>Uruchamianie podglądu 3D…</span>
      </div>
    ),
  }
)

export function HeroDropZone({
  material,
  layerHeight,
}: {
  material?: string
  layerHeight?: string
} = {}) {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [isOver, setIsOver] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Zapobieganie otwieraniu upuszczonego pliku w oknie przeglądarki (pułapka z sekcji 4.3)
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => e.preventDefault()
    const handleWindowDrop = (e: DragEvent) => e.preventDefault()

    window.addEventListener('dragover', handleWindowDragOver)
    window.addEventListener('drop', handleWindowDrop)

    return () => {
      window.removeEventListener('dragover', handleWindowDragOver)
      window.removeEventListener('drop', handleWindowDrop)
    }
  }, [])

  const validateAndHandle = (selected: File | null) => {
    if (!selected) return
    setError(null)

    const errors = validateFiles([{name:selected.name,size:selected.size,kind:'model'}])
    if(errors.length){setError(errors.join(' '));return}

    setFile(selected)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsOver(false)
    const droppedFile = e.dataTransfer.files?.[0]
    validateAndHandle(droppedFile || null)
  }

  const handleQuoteClick = () => {
    if (!file) return
    // Plik zostaje w pamięci podręcznej przeglądarki i przechodzi do formularza wyceny
    setPendingHeroFile(file)
    router.push('/wycena?type=print')
  }

  const handleReset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFile(null)
    setError(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  const isEligibleFor3D = file ? previewEligibility(file.name, file.size) : false

  return (
    <div
      className={`hero-drop ${isOver ? 'is-over' : ''} ${file ? 'has-file' : ''}`}
      onDragOver={(e) => {
        e.preventDefault()
        setIsOver(true)
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOver(false)
        }
      }}
      onDrop={handleDrop}
      tabIndex={0}
      role="region"
      aria-label="Strefa podglądu i upuszczania modelu 3D"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          if (!file) inputRef.current?.click()
        }
      }}
    >
      <input
        ref={inputRef}
        id="hero-file-input"
        type="file"
        className="sr-only"
        accept={MODEL_EXTENSIONS.map((x) => '.' + x).join(',')}
        onChange={(e) => {
          validateAndHandle(e.target.files?.[0] || null)
        }}
      />

      {/* STAN 2: Przeciąganie nad kartą */}
      {isOver && (
        <div className="hero-drop-dragover-overlay" aria-hidden="true">
          <UploadCloud size={52} strokeWidth={1.4} />
          <p className="hero-drop-dragover-title">Upuść, żeby dodać do wyceny</p>
          <span className="mono">MODEL ZOSTANIE ODCZYTANY LOKALNIE W PRZEGLĄDARCE</span>
        </div>
      )}

      {/* STAN 3: Wybrany plik (podgląd 3D lub karta techniczna) */}
      {file && !isOver && (
        <div className="hero-drop-file-view">
          <div className="hero-drop-file-header mono">
            <span className="file-ready-badge">
              <FileCheck size={14} /> GOTOWY DO WYCENY
            </span>
            <span className="file-size-tag">{(file.size / 1024 / 1024).toFixed(2)} MiB</span>
          </div>

          <div className="hero-drop-preview-area">
            {isEligibleFor3D ? (
              <ModelPreview file={file} />
            ) : (
              <div className="hero-file-card-fallback">
                <Box size={56} strokeWidth={1.2} />
                <h3>{file.name}</h3>
                <p className="mono">FORMAT .{extensionOf(file.name).toUpperCase()} · PRZEKAŻEMY DO WYCENY</p>
                <span className="note-text">
                  Ten format lub rozmiar geometrii zostanie oceniony bezpośrednio przez oprogramowanie pracowni.
                </span>
              </div>
            )}
          </div>

          <div className="hero-drop-file-footer">
            <div className="hero-drop-file-meta">
              <span className="file-name" title={file.name}>
                {file.name}
              </span>
              <span className="mono muted">LOKALNY PLIK · BEZ WYSYŁANIA PRZED ZAPYTANIEM</span>
            </div>

            <div className="hero-drop-file-actions">
              <button
                type="button"
                onClick={handleQuoteClick}
                className="btn btn--primary"
                aria-label={`Przejdź do formularza wyceny z modelem ${file.name}`}
              >
                Wyceń ten model <ArrowUpRight size={18} />
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="btn btn--secondary btn--small"
                aria-label="Wybierz inny plik modelu"
              >
                <RotateCcw size={15} />
                <span>Zmień plik</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STAN 1: Spoczynkowy — animowany wazon + nakładka zaproszenia do upuszczenia */}
      {!file && !isOver && (
        <div className="hero-drop-resting">
          {/* Animowany wydruk 18 warstw wazonu (Plansza 03) */}
          <div className="hero-drop-vase-container">
            <HeroVasePrint material={material} layerHeight={layerHeight} />
          </div>

          {/* Pływający panel akcji i upuszczania modelu */}
          <div className="hero-drop-overlay-panel">
            {error && (
              <div className="hero-drop-error" role="alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <div className="hero-drop-cta-box">
              <div className="hero-drop-cta-text">
                <p className="hero-drop-cta-title">
                  <span className="desktop-only">Przeciągnij model tutaj lub</span> wybierz plik
                </p>
                <p className="hero-drop-cta-formats mono">
                  .STL · .STEP · .OBJ · .3MF · .GLB · DO 100 MIB
                </p>
              </div>

              <label htmlFor="hero-file-input" className="btn btn--primary hero-drop-cta-btn">
                <UploadCloud size={17} />
                <span>Wybierz plik</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
