import { cloudUsage, usageLevel } from '@/lib/usage'

export async function Operations() {
  if(process.env.PLATFORM!=='cloudflare')return <p className="sp-admin-notice">Środowisko lokalne — wskaźniki produkcji Cloudflare są dostępne w panelu wdrożonej strony.</p>
  try {
    const {metrics,states}=await cloudUsage()
    const state=(key:string)=>states.find(s=>s.key===key)
    const scanner=state('scanner'), cleanup=state('cleanup')
    const scannerRecent=scanner && Date.now()-Date.parse(scanner.updated_at)<10*60000
    return <section className="sp-operations" aria-label="Usługi i darmowe limity">
      <h3>Usługi i darmowe limity</h3>
      <div className="sp-admin-grid">{metrics.map(m=>{
        const level=usageLevel(m.used,m.limit)
        const percent=m.used===null?null:Math.round(m.used/m.limit*1000)/10
        return <div className={`sp-admin-card sp-usage-${level}`} key={m.label}>
          <strong>{m.label}</strong><p>{percent===null?'Brak pomiaru':`${percent}% · ${(m.used!/1e6).toFixed(1)} MB / ${(m.limit/1e6).toLocaleString('pl-PL')} MB`}</p>
          {m.used!==null && <progress max={m.limit} value={m.used} aria-label={m.label}/>}
          {(level==='warning'||level==='full')&&<p role="alert">Osiągnięto co najmniej 75% limitu. Usuń zbędne dane lub ogranicz przyjmowanie nowych plików.</p>}
          <small>{m.note}</small>
        </div>
      })}</div>
      <p>Skaner: <strong>{scannerRecent?'połączony':'brak świeżego połączenia — pliki pozostają w kwarantannie'}</strong>{scanner&&` (ostatnio ${new Date(scanner.updated_at).toLocaleString('pl-PL',{timeZone:'Europe/Warsaw'})})`}</p>
      <p>Retencja: {cleanup?`${JSON.parse(cleanup.value).status==='ok'?'ostatnie wykonanie poprawne':'błąd — sprawdź logi'} · ${new Date(cleanup.updated_at).toLocaleString('pl-PL',{timeZone:'Europe/Warsaw'})}`:'brak potwierdzonego wykonania'}</p>
      <p>Poczta: {process.env.MAIL_API_URL?'adapter HTTP skonfigurowany — sprawdź kolejkę':'niepodłączona; zapytania są zapisywane, wiadomości czekają w kolejce'}</p>
      <p className="sp-admin-notice">To wskaźniki tej witryny. R2 może naliczać opłaty po przekroczeniu limitów całego konta, również za operacje. Ruch Workera i operacje D1/R2 sprawdzaj w panelu Cloudflare; brak tych pomiarów tutaj nie oznacza 0%.</p>
      <a href="https://dash.cloudflare.com/" target="_blank" rel="noreferrer">Otwórz zużycie konta Cloudflare ↗</a>
    </section>
  } catch(error) {
    console.error('Nie udało się odczytać limitów Cloudflare:',error instanceof Error?error.message:'unknown')
    return <p className="sp-admin-notice" role="alert">Nie udało się odczytać zużycia i stanu usług. Sprawdź migracje oraz panel Cloudflare. Nie przyjmuj, że dostępny jest cały limit.</p>
  }
}
