'use client'

import { useEffect, useState, useRef } from 'react'
import { RotateCcw } from 'lucide-react'

/*
 * Hero — animowany pierwszy ekran:
 * - Wazon drukuje się warstwa po warstwie (18 warstw).
 * - Głowica jeździ na boki (oś X) sterowana bezpośrednio przez ref bez re-renderów Reacta.
 * - Efekt stygnięcia: stan 'hot' (#FF8A5B) -> 'warm' (#C2410C) -> 'cool' (#17191A).
 * - Licznik: „WARSTWA XX/18”.
 * - Wstrzymanie pętli rAF, gdy element jest poza ekranem (IntersectionObserver).
 */

const TOTAL_LAYERS = 18
const LAYER_MS = 240
const BASE_Y = 370
const LAYER_HEIGHT = 14

const VASE_WIDTHS = [
  64, // 01 podstawa
  66, // 02
  70, // 03 rozszerzenie
  76, // 04
  82, // 05
  86, // 06 brzuch
  84, // 07
  78, // 08
  70, // 09 zwężenie szyjki
  62, // 10
  58, // 11 talia
  56, // 12
  58, // 13 rozchylenie
  64, // 14
  72, // 15 kołnierz
  78, // 16
  82, // 17
  84, // 18 wieniec górny
]

const stateOf = (i: number, l: number) =>
  l >= TOTAL_LAYERS ? 'cool' : i + 1 > l ? 'future' : i + 1 === l ? 'hot' : i + 1 >= l - 2 ? 'warm' : 'cool'

