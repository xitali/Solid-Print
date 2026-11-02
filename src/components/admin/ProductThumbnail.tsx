'use client'
import {useEffect,useState} from 'react'
type Image={id?:number;url?:string;alt?:string}
export function ProductThumbnail({rowData}:{rowData?:{title?:string;images?:{image?:number|Image}[]}}){
  const image=rowData?.images?.[0]?.image
  const id=typeof image==='number'?image:image?.id
  const [loaded,setLoaded]=useState<Image|null>(typeof image==='object'?image:null)
  useEffect(()=>{
    if(!id)return
    const controller=new AbortController()
    fetch(`/api/media/${id}`,{signal:controller.signal}).then(r=>r.ok?r.json():null).then(data=>{if(!controller.signal.aborted)setLoaded(data)}).catch(()=>{})
    return()=>controller.abort()
  },[id])
  return loaded?.url?<img src={loaded.url} alt={loaded.alt||rowData?.title||'Produkt'} width={64} height={48} loading="lazy" decoding="async" style={{objectFit:'cover',borderRadius:4}}/>:<span>Brak zdjęcia</span>
}
