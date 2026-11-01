'use client'

import { useEffect, useState, useRef } from 'react'
import { Play, RotateCcw } from 'lucide-react'

/*
 * Hero — animowany pierwszy ekran (Plansza 03 + opis):
 * - Wazon drukuje się warstwa po warstwie (18 warstw).
 * - Głowica jeździ na boki (oś X) i podnosi się o 1 warstwę (oś Z).
 * - Licznik: „WARSTWA XX/18”.
 * - Linia wymiarowa i techniczne narożniki rysunkowe.
 * - Aktywna warstwa świeci w pomarańczu (#C2410C).
 */

const TOTAL_LAYERS = 18

// Szerokości 18 warstw wazonu (od dołu y=0 do góry y=17) modelujące profil kielicha/wazonu
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

export function HeroVasePrint() {
  const [currentLayer, setCurrentLayer] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [headX, setHeadX] = useState(250) // center
  const animRef = useRef<number | null>(null)

  useEffect(() => {
    // Sprawdzenie prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrentLayer(TOTAL_LAYERS)
      setIsCompleted(true)
      setIsPlaying(false)
      return
    }

    if (!isPlaying) return

    let layer = currentLayer
    let sweepPhase = 0
    let lastTime = performance.now()

    const interval = setInterval(() => {
      if (layer < TOTAL_LAYERS) {
        layer += 1
        setCurrentLayer(layer)
        setIsCompleted(false)
      } else {
        setIsCompleted(true)
        clearInterval(interval)
        setIsPlaying(false)
        if (animRef.current) cancelAnimationFrame(animRef.current)
      }
    }, 240)

    // Płynny ruch głowicy ekstrudera w osi X
    const animateHead = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time
      sweepPhase += dt * 5.5

      // Oblicz szerokość obecnej warstwy
      const activeIdx = Math.min(layer, TOTAL_LAYERS - 1)
      const w = VASE_WIDTHS[activeIdx] || 70
      const currentSpan = w * 1.5
      const newX = 250 + Math.sin(sweepPhase) * (currentSpan / 2)
      setHeadX(newX)

      animRef.current = requestAnimationFrame(animateHead)
    }
    animRef.current = requestAnimationFrame(animateHead)

    return () => {
      clearInterval(interval)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [isPlaying])

  const restart = () => {
    setCurrentLayer(0)
    setIsCompleted(false)
    setIsPlaying(true)
  }

  // Pozycje pionowe warstw (współrzędne SVG)
  // Wazon zaczyna się od dołu: y=380, każda warstwa ma 14 px wysokości
  const BASE_Y = 370
  const LAYER_HEIGHT = 14
  const activeY = BASE_Y - (currentLayer - 1) * LAYER_HEIGHT

  return (
    <div className="vase-printer-card corner-frame">
      <div className="vase-printer-header mono">
        <div className="vase-status-indicator">
          <span className={`status-led ${isCompleted ? 'status-led-done' : 'status-led-active'}`} />
          <span>{isCompleted ? 'SYMULACJA: GOTOWE' : 'SYMULACJA DRUKU FDM'}</span>
        </div>
        <div className="vase-layer-counter">
          WARSTWA {String(currentLayer).padStart(2, '0')}/{TOTAL_LAYERS}
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
            {/* Siatka techniczna */}
            <pattern id="vase-grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#E3DFD5" strokeWidth="0.8" opacity="0.65" />
            </pattern>
            {/* Gradient głowicy */}
            <linearGradient id="nozzle-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1C1B19" />
              <stop offset="70%" stopColor="#2E2C28" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>
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
              STÓŁ ROBOCZY 220 × 220 MM · 60°C
            </text>
          </g>

          {/* Warstwy wazonu drukowane od dołu do góry */}
          <g className="vase-layers">
            {VASE_WIDTHS.map((widthUnits, idx) => {
              const layerNum = idx + 1
              const isLayerVisible = currentLayer >= layerNum
              const isCurrentActive = currentLayer === layerNum && !isCompleted
              const yPos = BASE_Y - idx * LAYER_HEIGHT
              const layerWidth = widthUnits * 3

              if (!isLayerVisible) return null

              return (
                <g key={idx} className={`vase-layer-row ${isCurrentActive ? 'layer-printing' : ''}`}>
                  {/* Płaska warstwa drukowana */}
                  <rect
                    x={250 - layerWidth / 2}
                    y={yPos}
                    width={layerWidth}
                    height={LAYER_HEIGHT - 2}
                    rx="4"
                    fill={isCurrentActive ? 'url(#glow-layer)' : '#17191A'}
                    stroke={isCurrentActive ? '#C2410C' : '#2D2C28'}
                    strokeWidth="1.2"
                  />
                  {/* Wewnętrzny prążek warstwy FDM */}
                  <line
                    x1={250 - layerWidth / 2 + 6}
                    y1={yPos + (LAYER_HEIGHT - 2) / 2}
                    x2={250 + layerWidth / 2 - 6}
                    y2={yPos + (LAYER_HEIGHT - 2) / 2}
                    stroke={isCurrentActive ? '#FFE4D6' : '#3E3C36'}
                    strokeWidth="1"
                    strokeDasharray="4 2"
                  />
                </g>
              )
            })}
          </g>

          {/* Głowica ekstrudera (widoczna podczas drukowania) */}
          {!isCompleted && currentLayer > 0 && currentLayer <= TOTAL_LAYERS && (
            <g className="vase-extruder-head" style={{ transform: `translate(${headX - 250}px, 0)` }}>
              {/* Oś pozioma X */}
              <line x1="40" y1={activeY - 14} x2="460" y2={activeY - 14} stroke="#C7C3B7" strokeWidth="2" strokeDasharray="6 4" />
              {/* Blok grzejny ekstrudera */}
              <rect x={238} y={activeY - 32} width="24" height="18" rx="2" fill="#1C1B19" stroke="#17191A" strokeWidth="1.5" />
              {/* Dysza mosiężna */}
              <polygon points={`246,${activeY - 14} 254,${activeY - 14} 250,${activeY - 2}`} fill="#C2410C" stroke="#9A3412" strokeWidth="1" />
              {/* Ślad gorącego filamentu */}
              <circle cx="250" cy={activeY} r="3" fill="#C2410C" className="filament-sparkle" />
            </g>
          )}

          {/* Linie wymiarowe — wysokość wazonu (po prawej) */}
          <g className="vase-dimension-height" stroke="#17191A" strokeWidth="1.2">
            <line x1="435" y1={BASE_Y + LAYER_HEIGHT - 2} x2="455" y2={BASE_Y + LAYER_HEIGHT - 2} />
            <line x1="435" y1={BASE_Y - 17 * LAYER_HEIGHT} x2="455" y2={BASE_Y - 17 * LAYER_HEIGHT} />
            <line x1="445" y1={BASE_Y + LAYER_HEIGHT - 2} x2="445" y2={BASE_Y - 17 * LAYER_HEIGHT} stroke="#17191A" />
            {/* Strzałki wymiaru */}
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
              H: 140 MM
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
              Ø: 85 MM (MAX)
            </text>
          </g>
        </svg>
      </div>

      {/* Dolny pasek parametrów wydruku (Karta techniczna z PDF) */}
      <div className="vase-printer-footer mono">
        <div className="vase-tags">
          <span className="tag-pill tag-pill-dark">PETG</span>
          <span className="tag-pill">0.20 MM</span>
          <span className="tag-pill">DYSZA 0.4</span>
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
