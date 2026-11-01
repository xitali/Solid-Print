'use client'
import { useEffect, useRef } from 'react'
import { TextField, useField, useFormFields } from '@payloadcms/ui'
import type { TextFieldClientComponent } from 'payload'
import { slugify } from '@/lib/slug'

export const SlugField:TextFieldClientComponent = props => {
  const {value,setValue}=useField<string>({path:props.path})
  const title=useFormFields(([fields])=>fields.title?.value)
  const generated=useRef('')
  useEffect(()=>{
    if(typeof title==='string' && (!value||value===generated.current)){
      const next=slugify(title)
      generated.current=next
      if(next!==value)setValue(next)
    }
  },[title,value,setValue])
  return <TextField {...props}/>
}
