'use client'
import { useEffect,useRef } from 'react'
export function Modal({children,onClose,label,className=''}:{children:React.ReactNode;onClose:()=>void;label:string;className?:string}){
  const ref=useRef<HTMLDialogElement>(null)
  useEffect(()=>{const d=ref.current;d?.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{d?.close();document.body.style.overflow=previous}},[])
  return <dialog ref={ref} className={`native-modal ${className}`} aria-label={label} onCancel={e=>{e.preventDefault();onClose()}} onClick={e=>{if(e.target===ref.current)onClose()}}>{children}</dialog>
}
