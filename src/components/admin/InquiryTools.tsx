'use client'
import {useState} from 'react'
import {useDocumentInfo,useFormFields} from '@payloadcms/ui'
export function InquiryTools(){
  const {id}=useDocumentInfo()
  const number=useFormFields(([fields])=>fields.number?.value)
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('')
  async function anonymize(){
    if(!window.confirm(`Usunąć dane osobowe, opis, notatki, pocztę i załączniki zapytania ${number}? Numer pozostanie. Tej operacji nie można cofnąć w panelu.`))return
    setBusy(true)
    try{
      const response=await fetch(`/api/inquiry-tools/${id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'anonymize',confirmNumber:number})})
      const result=await response.json()
      if(!response.ok)throw new Error(result.error||'Nie udało się usunąć danych.')
      window.location.reload()
    }catch(e){setMessage(e instanceof Error?e.message:'Błąd operacji.');setBusy(false)}
  }
  if(!id)return null
  return <section className="sp-admin-notice"><h3>Dane klienta</h3><p><a href={`/api/inquiry-tools/${id}`}>Eksportuj zapytanie (JSON)</a></p>
    <p>Kopie mogą zachować wcześniejsze dane do końca okresu przechowywania. Numer sprawy zostaje w bazie.</p>
    <button type="button" disabled={busy} onClick={anonymize}>{busy?'Usuwanie danych…':'Usuń dane osobowe i załączniki'}</button>
    {message&&<p role="alert">{message}</p>}
  </section>
}
