import Image from 'next/image'
import type { Material } from '@/lib/types'

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
                  return (
                    <li key={id ?? index}>
                      {photo?.url ? (
                        <Image className="material-sample" src={photo.url} alt="" width={40} height={40} unoptimized />
                      ) : hex && /^#[0-9a-f]{6}$/i.test(hex) ? (
                        <span className="material-sample" style={{ backgroundColor: hex }} aria-hidden="true" />
                      ) : null}
                      <span>{name}</span>
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
