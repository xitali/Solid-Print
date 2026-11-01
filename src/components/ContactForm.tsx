'use client'
import { useState,useRef } from 'react'
import { ArrowUpRight,CheckCircle2 } from 'lucide-react'
import { sendInquiry,type SubmissionState } from '@/lib/submission'
export function ContactForm(){
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[number,setNumber]=useState('')
  const state=useRef<SubmissionState|null>(null)
  async function submit(event:React.FormEvent<HTMLFormElement>){event.preventDefault();if(busy)return;setBusy(true);setError('');const form=new FormData(event.currentTarget)
    try{
      if(!state.current)state.current={key:crypto.randomUUID(),session:null}
      setNumber(await sendInquiry(state.current,{type:'contact',name:form.get('name'),email:form.get('email'),description:form.get('description'),privacy:form.get('privacy')==='on',website:form.get('website')},[]))
    }catch(e){setError(e instanceof Error?e.message:'Nie udało się wysłać wiadomości. Spróbuj ponownie.')}finally{setBusy(false)}
  }
  if(number)return <div className="form-success" role="status"><CheckCircle2 size={30}/><h3>Dziękujemy za wiadomość.</h3><p>Numer zapytania: <strong>{number}</strong>. Zachowaj numer zapytania.</p></div>
  return <form onSubmit={submit} className="contact-form"><div className="field"><label htmlFor="contact-name">Jak masz na imię?</label><input id="contact-name" name="name" placeholder="Twoje imię" required minLength={2} maxLength={100} autoComplete="given-name"/></div><div className="field"><label htmlFor="contact-email">Twój e-mail</label><input id="contact-email" name="email" type="email" placeholder="Na ten adres odpowiemy" required maxLength={254} autoComplete="email"/></div><div className="field"><label htmlFor="contact-description">Co chodzi Ci po głowie?</label><textarea id="contact-description" name="description" placeholder="Opisz krótko swój pomysł lub zadaj pytanie…" required minLength={10} maxLength={10000} rows={4}/></div><div className="honeypot" aria-hidden="true"><label>Strona internetowa<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="checkbox-label"><input type="checkbox" name="privacy" required/><span>Zapoznałem/am się z <a href="/prywatnosc" target="_blank">informacją o prywatności</a> i rozumiem, jak będą obsługiwane dane z zapytania.</span></label>{error&&<div className="form-error" role="alert">{error}</div>}<button className="button" disabled={busy}>{busy?'Wysyłanie…':'Wyślij wiadomość'}<ArrowUpRight size={18}/></button><p className="form-note">To początek rozmowy, bez zobowiązań. Cenę i termin ustalimy po poznaniu szczegółów.</p></form>
}