export function HeroVasePrint({
  material,
  layerHeight,
}: {
  material?: string
  layerHeight?: string
}) {
  const [layer, setLayer] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [run, setRun] = useState(0)

  const cardRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setLayer(TOTAL_LAYERS)
      setIsCompleted(true)
      return
    }

    setLayer(0)
    setIsCompleted(false)

    let raf = 0
    let elapsed = 0
    let last = performance.now()
    let shown = 0
    let visible = true

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
      },
      { threshold: 0.15 }
    )

    if (cardRef.current) io.observe(cardRef.current)

    const tick = (now: number) => {
      const dt = now - last
      last = now

      if (visible && !document.hidden) {
        elapsed += dt
      }

      const l = Math.min(TOTAL_LAYERS, Math.floor(elapsed / LAYER_MS))
      if (l !== shown) {
        shown = l
        setLayer(l)
        if (l >= TOTAL_LAYERS) {
          setIsCompleted(true)
        }
      }

      const activeIdx = Math.min(l, TOTAL_LAYERS - 1)
      const half = (VASE_WIDTHS[activeIdx] * 1.5) / 2
      const offset = Math.sin((elapsed / 1000) * 5.5) * half
      headRef.current?.setAttribute('transform', `translate(${offset.toFixed(1)} 0)`)

      if (l < TOTAL_LAYERS) {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
    }
  }, [run])

  const restart = () => {
    setRun((r) => r + 1)
  }

  const activeY = BASE_Y - Math.max(0, layer - 1) * LAYER_HEIGHT

  return (
    <div ref={cardRef} className="vase-printer-card corner-frame">
      <div className="vase-printer-header mono">
        <div className="vase-status-indicator">
          <span className={`status-led ${isCompleted ? 'status-led-done' : 'status-led-active'}`} />
          <span>{isCompleted ? 'SYMULACJA: GOTOWE' : 'SYMULACJA DRUKU FDM'}</span>
        </div>
        <div className="vase-layer-counter">
          WARSTWA {String(layer).padStart(2, '0')}/{TOTAL_LAYERS}
        </div>
      </div>

      <div className="vase-canvas-wrapper">
        <svg
          viewBox="0 0 500 440"
          className="vase-svg"
          role="img"
          aria-label="Animowany proces drukowania wazonu warstwa po warstwie"
        >
          <defs>
            <pattern id="vase-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E3DFD5" strokeWidth="0.8" opacity="0.65" />
            </pattern>
            <linearGradient id="glow-layer" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#C2410C" />
              <stop offset="50%" stopColor="#FF8A5B" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
          </defs>

          {/* Tło siatki współrzędnych */}
          <rect width="500" height="440" fill="url(#vase-grid)" />

          {/* Podłoże robocze drukarki (stół grzejny) */}
          <g className="vase-build-plate" stroke="#17191A" strokeWidth="1.5">
            <line x1="80" y1="384" x2="420" y2="384" />
            <line x1="80" y1="388" x2="420" y2="388" strokeDasharray="3 4" strokeWidth="1" stroke="#B0ACA0" />
            <text x="250" y="405" textAnchor="middle" fill="#8C887B" fontFamily="monospace" fontSize="9" letterSpacing="2">
              POLE ROBOCZE 340 × 320 MM · H 325 MM
            </text>
          </g>

          {/* Warstwy wazonu z profilowanym stygnięciem */}
          <g className="vase-layers">
            {VASE_WIDTHS.map((widthUnits, idx) => {
              const st = stateOf(idx, layer)
              const yPos = BASE_Y - idx * LAYER_HEIGHT
              const layerWidth = widthUnits * 3

              return (
                <g key={idx} className="vase-layer" data-state={st}>
                  <rect
                    x={250 - layerWidth / 2}
                    y={yPos}
                    width={layerWidth}
                    height={LAYER_HEIGHT - 2}
                    rx="4"
                    fill={st === 'hot' ? '#FF8A5B' : st === 'warm' ? '#C2410C' : '#17191A'}
                    stroke={st === 'hot' || st === 'warm' ? '#C2410C' : '#2D2C28'}
                    strokeWidth="1.2"
                    style={{
                      transition: 'fill 0.8s ease-out, stroke 0.8s ease-out, opacity 0.2s ease',
                      opacity: st === 'future' ? 0 : 1,
                      transform: st === 'future' ? 'scaleX(0.7)' : 'scaleX(1)',
                      transformOrigin: '250px center',
                    }}
                  />
                  {st !== 'future' && (
                    <line
                      x1={250 - layerWidth / 2 + 6}
                      y1={yPos + (LAYER_HEIGHT - 2) / 2}
                      x2={250 + layerWidth / 2 - 6}
                      y2={yPos + (LAYER_HEIGHT - 2) / 2}
                      stroke={st === 'hot' ? '#FFE4D6' : '#3E3C36'}
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                  )}
                </g>
              )
            })}
          </g>

          {/* Głowica ekstrudera sterowana bezpośrednio przez ref */}
          {!isCompleted && layer > 0 && layer <= TOTAL_LAYERS && (
            <g ref={headRef} className="vase-extruder-head">
              {/* Oś pozioma X */}
              <line x1="40" y1={activeY - 14} x2="460" y2={activeY - 14} stroke="#C7C3B7" strokeWidth="2" strokeDasharray="6 4" />
              {/* Blok grzejny ekstrudera */}
              <rect x={238} y={activeY - 32} width="24" height="18" rx="2" fill="#1C1B19" stroke="#17191A" strokeWidth="1.5" />
              {/* Dysza mosiężna */}
              <polygon points={`246,${activeY - 14} 254,${activeY - 14} 250,${activeY - 2}`} fill="#C2410C" stroke="#9A3412" strokeWidth="1" />
              {/* Ślad gorącego filamentu */}
              <circle cx="250" cy={activeY} r="3" fill="#FF8A5B" className="filament-sparkle" />
            </g>
          )}

          {/* Linie wymiarowe — wysokość wazonu (po prawej) */}
          <g className="vase-dimension-height" stroke="#17191A" strokeWidth="1.2">
            <line x1="435" y1={BASE_Y + LAYER_HEIGHT - 2} x2="455" y2={BASE_Y + LAYER_HEIGHT - 2} />
            <line x1="435" y1={BASE_Y - 17 * LAYER_HEIGHT} x2="455" y2={BASE_Y - 17 * LAYER_HEIGHT} />
            <line x1="445" y1={BASE_Y + LAYER_HEIGHT - 2} x2="445" y2={BASE_Y - 17 * LAYER_HEIGHT} stroke="#17191A" />
            <polygon points="445,382 442,374 448,374" fill="#17191A" />
            <polygon points={`445,${BASE_Y - 17 * LAYER_HEIGHT} 442,${BASE_Y - 17 * LAYER_HEIGHT + 8} 448,${BASE_Y - 17 * LAYER_HEIGHT + 8}`} fill="#17191A" />
            <text
              x="456"
              y={BASE_Y - 8 * LAYER_HEIGHT}
              fill="#5B605C"
              fontFamily="monospace"
              fontSize="10"
              fontWeight="600"
              transform={`rotate(90 456 ${BASE_Y - 8 * LAYER_HEIGHT})`}
              textAnchor="middle"
            >
              MODEL POGLĄDOWY
            </text>
          </g>

          {/* Linia wymiarowa — szerokość średnicy wazonu (na dole) */}
          <g className="vase-dimension-width" stroke="#5B605C" strokeWidth="1">
            <line x1="124" y1="416" x2="124" y2="428" />
            <line x1="376" y1="416" x2="376" y2="428" />
            <line x1="124" y1="424" x2="376" y2="424" stroke="#5B605C" />
            <polygon points="124,424 130,421 130,427" fill="#5B605C" />
            <polygon points="376,424 370,421 370,427" fill="#5B605C" />
            <text x="250" y="435" fill="#5B605C" fontFamily="monospace" fontSize="9" textAnchor="middle">
              SYMULACJA — BEZ SKALI
            </text>
          </g>
        </svg>
      </div>

      {/* Dolny pasek parametrów wydruku */}
      <div className="vase-printer-footer mono">
        <div className="vase-tags">
          {material && <span className="tag-pill tag-pill-dark">{material}</span>}
          {layerHeight && <span className="tag-pill">{layerHeight}</span>}
          <span className="tag-pill">DRUK WARSTWOWY FDM</span>
        </div>
        <button
          type="button"
          className="vase-restart-btn"
          onClick={restart}
          aria-label="Uruchom ponownie animację drukowania"
        >
          <RotateCcw size={12} />
          <span>Powtórz proces</span>
        </button>
      </div>
    </div>
  )
}
