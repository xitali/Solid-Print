'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, Phone, Search, X } from 'lucide-react'
import { Brand } from './Brand'

const navigation = [
  ['Usługi', '/uslugi'], ['Gotowe projekty', '/projekty'], ['Materiały', '/materialy'],
  ['O pracowni', '/o-pracowni'], ['Kontakt', '/kontakt'],
] as const

export function Header({ phone }: { phone?: string }) {
  const [open, setOpen] = useState(false)
  const toggle = useRef<HTMLButtonElement>(null)
  const path = usePathname()
  const isQuote = path === '/wycena'
  const isProduct = path.startsWith('/projekty/')
  const phoneHref = phone ? `tel:${phone.replace(/[^+\d]/g, '')}` : undefined

  useEffect(() => {
    if (!open) return
    function escape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus()
    }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [open])

  return (
    <>
      <header className="site-header">
        <div className="container header-inner">
          <Brand />
          <nav aria-label="Menu główne" className="desktop-nav">
            {navigation.map(([label, href]) => <Link key={href} href={href} aria-current={path === href ? 'page' : undefined}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            {phoneHref && <a className="header-phone" href={phoneHref} aria-label={`Zadzwoń: ${phone}`}><Phone size={17} /><span>{phone}</span></a>}
            <Link className="header-search" href="/szukaj" aria-label="Szukaj na stronie"><Search size={20} aria-hidden="true" /></Link>
            {!isQuote && <Link className="button button-small" href="/wycena">Wyceń projekt <ArrowUpRight size={17} /></Link>}
            <button ref={toggle} className="menu-toggle" onClick={() => setOpen(!open)} aria-expanded={open}
              aria-controls="mobile-nav" aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}>{open ? <X /> : <Menu />}</button>
          </div>
        </div>
        <nav id="mobile-nav" className="mobile-nav" aria-label="Menu mobilne" hidden={!open}>
          {[...navigation, ['Szukaj na stronie', '/szukaj']].map(([label, href]) => (
            <Link href={href} key={href} aria-current={path === href ? 'page' : undefined} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={18} /></Link>
          ))}
        </nav>
      </header>
      {!isQuote && <div className="mobile-contact-bar">
        {phoneHref ? <a href={phoneHref}><Phone size={17} /> Zadzwoń</a> : <Link href="/kontakt">Kontakt <ArrowUpRight size={17} /></Link>}
        {isProduct
          ? <a className="mobile-quote" href="#zamowienie">Przejdź do zamówienia <ArrowUpRight size={15} /></a>
          : <Link className="mobile-quote" href="/wycena">Wyceń projekt <ArrowUpRight size={17} /></Link>}
      </div>}
    </>
  )
}
