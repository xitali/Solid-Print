'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

const targets = 'main .section-title-row, main .path-card, main .product-card, main .process-step, main .application-card, main .workshop-grid, main .service-card, main .material-card, main .article-card, main .realization-card, main .contact-form-card, main .empty-state, .layer-reveal, .card-thumb, .product-visual'

export function RevealEffects(){
  const pathname=usePathname()
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    if(media.matches||!('IntersectionObserver' in window))return
    const main=document.querySelector('main')
    if(!main)return
    const observed=new WeakSet<Element>()
    const animated=new Set<Element>()
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue
        if(!media.matches){
          entry.target.classList.add('sp-reveal', 'is-in')
          animated.add(entry.target)
        }
        observer.unobserve(entry.target)
      }
    },{threshold:.1})
    function register(){
      document.querySelectorAll<HTMLElement>(targets).forEach(element=>{
        if(observed.has(element))return
        observed.add(element)
        const siblings=element.parentElement?.children
        const index=siblings?Array.from(siblings).indexOf(element):0
        element.style.setProperty('--reveal-delay',`${Math.min(index,3)*90}ms`)
        observer.observe(element)
      })
    }
    register()
    // Next streams page content and can replace filtered cards without remounting the layout.
    const mutations=new MutationObserver(register)
    mutations.observe(main,{childList:true,subtree:true})
    return()=>{observer.disconnect();mutations.disconnect();for(const element of animated)element.classList.remove('sp-reveal')}
  },[pathname])
  return null
}
