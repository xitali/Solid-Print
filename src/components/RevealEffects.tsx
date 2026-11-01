'use client'
import {useEffect} from 'react'
import {usePathname} from 'next/navigation'

// Web Animations do not mutate streamed HTML attributes before React hydrates them.
const targets='main .section-title-row, main .path-card, main .product-card, main .process-step, main .process-grid, main .application-card, main .workshop-grid, main .service-card, main .material-card, main .article-card, main .realization-card, main .contact-form-card, main .empty-state, main .product-visual'
export function RevealEffects(){
  const pathname=usePathname()
  useEffect(()=>{
    const media=matchMedia('(prefers-reduced-motion: reduce)')
    if(!('IntersectionObserver' in window))return
    const main=document.querySelector('main')
    if(!main)return
    const seen=new WeakSet<Element>(), animations=new Set<Animation>()
    const play=(element:Element,frames:Keyframe[],options:KeyframeAnimationOptions)=>{
      if(media.matches)return
      const animation=element.animate(frames,options)
      animations.add(animation)
      animation.onfinish=()=>{animation.cancel();animations.delete(animation)}
    }
    const observer=new IntersectionObserver(entries=>{
      for(const entry of entries){
        if(!entry.isIntersecting)continue
        const element=entry.target
        if(element.matches('.process-grid')){
          try{play(element,[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1100,easing:'ease-out',pseudoElement:'::before'})}catch{}
        }else{
          play(element,[{opacity:0,transform:'translateY(18px)'},{opacity:1,transform:'none'}],{duration:500,easing:'cubic-bezier(.22,1,.36,1)'})
        }
        const image=element.matches('.product-visual,.realization-card')?element.querySelector('img'):null
        if(image)play(image,[{clipPath:'inset(100% 0 0)'},{clipPath:'inset(0 0 0)'}],{duration:1100,easing:'steps(14,end)'})
        observer.unobserve(element)
      }
    },{threshold:.1})
    const register=()=>main.querySelectorAll(targets).forEach(element=>{if(!seen.has(element)){seen.add(element);observer.observe(element)}})
    register()
    const mutations=new MutationObserver(register)
    mutations.observe(main,{childList:true,subtree:true})
    const hero=main.querySelector('.hero'),backdrop=hero?.querySelector('.hero-drifting-lines')
    const fine=matchMedia('(hover: hover) and (pointer: fine)')
    let parallax:Animation|undefined,last='translate(0px,0px)'
    const follow=(event:Event)=>{
      if(!hero||!backdrop||media.matches||!fine.matches||document.hidden)return
      const e=event as PointerEvent,r=hero.getBoundingClientRect()
      const next=`translate(${((e.clientX-r.left)/r.width-.5)*16}px,${((e.clientY-r.top)/r.height-.5)*16}px)`
      parallax?.cancel();parallax=backdrop.animate([{transform:last},{transform:next}],{duration:160,fill:'forwards'});last=next
    }
    const reset=()=>{parallax?.cancel();last='translate(0px,0px)'}
    const reduce=()=>{if(media.matches){for(const a of animations)a.cancel();animations.clear();reset()}}
    media.addEventListener('change',reduce)
    hero?.addEventListener('pointermove',follow,{passive:true});hero?.addEventListener('pointerleave',reset)
    return()=>{observer.disconnect();mutations.disconnect();for(const a of animations)a.cancel();reset();media.removeEventListener('change',reduce);hero?.removeEventListener('pointermove',follow);hero?.removeEventListener('pointerleave',reset)}
  },[pathname])
  return null
}
