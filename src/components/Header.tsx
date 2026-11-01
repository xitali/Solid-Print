'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowUpRight, Menu, X, Phone } from 'lucide-react'
import { Brand } from './Brand'
export function Header({phone}:{phone?:string}){
  const [open,setOpen]=useState(false);const path=usePathname()
  const nav=[['Usługi','/uslugi'],['Gotowe projekty','/projekty'],['Materiały','/materialy'],['O pracowni','/o-pracowni'],['Kontakt','/kontakt']]
  return <><header className="site-header"><div className="container header-inner"><Brand/><nav aria-label="Menu główne" className="desktop-nav">{nav.map(([label,href])=><Link key={href} href={href} aria-current={path===href?'page':undefined}>{label}</Link>)}</nav><div className="header-actions">{phone&&<a className="header-phone" href={`tel:${phone.replace(/[^+\d]/g,'')}`} aria-label={`Zadzwoń: ${phone}`}><Phone size={17}/><span>{phone}</span></a>}<Link className="button button-small" href="/wycena">Wyceń projekt <ArrowUpRight size={17}/></Link><button className="menu-toggle" onClick={()=>setOpen(!open)} aria-expanded={open} aria-controls="mobile-nav" aria-label={open?'Zamknij menu':'Otwórz menu'}>{open?<X/>:<Menu/>}</button></div></div>{open&&<nav id="mobile-nav" className="mobile-nav" aria-label="Menu mobilne">{nav.map(([label,href])=><Link href={href} key={href} onClick={()=>setOpen(false)}>{label}<ArrowUpRight size={18}/></Link>)}</nav>}</header><div className="mobile-contact-bar">{phone?<a href={`tel:${phone.replace(/[^+\d]/g,'')}`}><Phone size={17}/> Zadzwoń</a>:<Link href="/kontakt">Kontakt <ArrowUpRight size={17}/></Link>}<Link className="mobile-quote" href="/wycena">Wyceń projekt <ArrowUpRight size={17}/></Link></div></>
}
