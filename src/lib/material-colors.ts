import type { Material } from './types'

const knownColors: Record<string, string> = {
  biały: '#F8F8F6', biała: '#F8F8F6', czarny: '#171717', czarna: '#171717',
  szary: '#858585', szara: '#858585', czerwony: '#C52C37', czerwona: '#C52C37',
  niebieski: '#275DA9', niebieska: '#275DA9', zielony: '#36844C', zielona: '#36844C',
  żółty: '#F2CB30', żółta: '#F2CB30', pomarańczowy: '#E87927', pomarańczowa: '#E87927',
  różowy: '#DB78A7', różowa: '#DB78A7', fioletowy: '#7954A0', fioletowa: '#7954A0',
  brązowy: '#865A40', brązowa: '#865A40', beżowy: '#D8BF9F', beżowa: '#D8BF9F',
  granatowy: '#23385E', granatowa: '#23385E',
}

export function inferredColorSamples(colors?: string | null, description?: string | null) {
  const list = colors?.trim() || description?.match(/^\s*(?:dostępne )?kolory\s*:\s*([^\r\n]+)/im)?.[1]
  if (!list) return []

  const samples = new Map<string, { name: string; hex: string }>()
  for (const item of list.split(/[,;\n]|\s+i\s+/i)) {
    const name = item.trim().replace(/\.$/, '')
    const key = name.toLocaleLowerCase('pl-PL')
    if (Object.hasOwn(knownColors, key) && !samples.has(key)) {
      samples.set(key, { name: name[0].toLocaleUpperCase('pl-PL') + name.slice(1), hex: knownColors[key] })
    }
  }
  return [...samples.values()]
}

export function materialColorSamples(material: Pick<Material, 'colors' | 'description' | 'colorSamples'>): NonNullable<Material['colorSamples']> {
  return material.colorSamples?.length ? material.colorSamples : inferredColorSamples(material.colors, material.description)
}
