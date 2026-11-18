import { expect, test } from 'vitest'
import { inferredColorSamples, materialColorSamples } from '../src/lib/material-colors'

test('odczytuje tylko rozpoznane nazwy i usuwa powtórzenia', () => {
  expect(inferredColorSamples('Czarny, biały i CZARNY; zależnie od dostawcy; constructor').map(({ name }) => name))
    .toEqual(['Czarny', 'Biały'])
})

test('czyta kolory z odpowiedniej linii opisu i zachowuje próbki właściciela', () => {
  const description = 'Techniczny filament.\nDostępne kolory: czerwony, szary\nDostawa po uzgodnieniu.'
  expect(materialColorSamples({ description })).toHaveLength(2)
  expect(materialColorSamples({ description, colorSamples: [{ name: 'Indygo', hex: '#3F417E' }] }))
    .toEqual([{ name: 'Indygo', hex: '#3F417E' }])
  expect(inferredColorSamples(null, 'Czerwony wzornik nie jest dostępny.')).toEqual([])
})
