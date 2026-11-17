'use client'
import { useEffect, useRef, type RefObject } from 'react'
export function Modal({children,onClose,label,className='',returnFocus}:{children:React.ReactNode;onClose:()=>void;label:string;className?:string;returnFocus?:RefObject<HTMLElement | null>}){
  const ref=useRef<HTMLDialogElement>(null)
  useEffect(()=>{
    const dialog=ref.current
    const trigger=returnFocus?.current ?? document.activeElement
    const previous=document.body.style.overflow
    dialog?.showModal()
    document.body.style.overflow='hidden'
    return()=>{
      dialog?.close()
      document.body.style.overflow=previous
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true })
    }
  },[returnFocus])
  return <dialog ref={ref} className={`native-modal ${className}`} aria-label={label} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===ref.current)onClose()}}>{children}</dialog>
}
