import Image from 'next/image'
import Link from 'next/link'
import type { Material } from '@/lib/types'

export function materialQuoteHref(material: Material, color?: string) {
  const query = new URLSearchParams({ type: 'design' })
  if (material.available) {
    query.set('material', material.slug)
    if (color) query.set('color', color)
  }
  return `/wycena?${query}`
}

export function MaterialOptions({ material }: { material: Material }) {
  const { colors, colorSamples, glassFiber, carbonFiber } = material
  const reinforcements = [glassFiber && 'Włókno szklane (GF)', carbonFiber && 'Włókno węglowe (CF)'].filter(Boolean)

  return (
    <>
      {(colors || !!colorSamples?.length) && (
        <div>
          <dt>Dostępne kolory</dt>
          <dd>
            {colors}
            {!!colorSamples?.length && (
              <ul className="material-samples">
                {colorSamples.map(({ id, name, image, hex }, index) => {
                  const photo = typeof image === 'object' ? image : null
                  const swatch = photo?.url ? (
                    <Image className="material-sample" src={photo.url} alt="" width={40} height={40} unoptimized />
                  ) : hex && /^#[0-9a-f]{6}$/i.test(hex) ? (
                    <span className="material-sample" style={{ backgroundColor: hex }} aria-hidden="true" />
                  ) : null
                  return (
                    <li key={id ?? index}>
                      {material.available ? (
                        <Link className="material-sample-link" href={materialQuoteHref(material, name)} prefetch={false}
                          aria-label={`Wyceń ${material.title}, kolor ${name}`}>
                          {swatch}<span>{name}</span>
                        </Link>
                      ) : <>{swatch}<span>{name}</span></>}
                    </li>
                  )
                })}
              </ul>
            )}
          </dd>
        </div>
      )}
      {!!reinforcements.length && (
        <div>
          <dt>Warianty wzmacniane włóknem</dt>
          <dd>{reinforcements.join(', ')}</dd>
        </div>
      )}
    </>
  )
}
