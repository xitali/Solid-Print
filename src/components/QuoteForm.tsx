'use client'
import { useRef,useState,useEffect } from 'react'
import Link from 'next/link'
import { ArrowUpRight,FileBox,PenTool,Package,UploadCloud,File,Trash2,Eye,RotateCw,CheckCircle2 } from 'lucide-react'
import { MODEL_EXTENSIONS,validateFiles,validateInquiry,previewEligibility,type FileMeta } from '@/lib/rules'
import type { Product,Material } from '@/lib/types'
import { sendInquiry,SubmissionError,type SubmissionState,type SubmissionSession,type UploadItem } from '@/lib/submission'
import dynamic from 'next/dynamic'
const ModelPreview=dynamic(()=>import('./ModelPreview').then(m=>m.ModelPreview),{ssr:false,loading:()=> <div className="model-preview"><div className="preview-message">Uruchamianie podglądu 3D…</div></div>})
type Attachment={id:string;file:globalThis.File;kind:'model'|'reference';progress:number;status:'ready'|'uploading'|'done'|'error';serverId?:number}
export function QuoteForm({initialType='print',product,variant='',materials=[],pickupEnabled=false,application='',initialQuantity=1}:{initialType?:string;product?:Product;variant?:string;materials?:Material[];pickupEnabled?:boolean;application?:string;initialQuantity?:number}){
  const [type,setType]=useState(['print','design','product'].includes(initialType)?initialType:'print')
  const [files,setFiles]=useState<Attachment[]>([]),[dragging,setDragging]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false),[number,setNumber]=useState(''),[preview,setPreview]=useState<Attachment|null>(null)
  const state=useRef<SubmissionState>({key:'',session:null}),formRef=useRef<HTMLFormElement>(null),filesRef=useRef(files)
  filesRef.current=files
  useEffect(()=>{if(number){document.querySelector('.submission-success')?.scrollIntoView({block:'center'});document.querySelector<HTMLElement>('.submission-success h2')?.focus()}},[number])
  const fileMeta=(list:Attachment[]):FileMeta[]=>list.map(f=>({name:f.file.name,size:f.file.size,kind:f.kind}))
  function addFiles(list:FileList|null,kind:'model'|'reference'){
    if(!list||busy)return
    const newFiles=[...files,...Array.from(list).map(file=>({id:crypto.randomUUID(),file,kind,progress:0,status:'ready' as const}))]
    const errors=validateFiles(fileMeta(newFiles));if(errors.length){setError(errors.join(' '));return}
    setError('');setFiles(newFiles);state.current.session=null
  }
  function remove(id:string){if(busy)return;setFiles(f=>f.filter(x=>x.id!==id));state.current.session=null;if(preview?.id===id)setPreview(null)}
  const patchFile=(id:string,patch:Partial<Attachment>)=>setFiles(list=>list.map(f=>f.id===id?{...f,...patch}:f))
  async function upload(file:UploadItem,serverId:number,auth:SubmissionSession){
    patchFile(file.id,{status:'uploading',progress:0,serverId})
    await new Promise<void>((resolve,reject)=>{
      const xhr=new XMLHttpRequest();xhr.open('PUT',`/api/quote/files/${serverId}`);xhr.setRequestHeader('x-upload-token',auth.token);xhr.setRequestHeader('Content-Type','application/octet-stream');xhr.timeout=5*60*1000
      xhr.upload.onprogress=e=>{if(e.lengthComputable)patchFile(file.id,{progress:Math.round(e.loaded/e.total*100)})}
      xhr.onload=()=>{if(xhr.status>=200&&xhr.status<300){patchFile(file.id,{status:'done',progress:100});resolve()}else{let message='Nie udało się przesłać pliku.';let code:string|undefined;try{const result=JSON.parse(xhr.responseText);message=result.error||message;code=result.code}catch{}patchFile(file.id,{status:'error'});reject(new SubmissionError(`${file.file.name}: ${message}`,code))}}
      xhr.onerror=()=>{patchFile(file.id,{status:'error'});reject(new Error('Połączenie zostało przerwane. Wyślij zapytanie ponownie, aby wznowić.'))}
      xhr.ontimeout=()=>{patchFile(file.id,{status:'error'});reject(new Error('Przesyłanie trwało zbyt długo. Spróbuj ponownie.'))};xhr.send(file.file)
    })
  }
  async function submit(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault();if(busy)return;setError('')
    const form=new FormData(event.currentTarget);const data=Object.fromEntries(form.entries());const parsed=validateInquiry({...data,type,quantity:Number(data.quantity),privacy:form.get('privacy')==='on',productId:product?String(product.id):undefined},fileMeta(files))
    if(!parsed.success){setError(parsed.error.issues.some(i=>i.path[0]==='files')?'Dodaj przynajmniej jeden model do wydruku.':parsed.error.issues.some(i=>i.path[0]==='productId')?'Najpierw wybierz produkt z katalogu.':'Sprawdź formularz: uzupełnij imię, poprawny e-mail, opis (minimum 10 znaków) i potwierdzenie prywatności.');return}
    setBusy(true)
    try{
      if(!state.current.key)state.current.key=crypto.randomUUID()
      setNumber(await sendInquiry(state.current,{...parsed.data,website:data.website},files,upload));setPreview(null)
    }catch(e){setError(e instanceof Error?e.message:'Nie udało się wysłać zapytania. Spróbuj ponownie.')}finally{setBusy(false)}
  }
  if(number)return <section className="submission-success" role="status"><CheckCircle2 size={42} strokeWidth={1.2}/><h2 tabIndex={-1}>Twój pomysł jest już u nas.</h2><p>Zapisaliśmy zapytanie. Sprawdzimy szczegóły i skontaktujemy się z Tobą w sprawie ceny oraz terminu.</p><div className="submission-number">{number}</div><p>Zachowaj numer zapytania. Odpowiemy na podany adres e-mail.</p><Link className="text-link" href="/">Wróć do strony głównej <ArrowUpRight size={18}/></Link></section>
  return <form className="quote-form" onSubmit={submit} ref={formRef}>
    <div className="quote-tabs" role="tablist" aria-label="Rodzaj zapytania">{[{value:'print',Icon:FileBox,label:'Mam model'},{value:'design',Icon:PenTool,label:'Mam pomysł'},{value:'product',Icon:Package,label:'Gotowy produkt'}].map(({value,Icon,label})=><button key={value} type="button" role="tab" aria-selected={type===value} disabled={busy} onClick={()=>{setType(value);setError('')}}><Icon size={20}/>{label}</button>)}</div>
    {type==='product'&&<div className="notice">{product?<><strong>{product.title}</strong><br/>Zapytanie o wykonanie gotowego projektu. Wariant i ilość potwierdzimy w ofercie.</>:<>Najpierw <Link className="text-link" href="/projekty">wybierz projekt z katalogu <ArrowUpRight size={15}/></Link>.</>}</div>}
    <fieldset disabled={busy} style={{border:0,padding:0,margin:0,minWidth:0}}>
    <h2 className="form-section-title"><span className="mono">01 /</span>{type==='print'?'Dodaj swój model':'Opowiedz o projekcie'}</h2>
    {type!=='product'&&<>
      <div className={`dropzone ${dragging?'is-dragging':''}`} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);addFiles(e.dataTransfer.files,'model')}}>
        <UploadCloud size={34} strokeWidth={1.2}/><strong>Przeciągnij i upuść pliki tutaj</strong><p>Do 5 modeli · 100 MiB na plik · 250 MiB łącznie</p><label className="button button-outline">Wybierz pliki<input aria-label="Wybierz modele 3D" type="file" accept={MODEL_EXTENSIONS.map(x=>'.'+x).join(',')} multiple onChange={e=>{addFiles(e.target.files,'model');e.target.value=''}}/></label>
      </div>
      <details className="formats-details"><summary>Obsługiwane formaty plików</summary><p>{MODEL_EXTENSIONS.map(x=>'.'+x).join(' · ')}</p></details>
    </>}
    <div className="field"><label htmlFor="description">{type==='print'?'Do czego będzie służył wydruk?':'Opisz swój pomysł lub wymagania'} *</label><textarea id="description" name="description" required minLength={10} maxLength={10000} rows={5} defaultValue={application?`Zastosowanie: ${application}. `:''} placeholder={type==='design'?'Opisz przedmiot, jego zastosowanie, przybliżone wymiary i to, co jest dla Ciebie ważne. Model 3D nie jest wymagany.':'Opisz zastosowanie, ważne wymiary i szczegóły, które pomogą przygotować wycenę.'}/></div>
    <div className="field"><label htmlFor="reference-files">Zdjęcie, szkic lub dokument — opcjonalnie</label><input id="reference-files" type="file" accept=".jpg,.jpeg,.png,.pdf" multiple onChange={e=>{addFiles(e.target.files,'reference');e.target.value=''}}/><span className="form-note">Do 3 plików JPG, PNG lub PDF, maksymalnie po 10 MiB.</span></div>
    {files.length>0&&<div className="file-list" aria-live="polite">{files.map(f=><div key={f.id} className="file-row"><File size={24} strokeWidth={1.2}/><div className="file-row-info"><strong>{f.file.name}</strong><span>{(f.file.size/1024/1024).toFixed(2)} MiB · {f.status==='done'?'Przesłano':f.status==='uploading'?`Wysyłanie ${f.progress}%`:f.status==='error'?'Błąd — ponów wysłanie zapytania':previewEligibility(f.file.name,f.file.size)?'Dostępny podgląd':'Plik zostanie oceniony przez pracownię'}</span>{f.status==='uploading'&&<progress value={f.progress} max={100} aria-label={`Wysyłanie ${f.file.name}`}/>}</div><div className="file-actions">{previewEligibility(f.file.name,f.file.size)&&<button type="button" onClick={()=>setPreview(f)} aria-label={`Podgląd ${f.file.name}`}><Eye size={18}/></button>}{f.status==='error'&&f.serverId&&state.current.session&&<button type="button" aria-label={`Ponów ${f.file.name}`} onClick={async()=>{setBusy(true);try{await upload(f,f.serverId!,state.current.session!);state.current.session!.uploaded.add(f.id);setError('')}catch(e){setError((e as Error).message)}finally{setBusy(false)}}}><RotateCw size={17}/></button>}<button type="button" onClick={()=>remove(f.id)} aria-label={`Usuń ${f.file.name}`}><Trash2 size={17}/></button></div></div>)}</div>}
    {preview&&<ModelPreview key={preview.id} file={preview.file}/>}
    {files.some(f=>f.kind==='model')&&<div className="field" style={{marginTop:25}}><label htmlFor="unit">Jednostka modelu</label><select id="unit" name="unit" defaultValue="unknown"><option value="unknown">Nie wiem — ustalmy to wspólnie</option><option value="mm">Milimetry (mm)</option><option value="cm">Centymetry (cm)</option><option value="m">Metry (m)</option></select><p className="form-note">Podgląd jest orientacyjny. Nie potwierdza wymiarów, skali, ceny ani możliwości wydruku.</p></div>}
    <h2 className="form-section-title"><span className="mono">02 /</span>Szczegóły wykonania</h2>
    {type==='product'&&product?.variants?.length&&<div className="field"><label htmlFor="variant">Wariant produktu *</label><select id="variant" name="variant" required defaultValue={variant||product.variants[0].name}>{product.variants.map(v=><option key={v.name} value={v.name}>{v.name}{v.color&&` / ${v.color}`}</option>)}</select></div>}
    <div className="field-row"><div className="field"><label htmlFor="quantity">Liczba sztuk *</label><input id="quantity" name="quantity" type="number" min={1} max={100000} defaultValue={Math.max(1,Math.min(100000,initialQuantity))} required/></div><div className="field"><label htmlFor="deadline">Oczekiwany termin — opcjonalnie</label><input id="deadline" name="deadline" type="date" min={new Date().toISOString().slice(0,10)}/></div></div>
    <div className="field-row"><div className="field"><label htmlFor="material">Materiał</label><select id="material" name="material"><option>Doradź mi</option>{materials.filter(m=>m.available).map(m=><option key={m.id}>{m.title}</option>)}</select></div><div className="field"><label htmlFor="color">Kolor</label><input id="color" name="color" placeholder="Doradź mi lub wpisz oczekiwania" maxLength={100}/></div></div>
    <div className="field"><label htmlFor="delivery">Sposób odbioru</label><select id="delivery" name="delivery" defaultValue="discuss"><option value="discuss">Ustalmy przy wycenie</option><option value="shipping">Wysyłka</option>{pickupEnabled&&<option value="pickup">Odbiór osobisty</option>}</select></div>
    <h2 className="form-section-title"><span className="mono">03 /</span>Jak możemy się z Tobą skontaktować?</h2>
    <div className="field-row"><div className="field"><label htmlFor="name">Imię *</label><input id="name" name="name" required minLength={2} maxLength={100} autoComplete="given-name" placeholder="Twoje imię"/></div><div className="field"><label htmlFor="email">E-mail *</label><input id="email" name="email" type="email" required maxLength={254} autoComplete="email" placeholder="twoj@email.pl"/></div></div>
    <div className="field-row"><div className="field"><label htmlFor="phone">Telefon — opcjonalnie</label><input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" placeholder="Numer do kontaktu"/></div><div className="field"><label htmlFor="company">Firma — opcjonalnie</label><input id="company" name="company" maxLength={150} autoComplete="organization" placeholder="Nazwa firmy"/></div></div>
    <div className="field"><label htmlFor="nip">NIP — opcjonalnie</label><input id="nip" name="nip" maxLength={30} inputMode="numeric" placeholder="Jeśli pytasz w imieniu firmy"/></div>
    <div className="honeypot" aria-hidden="true"><label>Strona internetowa<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    <label className="checkbox-label"><input type="checkbox" name="privacy" required/><span>Zapoznałem/am się z <a href="/prywatnosc" target="_blank">informacją o prywatności</a> i rozumiem, jak będą obsługiwane dane oraz załączniki z zapytania. *</span></label>
    </fieldset>
    {error&&<div className="form-error" role="alert">{error}</div>}
    <button type="submit" className="button" disabled={busy}>{busy?'Przesyłanie zapytania…':'Wyślij zapytanie'}<ArrowUpRight size={19}/></button><p className="form-note">Przesłanie zapytania nie oznacza złożenia płatnego zamówienia. Cenę i termin potwierdzimy po sprawdzeniu projektu.</p>
  </form>
}
