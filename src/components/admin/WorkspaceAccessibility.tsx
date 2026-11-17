'use client'

import { useEffect, type ReactNode } from 'react'

// The Payload table and select widgets are also mounted in drawers and after client navigation.
export function WorkspaceAccessibility({ children }: { children: ReactNode }) {
  useEffect(() => {
    let frame = 0
    function annotate() {
      document.querySelectorAll<HTMLInputElement>('.table input[type="checkbox"][aria-label=""]').forEach((input) => {
        const row = input.closest('tr')
        const title = row?.querySelector('td a')?.textContent?.trim()
        input.setAttribute('aria-label', input.closest('th') ? 'Zaznacz wszystkie rekordy' : title ? `Zaznacz ${title}` : 'Zaznacz rekord')
      })
      document.querySelectorAll('.doc-controls__popup .popup-button:not([aria-label])').forEach((button) => {
        button.setAttribute('aria-label', 'Więcej działań dla rekordu')
      })
      document.querySelectorAll('.react-select :is(.clear-indicator,.dropdown-indicator)[aria-hidden="true"]').forEach((item) => {
        item.setAttribute('tabindex', '-1')
      })
      document.querySelectorAll<HTMLInputElement>('.react-select input.rs__input').forEach((input) => {
        if (input.getAttribute('aria-label') || input.getAttribute('aria-labelledby') || input.labels?.length) return
        const field = input.closest('.field-type')?.querySelector('label')?.textContent?.trim()
        if (field) input.setAttribute('aria-label', field)
      })
      document.querySelectorAll('ul.doc-tabs__tabs').forEach((tabs) => tabs.setAttribute('role', 'presentation'))
    }
    function schedule() {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(annotate)
    }
    const observer = new MutationObserver(schedule)
    observer.observe(document.body, { childList: true, subtree: true })
    annotate()
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [])

  return children
}
