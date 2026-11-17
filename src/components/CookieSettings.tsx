'use client'

import { useRef, useState } from 'react'
import { Modal } from './Modal'

export function CookieSettings() {
  const [open, setOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const close = () => setOpen(false)

  return (
    <>
      <button ref={trigger} className="text-button" onClick={() => setOpen(true)}>Ustawienia cookies</button>
      {open && <Modal label="Twoja prywatność" onClose={close} returnFocus={trigger}>
        <section className="settings-dialog">
          <h2>Twoja prywatność</h2>
          <p>Panel właściciela używa niezbędnego pliku cookie do logowania. Modele przetwarzamy w podglądzie na Twoim urządzeniu, a załączniki przesyłamy po wysłaniu zapytania.</p>
          <a href="/cookies">Informacje o cookies</a>
          <button className="button" autoFocus onClick={close}>Zamknij</button>
        </section>
      </Modal>}
    </>
  )
}
