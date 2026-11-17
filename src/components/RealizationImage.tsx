'use client'

import { useState } from 'react'
import { ImageOff } from 'lucide-react'

export function RealizationImage({ src, fallbackSrc, alt }: { src?: string; fallbackSrc?: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const showFallback = () => setCurrentSrc(currentSrc === fallbackSrc ? undefined : fallbackSrc)

  return (
    <div className="realization-image">
      {currentSrc ? (
        // CMS media is served directly by R2 on Cloudflare.
        <img key={currentSrc} src={currentSrc} alt={alt} loading="lazy" decoding="async"
          ref={(element) => { if (element?.complete && element.naturalWidth === 0) showFallback() }}
          onError={showFallback} />
      ) : <ImageOff size={28} aria-hidden="true" />}
    </div>
  )
}
