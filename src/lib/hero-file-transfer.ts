// Przekazywanie wybranego pliku z Hero na stronie głównej do formularza wyceny (/wycena)
// Plik zostaje wyłącznie w pamięci przeglądarki (obiekt File), bez natychmiastowej wysyłki na serwer.

let pendingHeroFile: File | null = null

export function setPendingHeroFile(file: File | null) {
  pendingHeroFile = file
}

export function getPendingHeroFile(): File | null {
  return pendingHeroFile
}

export function consumePendingHeroFile(): File | null {
  const f = pendingHeroFile
  pendingHeroFile = null
  return f
}
