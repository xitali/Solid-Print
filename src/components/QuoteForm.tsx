'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  ArrowUpRight,
  UploadCloud,
  File,
  Trash2,
  Eye,
  RotateCw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  Clock,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { MODEL_EXTENSIONS, validateFiles, validateInquiry, previewEligibility, type FileMeta } from '@/lib/rules'
import type { Product, Material } from '@/lib/types'
import { sendInquiry, SubmissionError, type SubmissionState, type SubmissionSession, type UploadItem } from '@/lib/submission'
import { FileLayersIcon, IdeaIcon, ProductBoxIcon } from '@/components/Icons'
import { consumePendingHeroFile } from '@/lib/hero-file-transfer'

const ModelPreview = dynamic(() => import('./ModelPreview').then((m) => m.ModelPreview), {
  ssr: false,
  loading: () => (
    <div className="model-preview">
      <div className="preview-message">Uruchamianie podglądu 3D…</div>
    </div>
  ),
})

type Attachment = {
  id: string
  file: globalThis.File
  kind: 'model' | 'reference'
  progress: number
  status: 'ready' | 'uploading' | 'done' | 'error'
  serverId?: number
}

export function QuoteForm({
  initialType = 'print',
  product,
  variant = '',
  materials = [],
  pickupEnabled = false,
  application = '',
  initialQuantity = 1,
  phone = '',
}: {
  initialType?: string
  product?: Product
  variant?: string
  materials?: Material[]
  pickupEnabled?: boolean
  application?: string
  initialQuantity?: number
  phone?: string
}) {
  const [type, setType] = useState<'print' | 'design' | 'product'>(
    (['print', 'design', 'product'].includes(initialType) ? initialType : 'print') as 'print' | 'design' | 'product'
  )
  const [files, setFiles] = useState<Attachment[]>([])
  const [dragging, setDragging] = useState(false)
  const [draggingRef, setDraggingRef] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [number, setNumber] = useState('')
  const [preview, setPreview] = useState<Attachment | null>(null)
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; description?: string }>({})
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  const state = useRef<SubmissionState>({ key: '', session: null })
  const formRef = useRef<HTMLFormElement>(null)

  // Przywracanie danych z sessionStorage (sekcja 5.5)
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem('solid_print_quote_draft')
      if (saved && formRef.current) {
        const data = JSON.parse(saved)
        Object.entries(data).forEach(([key, val]) => {
          const el = formRef.current?.elements.namedItem(key) as
            | HTMLInputElement
            | HTMLTextAreaElement
            | HTMLSelectElement
            | null
          if (el && typeof val === 'string' && !el.value) {
            el.value = val
          }
        })
      }
    } catch {}
  }, [])

  // Pobranie pliku przekazanego ze strefy Hero na stronie głównej (sekcja 4.2)
  useEffect(() => {
    const heroFile = consumePendingHeroFile()
    if (heroFile) {
      const newAttachment: Attachment = {
        id: crypto.randomUUID(),
        file: heroFile,
        kind: 'model',
        progress: 0,
        status: 'ready',
      }
      setFiles([newAttachment])
      setType('print')
    }
  }, [])

  useEffect(() => {
    if (number) {
      try {
        sessionStorage.removeItem('solid_print_quote_draft')
      } catch {}
      document.querySelector('.submission-success')?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      document.querySelector<HTMLElement>('.submission-success h2')?.focus()
    }
  }, [number])

  const handleFormChange = () => {
    if (!formRef.current) return
    try {
      const formData = new FormData(formRef.current)
      const draft: Record<string, string> = {}
      const keys = [
        'description',
        'quantity',
        'deadline',
        'material',
        'color',
        'delivery',
        'name',
        'email',
        'phone',
        'company',
        'nip',
        'unit',
      ]
      keys.forEach((k) => {
        const val = formData.get(k)
        if (typeof val === 'string' && val) draft[k] = val
      })
      sessionStorage.setItem('solid_print_quote_draft', JSON.stringify(draft))
    } catch {}
  }

  // Walidacja przy wyjściu z pola z aria-describedby (sekcja 5.6)
  const validateField = (field: 'name' | 'email' | 'description', value: string) => {
    setFieldErrors((prev) => {
      const next = { ...prev }
      if (field === 'name') {
        if (!value.trim()) {
          next.name = 'Wpisz swoje imię.'
        } else if (value.trim().length < 2) {
          next.name = 'Imię musi mieć minimum 2 znaki.'
        } else {
          delete next.name
        }
      }
      if (field === 'email') {
        if (!value.trim()) {
          next.email = 'Podaj adres e-mail.'
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
          next.email = 'Podaj poprawny adres e-mail (np. jan@domena.pl).'
        } else {
          delete next.email
        }
      }
      if (field === 'description') {
        if (!value.trim()) {
          next.description = 'Opis jest wymagany do przygotowania wyceny.'
        } else if (value.trim().length < 10) {
          next.description = 'Opis musi mieć przynajmniej 10 znaków.'
        } else {
          delete next.description
        }
      }
      return next
    })
  }

  const fileMeta = (list: Attachment[]): FileMeta[] =>
    list.map((f) => ({ name: f.file.name, size: f.file.size, kind: f.kind }))

  function addFiles(list: FileList | null, kind: 'model' | 'reference') {
    if (!list || busy) return
    const incoming = Array.from(list).map((file) => ({
      id: crypto.randomUUID(),
      file,
      kind,
      progress: 0,
      status: 'ready' as const,
    }))
    const newFiles = [...files, ...incoming]
    const errors = validateFiles(fileMeta(newFiles))
    if (errors.length) {
      setError(errors.join(' '))
      return
    }
    setError('')
    setFiles(newFiles)
    state.current.session = null
  }

  function remove(id: string) {
    if (busy) return
    setFiles((f) => f.filter((x) => x.id !== id))
    state.current.session = null
    if (preview?.id === id) setPreview(null)
  }

  const patchFile = (id: string, patch: Partial<Attachment>) =>
    setFiles((list) => list.map((f) => (f.id === id ? { ...f, ...patch } : f)))

  async function upload(file: UploadItem, serverId: number, auth: SubmissionSession) {
    patchFile(file.id, { status: 'uploading', progress: 0, serverId })
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open('PUT', `/api/quote/files/${serverId}`)
      xhr.setRequestHeader('x-upload-token', auth.token)
      xhr.setRequestHeader('Content-Type', 'application/octet-stream')
      xhr.timeout = 5 * 60 * 1000

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          patchFile(file.id, { progress: Math.round((e.loaded / e.total) * 100) })
        }
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          patchFile(file.id, { status: 'done', progress: 100 })
          resolve()
        } else {
          let message = 'Nie udało się przesłać pliku.'
          let code: string | undefined
          try {
            const result = JSON.parse(xhr.responseText)
            message = result.error || message
            code = result.code
          } catch {}
          patchFile(file.id, { status: 'error' })
          reject(new SubmissionError(`${file.file.name}: ${message}`, code))
        }
      }
      xhr.onerror = () => {
        patchFile(file.id, { status: 'error' })
        reject(new Error('Połączenie zostało przerwane. Wyślij zapytanie ponownie, aby wznowić.'))
      }
      xhr.ontimeout = () => {
        patchFile(file.id, { status: 'error' })
        reject(new Error('Przesyłanie trwało zbyt długo. Spróbuj ponownie.'))
      }
      xhr.send(file.file)
    })
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError('')

    const form = new FormData(event.currentTarget)
    const data = Object.fromEntries(form.entries())
    const parsed = validateInquiry(
      {
        ...data,
        type,
        quantity: Number(data.quantity),
        privacy: form.get('privacy') === 'on' || privacyAccepted,
        productId: product ? String(product.id) : undefined,
      },
      fileMeta(files)
    )

    if (!parsed.success) {
      setError(
        parsed.error.issues.some((i) => i.path[0] === 'files')
          ? 'Dodaj przynajmniej jeden model do wydruku.'
          : parsed.error.issues.some((i) => i.path[0] === 'productId')
          ? 'Najpierw wybierz produkt z katalogu.'
          : 'Sprawdź formularz: uzupełnij imię, poprawny e-mail, opis (minimum 10 znaków) oraz zaakceptuj prywatność.'
      )
      return
    }

    setBusy(true)
    try {
      if (!state.current.key) state.current.key = crypto.randomUUID()
      const newNum = await sendInquiry(state.current, { ...parsed.data, website: data.website as string }, files, upload)
      setNumber(newNum)
      setPreview(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się wysłać zapytania. Spróbuj ponownie.')
    } finally {
      setBusy(false)
    }
  }

  const modelFiles = files.filter((f) => f.kind === 'model')
  const referenceFiles = files.filter((f) => f.kind === 'reference')

  // Ekran sukcesu z numerem zapytania i osią „co dalej” (sekcja 3.7)
  if (number) {
    return (
      <section className="submission-success form-card" role="status">
        <div className="submission-success__badge">
          <CheckCircle2 size={46} strokeWidth={1.5} color="var(--accent)" />
        </div>
        <h2 tabIndex={-1}>Twój pomysł jest już u nas.</h2>
        <p className="submission-success__intro">
          Zapisaliśmy Twoje zapytanie. Odpowiemy na podany adres e-mail z dokładną oceną technologiczną, wyceną oraz terminem wykonania.
        </p>

        <div className="submission-number-box">
          <span className="mono muted">NUMER TWOJEGO ZAPYTANIA</span>
          <div className="submission-number">{number}</div>
        </div>

        {/* Krótka oś „co dalej” (ocena → wycena → wykonanie → odbiór) */}
        <div className="next-steps-timeline">
          <h3 className="mono muted">CO DZIEJE SIĘ DALEJ?</h3>
          <div className="timeline-grid">
            <div className="timeline-step">
              <span className="step-num mono">01</span>
              <h4>Ocena techniczna</h4>
              <p>Sprawdzamy geometrię modelu, grubość ścianek i dobór dyszy.</p>
            </div>
            <div className="timeline-step">
              <span className="step-num mono">02</span>
              <h4>Wycena i dobór materiału</h4>
              <p>Przesyłamy konkretną cenę, propozycję materiału i termin.</p>
            </div>
            <div className="timeline-step">
              <span className="step-num mono">03</span>
              <h4>Realizacja po Twojej zgodzie</h4>
              <p>Drukujemy dopiero po Twojej pełnej akceptacji ustaleń.</p>
            </div>
            <div className="timeline-step">
              <span className="step-num mono">04</span>
              <h4>Odbiór lub wysyłka</h4>
              <p>Bezpiecznie pakujemy i wysyłamy lub przygotowujemy do odbioru.</p>
            </div>
          </div>
        </div>

        <div className="submission-success__actions">
          <Link className="btn btn--primary" href="/">
            Wróć do strony głównej <ArrowUpRight size={18} />
          </Link>
          <Link className="btn btn--secondary" href="/projekty">
            Zobacz gotowe projekty
          </Link>
        </div>
      </section>
    )
  }

  return (
    <form className="quote-form-layout" onSubmit={submit} onChange={handleFormChange} ref={formRef}>
      {/* LEWA KOLUMNA: Pola i karty formularza (max-width 720 px) */}
      <div className="quote-form-main">
        {/* Przełącznik ścieżki (Segmented Control z sekcji 3.3) */}
        <div className="path-switch" role="tablist" aria-label="Rodzaj zapytania">
          <button
            type="button"
            role="tab"
            aria-selected={type === 'print'}
            disabled={busy}
            onClick={() => {
              setType('print')
              setError('')
            }}
          >
            <FileLayersIcon size={22} />
            <span>Mam model</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={type === 'design'}
            disabled={busy}
            onClick={() => {
              setType('design')
              setError('')
            }}
          >
            <IdeaIcon size={22} />
            <span>Mam pomysł</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={type === 'product'}
            disabled={busy}
            onClick={() => {
              setType('product')
              setError('')
            }}
          >
            <ProductBoxIcon size={22} />
            <span>Gotowy produkt</span>
          </button>
        </div>

        {/* Informacja przy wyborze gotowego produktu */}
        {type === 'product' && (
          <div className="notice-box" style={{ marginBottom: 'var(--s-6)' }}>
            {product ? (
              <div>
                <strong>Projekt z katalogu: {product.title}</strong>
                <p>Przygotujemy ofertę na wykonanie tego projektu. Wymiary, wariant i ilość potwierdzimy w wycenie.</p>
              </div>
            ) : (
              <div>
                <strong>Nie wybrano jeszcze projektu.</strong>
                <p>
                  Przejdź do katalogu i wybierz projekt, o który chcesz zapytać:{' '}
                  <Link className="text-link" href="/projekty">
                    Katalog gotowych projektów <ArrowUpRight size={15} />
                  </Link>
                </p>
              </div>
            )}
          </div>
        )}

        <fieldset disabled={busy} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
          {/* KARTA 01: Model / Opis pomysłu (sekcja 3.4 i 3.6) */}
          <section className="form-card">
            <div className="form-card__head">
              <span className="form-card__num mono">01 /</span>
              <h2>{type === 'print' ? 'Dodaj swój model' : type === 'design' ? 'Opowiedz o projekcie' : 'Wybrany projekt'}</h2>
            </div>

            {/* STREFA WGROMADZENIA MODELI 3D DLA ŚCIEŻKI "MAM MODEL" */}
            {type === 'print' && (
              <div className="stack" style={{ '--stack-gap': 'var(--s-5)' } as React.CSSProperties}>
                <div
                  className={`dropzone ${dragging ? 'is-over' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    addFiles(e.dataTransfer.files, 'model')
                  }}
                >
                  <input
                    id="models"
                    className="sr-only"
                    type="file"
                    multiple
                    accept={MODEL_EXTENSIONS.map((x) => '.' + x).join(',')}
                    onChange={(e) => {
                      addFiles(e.target.files, 'model')
                      e.target.value = ''
                    }}
                  />
                  <UploadCloud className="dropzone__icon" aria-hidden="true" size={48} strokeWidth={1.3} />
                  <p className="dropzone__title">Przeciągnij i upuść pliki tutaj</p>
                  <p className="dropzone__hint">
                    Do 5 modeli · 100 MiB na plik · 250 MiB łącznie
                    <br />
                    <span className="mono" style={{ fontSize: '11px', display: 'inline-block', marginTop: '4px', opacity: 0.85 }}>
                      Pliki są wczytywane lokalnie. Przy odświeżeniu strony wybierz plik jeszcze raz.
                    </span>
                  </p>
                  <label htmlFor="models" className="btn btn--secondary">
                    Wybierz pliki
                  </label>
                  <details className="dropzone__formats">
                    <summary>Obsługiwane formaty plików (24 rozszerzenia)</summary>
                    <div className="dropzone__formats-content">
                      <div className="dropzone__formats-group">
                        <span className="dropzone__formats-group-title">Najlepsze do druku (zalecane):</span>
                        <ul>
                          <li><strong>.step, .stp</strong> — Bryła CAD z dokładną geometrią (standard inżynierski)</li>
                          <li><strong>.3mf</strong> — Nowoczesny model siatkowy z jednostkami, kolorami i parametrami</li>
                          <li><strong>.stl</strong> — Najpopularniejszy format siatki trójkątów (z interaktywnym podglądem 3D)</li>
                        </ul>
                      </div>
                      <div className="dropzone__formats-group">
                        <span className="dropzone__formats-group-title">Inne modele 3D:</span>
                        <p className="mono">.obj · .glb · .gltf · .amf · .ply · .off · .3ds · .fbx · .dae · .wrl · .3dm</p>
                      </div>
                      <div className="dropzone__formats-group">
                        <span className="dropzone__formats-group-title">CAD i rysunki:</span>
                        <p className="mono">.igs · .iges · .dxf · .dwg · .brep · .fcstd · .ifc · .acad · .bim</p>
                      </div>
                      <p className="dropzone__formats-note">
                        Przyjęcie pliku nie oznacza, że model jest poprawny ani że da się go wydrukować. Sprawdzimy to i potwierdzimy cenę oraz termin. Nie wiesz, który format wybrać? Wyślij <strong>.step</strong> albo <strong>.3mf</strong>.
                      </p>
                    </div>
                  </details>
                </div>

                {/* Lista modeli 3D */}
                {modelFiles.length > 0 && (
                  <ul className="file-list" aria-live="polite">
                    {modelFiles.map((f) => (
                      <li key={f.id} className={`file-item ${f.status === 'error' ? 'file-item--error' : ''}`}>
                        <div className="file-item__info">
                          <span className="file-item__name" title={f.file.name}>
                            {f.file.name}
                          </span>
                          <span className="file-item__meta mono">
                            {(f.file.size / 1024 / 1024).toFixed(2)} MiB ·{' '}
                            {f.status === 'done'
                              ? 'Przesłano'
                              : f.status === 'uploading'
                              ? `Wysyłanie ${f.progress}%`
                              : f.status === 'error'
                              ? 'Błąd — ponów'
                              : previewEligibility(f.file.name, f.file.size)
                              ? 'Dostępny podgląd 3D'
                              : 'Wymaga oceny pracowni'}
                          </span>
                        </div>
                        <div className="file-item__actions">
                          {previewEligibility(f.file.name, f.file.size) && (
                            <button
                              type="button"
                              className="btn btn--ghost"
                              onClick={() => setPreview(f)}
                              aria-label={`Podgląd ${f.file.name}`}
                            >
                              <Eye size={18} />
                              <span>Podgląd</span>
                            </button>
                          )}
                          {f.status === 'error' && f.serverId && state.current.session && (
                            <button
                              type="button"
                              className="btn btn--ghost"
                              aria-label={`Ponów ${f.file.name}`}
                              onClick={async () => {
                                setBusy(true)
                                try {
                                  await upload(f, f.serverId!, state.current.session!)
                                  state.current.session!.uploaded.add(f.id)
                                  setError('')
                                } catch (e) {
                                  setError((e as Error).message)
                                } finally {
                                  setBusy(false)
                                }
                              }}
                            >
                              <RotateCw size={17} />
                              <span>Ponów</span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="btn btn--ghost"
                            onClick={() => remove(f.id)}
                            aria-label={`Usuń ${f.file.name}`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        {f.status === 'uploading' && (
                          <div className="file-item__bar">
                            <span style={{ '--p': `${f.progress}%` } as React.CSSProperties} />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Podgląd 3D aktywnego modelu */}
                {preview && (
                  <div className="model-preview-box">
                    <div className="model-preview-box__head">
                      <span className="mono">PODGLĄD 3D / {preview.file.name}</span>
                      <button
                        type="button"
                        className="btn btn--ghost btn--small"
                        onClick={() => setPreview(null)}
                      >
                        Zamknij podgląd ✕
                      </button>
                    </div>
                    <ModelPreview key={preview.id} file={preview.file} />
                  </div>
                )}

                {/* Pole wyboru jednostki */}
                {modelFiles.length > 0 && (
                  <div className="field">
                    <label htmlFor="unit">Jednostka modelu</label>
                    <select id="unit" name="unit" className="select" defaultValue="unknown">
                      <option value="unknown">Nie wiem — ustalmy to wspólnie</option>
                      <option value="mm">Milimetry (mm)</option>
                      <option value="cm">Centymetry (cm)</option>
                      <option value="m">Metry (m)</option>
                    </select>
                    <span className="hint">
                      Podgląd jest poglądowy. Nie potwierdza ostatecznych wymiarów, skali, ceny ani możliwości druku.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* OPIS / ZASTOSOWANIE */}
            <div className="field" style={{ marginTop: type === 'print' ? 'var(--s-5)' : 0 }}>
              <label htmlFor="description">
                {type === 'print'
                  ? 'Do czego będzie służył wydruk?'
                  : type === 'design'
                  ? 'Opisz swój pomysł lub wymagania'
                  : 'Dodatkowe uwagi do zamówienia'}{' '}
                <span className="req">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                className="textarea"
                required
                minLength={10}
                maxLength={10000}
                defaultValue={application ? `Zastosowanie: ${application}. ` : ''}
                placeholder={
                  type === 'design'
                    ? 'Opisz przedmiot, jego zastosowanie, przybliżone wymiary i to, co jest dla Ciebie ważne. Model 3D nie jest wymagany.'
                    : 'Opisz zastosowanie, ważne wymiary, oczekiwaną wytrzymałość i szczegóły, które pomogą dobrać parametry druku.'
                }
                onBlur={(e) => validateField('description', e.target.value)}
                aria-invalid={fieldErrors.description ? 'true' : undefined}
                aria-describedby={fieldErrors.description ? 'description-error' : 'description-hint'}
              />
              {fieldErrors.description ? (
                <span id="description-error" className="error" role="alert">
                  {fieldErrors.description}
                </span>
              ) : (
                <span id="description-hint" className="hint">
                  Minimum 10 znaków. Pomaga nam zrozumieć warunki pracy przedmiotu.
                </span>
              )}
            </div>

            {/* MATERIAŁY POMOCNICZE (SZKIC, ZDJĘCIE, PDF) — KOMPAKTOWA STREFA (sekcja 3.6) */}
            <div className="field" style={{ marginTop: 'var(--s-5)' }}>
              <label>Zdjęcie, szkic lub dokument — opcjonalnie</label>
              <div
                className={`dropzone dropzone--compact ${draggingRef ? 'is-over' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault()
                  setDraggingRef(true)
                }}
                onDragLeave={() => setDraggingRef(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setDraggingRef(false)
                  addFiles(e.dataTransfer.files, 'reference')
                }}
              >
                <input
                  id="reference-files"
                  className="sr-only"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  onChange={(e) => {
                    addFiles(e.target.files, 'reference')
                    e.target.value = ''
                  }}
                />
                <p className="dropzone__title dropzone__title--small">
                  Przeciągnij szkic lub dokument tutaj
                </p>
                <p className="dropzone__hint">Do 3 plików JPG, PNG lub PDF · do 10 MiB każdy</p>
                <label htmlFor="reference-files" className="btn btn--secondary btn--small">
                  Wybierz pliki z dysku
                </label>
              </div>

              {referenceFiles.length > 0 && (
                <ul className="file-list" aria-live="polite">
                  {referenceFiles.map((f) => (
                    <li key={f.id} className="file-item">
                      <div className="file-item__info">
                        <span className="file-item__name">{f.file.name}</span>
                        <span className="file-item__meta mono">
                          {(f.file.size / 1024 / 1024).toFixed(2)} MiB ·{' '}
                          {f.status === 'done' ? 'Przesłano' : f.status === 'uploading' ? `Wysyłanie ${f.progress}%` : 'Gotowy'}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="btn btn--ghost"
                        onClick={() => remove(f.id)}
                        aria-label={`Usuń ${f.file.name}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* KARTA 02: Szczegóły wykonania (sekcja 3.4 i 3.5) */}
          <section className="form-card">
            <div className="form-card__head">
              <span className="form-card__num mono">02 /</span>
              <h2>Szczegóły wykonania</h2>
            </div>

            <div className="form-grid">
              {type === 'product' && product?.variants?.length ? (
                <div className="field full">
                  <label htmlFor="variant">
                    Wariant produktu <span className="req">*</span>
                  </label>
                  <select
                    id="variant"
                    name="variant"
                    className="select"
                    required
                    defaultValue={variant || product.variants[0].name}
                  >
                    {product.variants.map((v) => (
                      <option key={v.name} value={v.name}>
                        {v.name}
                        {v.color && ` / ${v.color}`}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              <div className="field">
                <label htmlFor="quantity">
                  Liczba sztuk <span className="req">*</span>
                </label>
                <input
                  id="quantity"
                  name="quantity"
                  className="input"
                  type="number"
                  min={1}
                  max={100000}
                  defaultValue={Math.max(1, Math.min(100000, initialQuantity))}
                  required
                />
              </div>

              <div className="field">
                <label htmlFor="deadline">Oczekiwany termin — opcjonalnie</label>
                <input
                  id="deadline"
                  name="deadline"
                  className="input"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                />
              </div>

              <div className="field">
                <label htmlFor="material">Materiał</label>
                <select id="material" name="material" className="select" defaultValue="Doradź mi">
                  <option value="Doradź mi">Doradź mi materiał</option>
                  {materials
                    .filter((m) => m.available)
                    .map((m) => (
                      <option key={m.id} value={m.title}>
                        {m.title}
                      </option>
                    ))}
                </select>
              </div>

              <div className="field">
                <label htmlFor="color">Kolor</label>
                <input
                  id="color"
                  name="color"
                  className="input"
                  placeholder="Doradź mi lub wpisz oczekiwania"
                  maxLength={100}
                />
              </div>

              <div className="field full">
                <label htmlFor="delivery">Sposób odbioru</label>
                <select id="delivery" name="delivery" className="select" defaultValue="discuss">
                  <option value="discuss">Ustalmy przy wycenie</option>
                  <option value="shipping">Wysyłka (kurier / paczkomat)</option>
                  {pickupEnabled && <option value="pickup">Odbiór osobisty w pracowni</option>}
                </select>
              </div>
            </div>
          </section>

          {/* KARTA 03: Dane kontaktowe (sekcja 3.4 i 3.5) */}
          <section className="form-card">
            <div className="form-card__head">
              <span className="form-card__num mono">03 /</span>
              <h2>Jak możemy się z Tobą skontaktować?</h2>
            </div>

            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">
                  Imię <span className="req">*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  className="input"
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="given-name"
                  placeholder="Twoje imię"
                  onBlur={(e) => validateField('name', e.target.value)}
                  aria-invalid={fieldErrors.name ? 'true' : undefined}
                  aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                />
                {fieldErrors.name && (
                  <span id="name-error" className="error" role="alert">
                    {fieldErrors.name}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="email">
                  E-mail <span className="req">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  className="input"
                  required
                  maxLength={254}
                  autoComplete="email"
                  placeholder="twoj@email.pl"
                  onBlur={(e) => validateField('email', e.target.value)}
                  aria-invalid={fieldErrors.email ? 'true' : undefined}
                  aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                />
                {fieldErrors.email && (
                  <span id="email-error" className="error" role="alert">
                    {fieldErrors.email}
                  </span>
                )}
              </div>

              <div className="field">
                <label htmlFor="phone">Telefon — opcjonalnie</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className="input"
                  maxLength={40}
                  autoComplete="tel"
                  placeholder="+48 000 000 000"
                />
              </div>

              <div className="field">
                <label htmlFor="company">Firma — opcjonalnie</label>
                <input
                  id="company"
                  name="company"
                  className="input"
                  maxLength={150}
                  autoComplete="organization"
                  placeholder="Nazwa firmy lub działalności"
                />
              </div>

              <div className="field full">
                <label htmlFor="nip">NIP — opcjonalnie</label>
                <input
                  id="nip"
                  name="nip"
                  className="input"
                  maxLength={30}
                  inputMode="numeric"
                  placeholder="Podaj NIP, jeśli zapytanie dotyczy faktury"
                />
              </div>
            </div>

            {/* Zgoda na kontakt i prywatność z jasnym opisem w logicznym miejscu */}
            <div className="form-consent-box">
              <div className="form-consent-box__header">
                <ShieldCheck size={20} className="form-consent-box__icon" />
                <span className="form-consent-box__title">Zgoda na kontakt i przygotowanie wyceny</span>
              </div>
              <p className="form-consent-box__desc">
                Twoje dane oraz przesłane pliki posłużą wyłącznie do analizy technologicznej, przygotowania bezpłatnej wyceny i odpowiedzi na Twoje zapytanie. Nie wysyłamy spamu ani nie przekazujemy danych podmiotom trzecim.
              </p>
              <label className="checkbox-custom-label">
                <input
                  type="checkbox"
                  name="privacy"
                  required
                  checked={privacyAccepted}
                  onChange={(e) => setPrivacyAccepted(e.target.checked)}
                  className="checkbox-custom"
                />
                <span className="checkbox-text">
                  Wyrażam zgodę na kontakt w celu przedstawienia wyceny i akceptuję zasady <a href="/prywatnosc" target="_blank" className="text-link">polityki prywatności</a>. <span className="req">*</span>
                </span>
              </label>
            </div>

            {/* Przycisk wysyłki widoczny bezpośrednio w kroku 03 (dla urządzeń mobilnych) */}
            <div className="quote-mobile-submit">
              {error && (
                <div className="form-error-banner" role="alert" style={{ marginBottom: 'var(--s-3)' }}>
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}
              <button
                type="submit"
                className="btn btn--primary btn--submit"
                disabled={busy}
              >
                {busy ? 'Wysyłanie zapytania…' : 'Wyślij zapytanie'}
                <ArrowUpRight size={19} />
              </button>
            </div>

            {/* Pułapka honeypot na boty */}
            <div className="honeypot" aria-hidden="true" style={{ display: 'none' }}>
              <label>
                Strona internetowa
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>
            </div>
          </section>
        </fieldset>
      </div>

      {/* PRAWA KOLUMNA: Przyklejone podsumowanie na komputerze (sekcja 3.1 i 3.7) */}
      <aside className="quote-form-sidebar">
        <div className="form-card quote-summary-card">
          <div className="quote-summary-header">
            <span className="mono quote-summary-label">PODSUMOWANIE ZAPYTANIA</span>
            <div className="quote-summary-type">
              {type === 'print' ? (
                <>
                  <FileLayersIcon size={20} /> Mam model
                </>
              ) : type === 'design' ? (
                <>
                  <IdeaIcon size={20} /> Mam pomysł
                </>
              ) : (
                <>
                  <ProductBoxIcon size={20} /> Gotowy produkt
                </>
              )}
            </div>
          </div>

          <div className="quote-summary-stats">
            <div className="summary-stat-item">
              <span className="muted small">Modele do wyceny:</span>
              <strong>{modelFiles.length} {modelFiles.length === 1 ? 'plik' : 'plików'}</strong>
            </div>
            {referenceFiles.length > 0 && (
              <div className="summary-stat-item">
                <span className="muted small">Załączniki pomocnicze:</span>
                <strong>{referenceFiles.length} {referenceFiles.length === 1 ? 'plik' : 'plików'}</strong>
              </div>
            )}
          </div>

          {/* Ramka z żółtym wskaźnikiem (sekcja 3.7) */}
          <div className="quote-summary-notice">
            <span className="notice-marker" />
            <p>
              Przesłanie zapytania <strong>nie oznacza</strong> złożenia płatnego zamówienia. Cenę, dobór materiału i termin potwierdzimy po sprawdzeniu projektu.
            </p>
          </div>

          {/* Status zgody w podsumowaniu */}
          <div className="quote-sidebar-consent-status">
            {privacyAccepted ? (
              <span className="consent-status-badge consent-status-badge--accepted mono">
                <CheckCircle2 size={16} /> ZGODA NA KONTAKT: UDZIELONA
              </span>
            ) : (
              <span className="consent-status-badge consent-status-badge--pending mono">
                <Info size={16} /> WYMAGANA ZGODA W KROKU 03
              </span>
            )}
          </div>

          {error && (
            <div className="form-error-banner" role="alert">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {/* Główny przycisk wysyłki (sekcja 3.7) */}
          <button
            type="submit"
            className="btn btn--primary btn--submit"
            disabled={busy}
          >
            {busy ? 'Wysyłanie zapytania…' : 'Wyślij zapytanie'}
            <ArrowUpRight size={19} />
          </button>

          <div className="quote-sidebar-perks mono">
            <div>
              <ShieldCheck size={16} /> BEZPŁATNA OCENA MODELU
            </div>
            <div>
              <Clock size={16} /> ODPOWIEDŹ DO 24H
            </div>
          </div>

          {phone && (
            <div className="quote-sidebar-contact">
              <span className="muted small">Wolisz porozmawiać od razu?</span>
              <a href={`tel:${phone}`} className="phone-link mono">
                {phone}
              </a>
            </div>
          )}
        </div>
      </aside>
    </form>
  )
}
